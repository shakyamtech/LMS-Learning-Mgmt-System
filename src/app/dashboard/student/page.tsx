import { logout } from "@/app/actions/auth";
import { decryptSession } from "@/lib/auth-utils";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentConsole from "./StudentConsole";

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  if (!sessionToken) {
    redirect("/login");
  }

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // 1. Fetch active enrollments for this student
  const enrollsSnap = await db.collection("enrollments").where("studentId", "==", session.userId).get();
  const enrollments = [] as any[];
  const enrolledCourseIds = new Set<string>();

  for (const eDoc of enrollsSnap.docs) {
    const eData = eDoc.data();
    enrolledCourseIds.add(eData.courseId);

    const courseSnap = await db.collection("courses").doc(eData.courseId).get();
    if (!courseSnap.exists) continue;
    const courseData = courseSnap.data();

    // Teacher
    let teacher = { name: "Unknown", email: "" };
    if (courseData?.teacherId) {
      const teacherSnap = await db.collection("users").doc(courseData.teacherId).get();
      if (teacherSnap.exists) {
        teacher = {
          name: teacherSnap.data()?.name,
          email: teacherSnap.data()?.email,
        };
      }
    }

    // Assignments & Submissions
    const assignmentsSnap = await db.collection("assignments").where("courseId", "==", courseSnap.id).get();
    const assignments = [] as any[];
    for (const aDoc of assignmentsSnap.docs) {
      const aData = aDoc.data();
      const subsSnap = await db.collection("submissions")
        .where("assignmentId", "==", aDoc.id)
        .where("studentId", "==", session.userId)
        .get();
      const submissions = subsSnap.docs.map(s => ({ id: s.id, ...s.data() }));
      assignments.push({ id: aDoc.id, ...aData, submissions });
    }
    assignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Announcements & Comments
    const announcementsSnap = await db.collection("announcements").where("courseId", "==", courseSnap.id).get();
    const announcements = [] as any[];
    for (const anDoc of announcementsSnap.docs) {
      const anData = anDoc.data();
      
      let author = { name: "Unknown", email: "" };
      if (anData.authorId) {
        const authorSnap = await db.collection("users").doc(anData.authorId).get();
        if (authorSnap.exists) {
          author = { id: authorSnap.id, name: authorSnap.data()?.name, email: authorSnap.data()?.email } as any;
        }
      }

      const commentsSnap = await db.collection("comments").where("announcementId", "==", anDoc.id).get();
      const comments = [] as any[];
      for (const cDoc of commentsSnap.docs) {
        const cData = cDoc.data();
        let commentAuthor = { name: "Unknown", email: "" };
        if (cData.authorId) {
          const cAuthorSnap = await db.collection("users").doc(cData.authorId).get();
          if (cAuthorSnap.exists) {
            commentAuthor = { id: cAuthorSnap.id, name: cAuthorSnap.data()?.name, email: cAuthorSnap.data()?.email } as any;
          }
        }
        comments.push({ id: cDoc.id, ...cData, author: commentAuthor });
      }
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      announcements.push({ id: anDoc.id, ...anData, author, comments });
    }
    announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    enrollments.push({
      id: eDoc.id,
      ...eData,
      course: {
        id: courseSnap.id,
        ...courseData,
        teacher,
        assignments,
        announcements
      }
    });
  }

  enrollments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 2. Fetch all courses the student is NOT enrolled in yet
  const availableCoursesSnap = await db.collection("courses").get();
  const availableCourses = [] as any[];
  
  for (const doc of availableCoursesSnap.docs) {
    if (!enrolledCourseIds.has(doc.id)) {
      const cData = doc.data();
      let teacher = { name: "Unknown", email: "" };
      if (cData.teacherId) {
        const tSnap = await db.collection("users").doc(cData.teacherId).get();
        if (tSnap.exists) {
          teacher = { name: tSnap.data()?.name, email: tSnap.data()?.email };
        }
      }
      availableCourses.push({ id: doc.id, ...cData, teacher });
    }
  }
  availableCourses.sort((a, b) => a.code.localeCompare(b.code));

  // 3. Compute learning stats dynamically
  const activeCount = enrollments.filter((e) => e.progress < 100).length;
  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  // Fetch student name from Firestore
  const studentUserSnap = await db.collection("users").doc(session.userId).get();
  const studentName = studentUserSnap.exists ? (studentUserSnap.data()?.name || session.email.split("@")[0]) : session.email.split("@")[0];

  return (
    <StudentConsole
      enrollments={enrollments}
      availableCourses={availableCourses}
      activeCount={activeCount}
      completedCount={completedCount}
      averageProgress={averageProgress}
      session={{ email: session.email, name: studentName }}
      logout={logout}
    />
  );
}
