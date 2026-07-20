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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "2rem" }}>
      <header className="glass-panel" style={{
        padding: "1.25rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        border: "1px solid var(--border)"
      }}>
        <div>
          <span style={{
            fontSize: "0.75rem",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            color: "var(--secondary)",
            fontWeight: 700,
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            👨‍🏫 Teacher Portal
          </span>
          <h1 className="text-h3" style={{ margin: "0.5rem 0 0 0" }}>LMS Instructor Dashboard</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{session.email.split("@")[0]} (Instructor)</div>
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>{session.email}</div>
          </div>
          <form action={logout}>
            <button className="btn btn-secondary" type="submit" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="container" style={{ padding: 0 }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 className="text-h2">Welcome back, Instructor!</h2>
          <p className="text-muted">Manage your student cohorts, view class statistics, edit your course curriculum, and grade submissions.</p>
        </div>

        {/* Analytics Grid */}
        <div className="grid-cols-3" style={{ marginBottom: "2.5rem" }}>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Total Students</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--primary)" }}>{totalStudents}</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active cohort across all classes</p>
          </div>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Active Classes</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--secondary)" }}>{courses.length} Courses</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Instructing on active curriculum</p>
          </div>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Class average progress</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--warning)" }}>{classAverageProgress}%</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Standard learning metric speed</p>
          </div>
        </div>

        {/* Detailed Layout */}
        <TeacherConsole courses={courses} />
      </main>
    </div>
  );
}
