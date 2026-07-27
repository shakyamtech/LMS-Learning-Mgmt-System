'use server';

import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import { decryptSession } from "@/lib/auth-utils";

export interface AttendanceRecordItem {
  studentId: string;
  studentName: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remark?: string;
}

export interface SaveAttendancePayload {
  courseId: string;
  courseTitle: string;
  date: string; // YYYY-MM-DD
  records: AttendanceRecordItem[];
}

export async function saveDailyAttendance(data: SaveAttendancePayload) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
    return { error: "Unauthorized. Only teachers or admins can mark attendance." };
  }

  if (!data.courseId || !data.date || !data.records || data.records.length === 0) {
    return { error: "Course, date, and student attendance records are required." };
  }

  try {
    const attendanceRef = db.collection("attendance");
    // Check if attendance for this course and date already exists
    const snap = await attendanceRef
      .where("courseId", "==", data.courseId)
      .where("date", "==", data.date)
      .get();

    const timestamp = new Date().toISOString();

    if (!snap.empty) {
      // Update existing record
      const docId = snap.docs[0].id;
      await attendanceRef.doc(docId).update({
        records: data.records,
        updatedAt: timestamp,
        updatedBy: session.userId,
      });
      return { success: true, id: docId, updated: true };
    } else {
      // Create new record
      const docRef = await attendanceRef.add({
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        date: data.date,
        teacherId: session.userId,
        records: data.records,
        createdAt: timestamp,
      });
      return { success: true, id: docRef.id, updated: false };
    }
  } catch (error) {
    console.error("Save attendance error:", error);
    return { error: "Failed to save attendance." };
  }
}

export async function getAttendanceByCourse(courseId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  try {
    const snap = await db.collection("attendance")
      .where("courseId", "==", courseId)
      .get();

    const logs = snap.docs.map(doc => ({
      id: doc.id,
      courseId: doc.data().courseId as string,
      courseTitle: doc.data().courseTitle as string,
      date: doc.data().date as string,
      teacherId: doc.data().teacherId as string,
      records: (doc.data().records || []) as AttendanceRecordItem[],
      createdAt: doc.data().createdAt as string,
    }));

    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { logs };
  } catch (error) {
    console.error("Get course attendance error:", error);
    return { error: "Failed to fetch attendance logs." };
  }
}

export async function getStudentAttendance(studentId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  try {
    // Fetch all attendance documents and filter records where studentId matches
    const snap = await db.collection("attendance").get();

    const studentLogs: Array<{
      id: string;
      courseId: string;
      courseTitle: string;
      date: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      remark?: string;
    }> = [];

    snap.docs.forEach(doc => {
      const data = doc.data();
      const records = (data.records || []) as AttendanceRecordItem[];
      const studentRec = records.find(r => r.studentId === studentId);
      if (studentRec) {
        studentLogs.push({
          id: doc.id,
          courseId: data.courseId,
          courseTitle: data.courseTitle,
          date: data.date,
          status: studentRec.status,
          remark: studentRec.remark,
        });
      }
    });

    studentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { studentLogs };
  } catch (error) {
    console.error("Get student attendance error:", error);
    return { error: "Failed to fetch student attendance." };
  }
}

export async function markSelfAttendance() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "STUDENT") {
    return { error: "Unauthorized. Only students can mark self attendance." };
  }

  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const studentUserSnap = await db.collection("users").doc(session.userId).get();
    const studentData = studentUserSnap.exists ? studentUserSnap.data() : {};
    const studentName = studentData?.name || session.email.split("@")[0];

    const attendanceRef = db.collection("attendance");
    // Find today's daily attendance entry
    const snap = await attendanceRef
      .where("courseId", "==", "DAILY_ATTENDANCE")
      .where("date", "==", todayDate)
      .get();

    const timestamp = new Date().toISOString();

    if (!snap.empty) {
      const doc = snap.docs[0];
      const records = (doc.data().records || []) as AttendanceRecordItem[];
      
      const existingIdx = records.findIndex(r => r.studentId === session.userId);
      if (existingIdx >= 0) {
        return { success: true, date: todayDate, alreadyMarked: true, status: records[existingIdx].status };
      }

      records.push({
        studentId: session.userId,
        studentName,
        status: "PRESENT",
        remark: "Self Marked Attendance via Dashboard"
      });

      await attendanceRef.doc(doc.id).update({
        records,
        updatedAt: timestamp
      });
      return { success: true, date: todayDate, alreadyMarked: false, status: "PRESENT" };
    } else {
      await attendanceRef.add({
        courseId: "DAILY_ATTENDANCE",
        courseTitle: "Daily Campus Attendance",
        date: todayDate,
        teacherId: "SYSTEM_SELF",
        records: [{
          studentId: session.userId,
          studentName,
          status: "PRESENT",
          remark: "Self Marked Attendance via Dashboard"
        }],
        createdAt: timestamp
      });

      return { success: true, date: todayDate, alreadyMarked: false, status: "PRESENT" };
    }
  } catch (error) {
    console.error("Mark self attendance error:", error);
    return { error: "Failed to mark attendance." };
  }
}
