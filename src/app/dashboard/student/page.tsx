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
    const assignments = [];
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
    const announcements = [];
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
      const comments = [];
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
  const availableCourses = [];
  
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
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            color: "var(--primary)",
            fontWeight: 700,
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            🎓 Student Portal
          </span>
          <h1 className="text-h3" style={{ margin: "0.5rem 0 0 0" }}>LMS Learning Hub</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{session.email.split("@")[0]}</div>
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
          <h2 className="text-h2">Welcome back, Student!</h2>
          <p className="text-muted">Here is an overview of your active courses, learning progress, and pending assignments.</p>
        </div>

        {/* Info Cards Row */}
        <div className="grid-cols-3" style={{ marginBottom: "2.5rem" }}>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Enrolled Courses</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--primary)" }}>{enrollments.length}</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              {activeCount} in-progress, {completedCount} completed
            </p>
          </div>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Average Progress</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--secondary)" }}>{averageProgress}%</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Across all enrolled courses</p>
          </div>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Academic Status</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--warning)" }}>Good Standing</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Connected to Firebase database</p>
          </div>
        </div>

        {/* Detailed Layout - Handled by interactive client StudentConsole */}
        <StudentConsole enrollments={enrollments} availableCourses={availableCourses} />

      </main>
    </div>
  );
}
