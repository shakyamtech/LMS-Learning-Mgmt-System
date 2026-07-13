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

export async function createCourse(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized. Admin permissions required." };
  }

  const code = formData.get("code") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const teacherId = formData.get("teacherId") as string;

  if (!code || !title || !description || !teacherId) {
    return { error: "All fields are required." };
  }

  try {
    const coursesRef = db.collection("courses");
    const existingCourseSnap = await coursesRef.where("code", "==", code).get();

    if (!existingCourseSnap.empty) {
      return { error: `A course with code '${code}' already exists.` };
    }

    const teacherSnap = await db.collection("users").doc(teacherId).get();
    
    if (!teacherSnap.exists || teacherSnap.data()?.role !== "TEACHER") {
      return { error: "Invalid instructor selected." };
    }

    await coursesRef.add({
      code,
      title,
      description,
      teacherId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/admin");
    return { success: true, message: "Course created successfully!" };
  } catch (error: any) {
    console.error("Create course error:", error);
    return { error: "Failed to create course. Please try again." };
  }
}

export async function enrollInCourse(courseId: string) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized. Student session required.");
  }

  try {
    const courseSnap = await db.collection("courses").doc(courseId).get();

    if (!courseSnap.exists) {
      throw new Error("Course not found.");
    }

    await db.collection("enrollments").add({
      studentId: session.userId,
      courseId,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/student");
  } catch (error) {
    console.error("Enrollment error:", error);
    throw new Error("Failed to enroll in course.");
  }
}

export async function updateProgress(enrollmentId: string, newProgress: number) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized.");
  }

  if (newProgress < 0 || newProgress > 100) {
    throw new Error("Progress must be between 0 and 100.");
  }

  try {
    await db.collection("enrollments").doc(enrollmentId).update({
      progress: Math.round(newProgress),
      updatedAt: new Date().toISOString()
    });

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/teacher");
  } catch (error) {
    console.error("Progress update error:", error);
    throw new Error("Failed to update progress.");
  }
}
