"use server";

import { db } from "@/lib/firebase";
import { decryptSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to get active user session
async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return await decryptSession(token);
}

/**
 * Action: Create a new course announcement (Teacher only)
 */
export async function createAnnouncement(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return { error: "Unauthorized. Instructor credentials required." };
  }

  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!courseId || !title || !content) {
    return { error: "Title and announcement content are required." };
  }

  try {
    const courseSnap = await db.collection("courses").doc(courseId).get();
    if (!courseSnap.exists || courseSnap.data()?.teacherId !== session.userId) {
      return { error: "Course not found or unauthorized to manage." };
    }

    await db.collection("announcements").add({
      title,
      content,
      courseId,
      authorId: session.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/student");
    return { success: true, message: "Announcement published successfully!" };
  } catch (error: any) {
    console.error("Create announcement error:", error);
    return { error: "Failed to publish announcement." };
  }
}

/**
 * Action: Delete a course announcement (Teacher only)
 */
export async function deleteAnnouncement(announcementId: string) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    throw new Error("Unauthorized. Instructor credentials required.");
  }

  if (!announcementId) {
    throw new Error("Announcement ID is required.");
  }

  try {
    const announcementSnap = await db.collection("announcements").doc(announcementId).get();

    if (!announcementSnap.exists) {
      throw new Error("Announcement not found.");
    }

    const courseId = announcementSnap.data()?.courseId;
    const courseSnap = await db.collection("courses").doc(courseId).get();

    if (!courseSnap.exists || courseSnap.data()?.teacherId !== session.userId) {
      throw new Error("Unauthorized to delete this announcement.");
    }

    await db.collection("announcements").doc(announcementId).delete();

    // Optionally delete comments for this announcement
    const commentsSnap = await db.collection("comments").where("announcementId", "==", announcementId).get();
    const batch = db.batch();
    commentsSnap.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error: any) {
    console.error("Delete announcement error:", error);
    throw new Error(error.message || "Failed to delete announcement.");
  }
}

/**
 * Action: Post a comment response to an announcement (Student or Teacher)
 */
export async function createComment(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized. Session expired." };
  }

  const announcementId = formData.get("announcementId") as string;
  const content = formData.get("content") as string;

  if (!announcementId || !content) {
    return { error: "Comment text cannot be empty." };
  }

  try {
    const announcementSnap = await db.collection("announcements").doc(announcementId).get();

    if (!announcementSnap.exists) {
      return { error: "Announcement target not found." };
    }

    const courseId = announcementSnap.data()?.courseId;
    const courseSnap = await db.collection("courses").doc(courseId).get();
    
    let isTeacherOfCourse = false;
    if (courseSnap.exists) {
      isTeacherOfCourse = courseSnap.data()?.teacherId === session.userId;
    }

    let isEnrolledStudent = false;
    const enrollmentsSnap = await db.collection("enrollments")
      .where("courseId", "==", courseId)
      .where("studentId", "==", session.userId)
      .limit(1)
      .get();
      
    if (!enrollmentsSnap.empty) {
      isEnrolledStudent = true;
    }

    if (!isTeacherOfCourse && !isEnrolledStudent) {
      return { error: "Unauthorized. You are not enrolled in this course." };
    }

    await db.collection("comments").add({
      content,
      announcementId,
      authorId: session.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/student");
    return { success: true, message: "Comment posted!" };
  } catch (error: any) {
    console.error("Create comment error:", error);
    return { error: "Failed to post comment reply." };
  }
}
