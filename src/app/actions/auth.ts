"use server";

import { db } from "@/lib/firebase";
import { encryptSession, decryptSession } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Since we removed Prisma, we'll define Role locally.
export enum Role {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN"
}

// Helper to validate email format
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleInput = formData.get("role") as string;

  if (!name || !email || !password || !roleInput) {
    return { error: "All fields are required." };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const role = roleInput.toUpperCase() as Role;
  if (!Object.values(Role).includes(role)) {
    return { error: "Invalid role selected." };
  }

  let targetPath = "";

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isStudent = role === Role.STUDENT;
    const docRef = await usersRef.add({
      name,
      email,
      password: hashedPassword,
      role: role,
      approved: !isStudent,
      createdAt: new Date().toISOString(),
    });

    if (isStudent) {
      targetPath = "/login?pending=true";
    } else {
      const sessionToken = await encryptSession({
        userId: docRef.id,
        email: email,
        role: role,
      });

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      targetPath = `/dashboard/${role.toLowerCase()}`;
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  if (targetPath) {
    redirect(targetPath);
  }
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  let targetPath = "";

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      return { error: "Invalid email or password." };
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as any;

    if (!user || !user.password) {
      return { error: "Invalid email or password." };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: "Invalid email or password." };
    }

    if (user.role === "STUDENT" && user.approved === false) {
      return { error: "Your account is pending administrator approval." };
    }

    const sessionToken = await encryptSession({
      userId: user.id,
      email: user.email!,
      role: user.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    targetPath = `/dashboard/${user.role.toLowerCase()}`;
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  if (targetPath) {
    redirect(targetPath);
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function approveStudent(studentId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await db.collection("users").doc(studentId).update({ approved: true });
    return { success: true };
  } catch (error: any) {
    console.error("Approve student error:", error);
    return { error: "Failed to approve student." };
  }
}

export async function rejectStudent(studentId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await db.collection("users").doc(studentId).delete();
    return { success: true };
  } catch (error) {
    console.error("Reject student error:", error);
    return { error: "Failed to reject student." };
  }
}

export async function updateUser(userId: string, data: {
  name?: string;
  email?: string;
  role?: string;
  approved?: boolean;
  phone?: string;
  address?: string;
  dob?: string;
  faculty?: string;
  rollNo?: string;
  admissionDate?: string;
  totalFee?: number;
  paidFee?: number;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!userId) return { error: "User ID is required" };

  try {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role.toUpperCase();
    if (data.approved !== undefined) updateData.approved = data.approved;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.dob !== undefined) updateData.dob = data.dob;
    if (data.faculty !== undefined) updateData.faculty = data.faculty;
    if (data.rollNo !== undefined) updateData.rollNo = data.rollNo;
    if (data.admissionDate !== undefined) updateData.admissionDate = data.admissionDate;
    if (data.totalFee !== undefined) updateData.totalFee = data.totalFee;
    if (data.paidFee !== undefined) updateData.paidFee = data.paidFee;

    await db.collection("users").doc(userId).update(updateData);
    return { success: true };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "Failed to update user." };
  }
}

export async function deleteUser(userId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!userId) return { error: "User ID is required" };

  try {
    await db.collection("users").doc(userId).delete();
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user." };
  }
}

