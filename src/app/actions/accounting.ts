'use server';

import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import { decryptSession } from "@/lib/auth-utils";

export interface TransactionPayload {
  type: "INCOME" | "EXPENSE" | "STUDENT_FEE";
  title: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  studentId?: string;
  studentName?: string;
  notes?: string;
  setTotalFee?: number;
}

export async function addTransaction(data: TransactionPayload) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!data.title || !data.amount || data.amount <= 0) {
    return { error: "Valid title and positive amount are required." };
  }

  try {
    const timestamp = new Date().toISOString();
    const docRef = await db.collection("transactions").add({
      type: data.type,
      title: data.title,
      amount: data.amount,
      category: data.category,
      paymentMethod: data.paymentMethod,
      date: data.date,
      studentId: data.studentId || null,
      studentName: data.studentName || null,
      notes: data.notes || null,
      createdAt: timestamp,
    });

    // If this is a student fee payment, update the student's paidFee and optionally totalFee in Firestore
    if (data.type === "STUDENT_FEE" && data.studentId) {
      const userRef = db.collection("users").doc(data.studentId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const currentPaid = typeof userSnap.data()?.paidFee === "number" ? userSnap.data()?.paidFee : 0;
        const newPaid = currentPaid + data.amount;
        const updateObj: Record<string, any> = { paidFee: newPaid };
        if (typeof data.setTotalFee === "number" && data.setTotalFee >= 0) {
          updateObj.totalFee = data.setTotalFee;
        }
        await userRef.update(updateObj);
      }
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Add transaction error:", error);
    return { error: "Failed to record transaction." };
  }
}

export async function getTransactions() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const snap = await db.collection("transactions").orderBy("date", "desc").get();
    const transactions = snap.docs.map((doc: any) => ({
      id: doc.id,
      type: doc.data().type as "INCOME" | "EXPENSE" | "STUDENT_FEE",
      title: doc.data().title as string,
      amount: doc.data().amount as number,
      category: doc.data().category as string,
      paymentMethod: doc.data().paymentMethod as string,
      date: doc.data().date as string,
      studentId: doc.data().studentId as string | undefined,
      studentName: doc.data().studentName as string | undefined,
      notes: doc.data().notes as string | undefined,
      createdAt: doc.data().createdAt as string | undefined,
    }));

    return { transactions };
  } catch (error) {
    console.error("Get transactions error:", error);
    return { error: "Failed to fetch transactions." };
  }
}

export async function deleteTransaction(transactionId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!transactionId) return { error: "Transaction ID is required." };

  try {
    const txRef = db.collection("transactions").doc(transactionId);
    const txSnap = await txRef.get();
    if (!txSnap.exists) {
      return { error: "Transaction not found." };
    }

    const txData = txSnap.data();
    
    // Revert student paidFee if it was a student fee payment
    if (txData?.type === "STUDENT_FEE" && txData?.studentId) {
      const userRef = db.collection("users").doc(txData.studentId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const currentPaid = typeof userSnap.data()?.paidFee === "number" ? userSnap.data()?.paidFee : 0;
        const newPaid = Math.max(0, currentPaid - (txData.amount || 0));
        await userRef.update({ paidFee: newPaid });
      }
    }

    await txRef.delete();
    return { success: true };
  } catch (error) {
    console.error("Delete transaction error:", error);
    return { error: "Failed to delete transaction." };
  }
}
