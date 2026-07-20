import { logout } from "@/app/actions/auth";
import { decryptSession } from "@/lib/auth-utils";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TeacherConsole from "./TeacherConsole";

export default async function TeacherDashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  if (!sessionToken) {
    redirect("/login");
  }

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  // 1. Fetch courses taught by this specific teacher
  const coursesSnap = await db.collection("courses").where("teacherId", "==", session.userId).get();
  
  const courses = [] as any[];

  for (const courseDoc of coursesSnap.docs) {
    const courseData = courseDoc.data();
    
    // Fetch Enrollments & Students
    const enrollsSnap = await db.collection("enrollments").where("courseId", "==", courseDoc.id).get();
    const enrollments = [] as any[];
    for (const eDoc of enrollsSnap.docs) {
      const eData = eDoc.data();
      let student = { id: "", name: "Unknown", email: "" };
      if (eData.studentId) {
        const studentSnap = await db.collection("users").doc(eData.studentId).get();
        if (studentSnap.exists) {
          student = {
            id: studentSnap.id,
            name: studentSnap.data()?.name || "Unknown",
            email: studentSnap.data()?.email || "",
          };
        }
      }
      enrollments.push({ id: eDoc.id, ...eData, student });
    }
    enrollments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Fetch Assignments & Submissions
    const assignmentsSnap = await db.collection("assignments").where("courseId", "==", courseDoc.id).get();
    const assignments = [] as any[];
    for (const aDoc of assignmentsSnap.docs) {
      const aData = aDoc.data();
      const subsSnap = await db.collection("submissions").where("assignmentId", "==", aDoc.id).get();
      const submissions = [] as any[];
      for (const sDoc of subsSnap.docs) {
        const sData = sDoc.data();
        let student = { id: "", name: "Unknown", email: "" };
        if (sData.studentId) {
          const studentSnap = await db.collection("users").doc(sData.studentId).get();
          if (studentSnap.exists) {
            student = {
              id: studentSnap.id,
              name: studentSnap.data()?.name || "Unknown",
              email: studentSnap.data()?.email || "",
            };
          }
        }
        submissions.push({ id: sDoc.id, ...sData, student });
      }
      submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      assignments.push({ id: aDoc.id, ...aData, submissions });
    }
    assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Fetch Announcements & Comments
    const announcementsSnap = await db.collection("announcements").where("courseId", "==", courseDoc.id).get();
    const announcements = [] as any[];
    for (const anDoc of announcementsSnap.docs) {
      const anData = anDoc.data();
      
      let author = { id: "", name: "Unknown", email: "" };
      if (anData.authorId) {
        const authorSnap = await db.collection("users").doc(anData.authorId).get();
        if (authorSnap.exists) {
          author = {
            id: authorSnap.id,
            name: authorSnap.data()?.name || "Unknown",
            email: authorSnap.data()?.email || "",
          };
        }
      }

      const commentsSnap = await db.collection("comments").where("announcementId", "==", anDoc.id).get();
      const comments = [] as any[];
      for (const cDoc of commentsSnap.docs) {
        const cData = cDoc.data();
        let commentAuthor = { id: "", name: "Unknown", email: "" };
        if (cData.authorId) {
          const cAuthorSnap = await db.collection("users").doc(cData.authorId).get();
          if (cAuthorSnap.exists) {
            commentAuthor = {
              id: cAuthorSnap.id,
              name: cAuthorSnap.data()?.name || "Unknown",
              email: cAuthorSnap.data()?.email || "",
            };
          }
        }
        comments.push({ id: cDoc.id, ...cData, author: commentAuthor });
      }
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      announcements.push({ id: anDoc.id, ...anData, author, comments });
    }
    announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    courses.push({
      id: courseDoc.id,
      title: courseData.title || "",
      description: courseData.description || "",
      code: courseData.code || "",
      ...courseData,
      enrollments,
      assignments,
      announcements
    });
  }

  courses.sort((a, b) => (a.code || "").localeCompare(b.code || ""));

  // 2. Compute dynamic stats for the active teacher
  const uniqueStudentsSet = new Set(
    courses.flatMap((c) => c.enrollments.map((e: any) => e.studentId))
  );
  const totalStudents = uniqueStudentsSet.size;

  const allEnrollments = courses.flatMap((c) => c.enrollments);
  const classAverageProgress = allEnrollments.length
    ? Math.round(
        allEnrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / allEnrollments.length
      )
    : 0;

  // Fetch teacher name from Firestore
  const teacherUserSnap = await db.collection("users").doc(session.userId).get();
  const teacherName = teacherUserSnap.exists ? (teacherUserSnap.data()?.name || session.email.split("@")[0]) : session.email.split("@")[0];

  return (
    <TeacherConsole
      courses={courses}
      totalStudents={totalStudents}
      classAverageProgress={classAverageProgress}
      session={{ email: session.email, name: teacherName }}
      logout={logout}
    />
  );
}
