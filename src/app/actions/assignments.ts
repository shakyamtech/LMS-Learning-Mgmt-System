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
 * Action: Create a new course assignment (Teacher only)
 */
export async function createAssignment(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return { error: "Unauthorized. Teacher permissions required." };
  }

  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateStr = formData.get("dueDate") as string;

  if (!courseId || !title || !description || !dueDateStr) {
    return { error: "All fields are required." };
  }

  try {
    const courseSnap = await db.collection("courses").doc(courseId).get();
    
    if (!courseSnap.exists || courseSnap.data()?.teacherId !== session.userId) {
      return { error: "Course not found or unauthorized to manage." };
    }

    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) {
      return { error: "Invalid due date format." };
    }

    await db.collection("assignments").add({
      title,
      description,
      dueDate: dueDate.toISOString(),
      courseId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/teacher");
    return { success: true, message: "Assignment created successfully!" };
  } catch (error: any) {
    console.error("Create assignment error:", error);
    return { error: "Failed to create assignment." };
  }
}

/**
 * Action: Submit an assignment (Student only)
 */
export async function submitAssignment(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return { error: "Unauthorized. Student session required." };
  }

  const assignmentId = formData.get("assignmentId") as string;
  const content = formData.get("content") as string;

  if (!assignmentId || !content) {
    return { error: "Content submission cannot be empty." };
  }

  try {
    const assignmentSnap = await db.collection("assignments").doc(assignmentId).get();
    if (!assignmentSnap.exists) {
      return { error: "Assignment not found." };
    }

    const courseId = assignmentSnap.data()?.courseId;

    const enrollmentsRef = db.collection("enrollments");
    const enrollSnapshot = await enrollmentsRef
      .where("courseId", "==", courseId)
      .where("studentId", "==", session.userId)
      .limit(1)
      .get();

    if (enrollSnapshot.empty) {
      return { error: "You are not enrolled in this course." };
    }

    const submissionsRef = db.collection("submissions");
    const subSnap = await submissionsRef
      .where("assignmentId", "==", assignmentId)
      .where("studentId", "==", session.userId)
      .limit(1)
      .get();

    if (!subSnap.empty) {
      // Update existing
      const subId = subSnap.docs[0].id;
      await submissionsRef.doc(subId).update({
        content,
        status: "PENDING",
        grade: null,
        feedback: null,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new
      await submissionsRef.add({
        studentId: session.userId,
        assignmentId,
        content,
        status: "PENDING",
        grade: null,
        feedback: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    revalidatePath("/dashboard/student");
    return { success: true, message: "Assignment submitted successfully!" };
  } catch (error: any) {
    console.error("Submit assignment error:", error);
    return { error: "Failed to upload submission." };
  }
}

/**
 * Action: Grade a student submission (Teacher only)
 */
export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string
) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    throw new Error("Unauthorized. Instructor authorization required.");
  }

  if (grade < 0 || grade > 100) {
    throw new Error("Grade must be between 0 and 100.");
  }

  try {
    const subSnap = await db.collection("submissions").doc(submissionId).get();
    if (!subSnap.exists) {
      throw new Error("Submission not found.");
    }
    
    const assignmentId = subSnap.data()?.assignmentId;
    const assignmentSnap = await db.collection("assignments").doc(assignmentId).get();
    
    if (!assignmentSnap.exists) {
      throw new Error("Assignment not found.");
    }

    const courseId = assignmentSnap.data()?.courseId;
    const courseSnap = await db.collection("courses").doc(courseId).get();

    if (!courseSnap.exists || courseSnap.data()?.teacherId !== session.userId) {
      throw new Error("Unauthorized to grade this assignment.");
    }

    await db.collection("submissions").doc(submissionId).update({
      grade: Math.round(grade),
      feedback,
      status: "GRADED",
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/student");
  } catch (error: any) {
    console.error("Grading error:", error);
    throw new Error(error.message || "Failed to submit grade.");
  }
}
