import { logout } from "@/app/actions/auth";
import { decryptSession } from "@/lib/auth-utils";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CourseForm from "./CourseForm";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  if (!sessionToken) {
    redirect("/login");
  }

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Fetch all registered Teachers
  const teachersSnap = await db.collection("users").where("role", "==", "TEACHER").get();
  const teachers = teachersSnap.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    email: doc.data().email,
  }));

  // Sort teachers locally by createdAt desc (if needed, but optional since just for dropdown)
  
  // 2. Fetch all existing Courses
  const coursesSnap = await db.collection("courses").get();
  let courses = [] as any[];
  
  for (const doc of coursesSnap.docs) {
    const courseData = doc.data();
    
    // Fetch Teacher details
    let teacher = { name: "Unknown", email: "" };
    if (courseData.teacherId) {
      const teacherSnap = await db.collection("users").doc(courseData.teacherId).get();
      if (teacherSnap.exists) {
        teacher = {
          name: teacherSnap.data()?.name,
          email: teacherSnap.data()?.email,
        };
      }
    }
    
    // Fetch enrollments count
    const enrollsSnap = await db.collection("enrollments").where("courseId", "==", doc.id).get();
    
    courses.push({
      id: doc.id,
      ...courseData,
      teacher,
      enrollments: new Array(enrollsSnap.size).fill({ id: "dummy" }) // just for length
    });
  }
  
  // Sort courses by code asc
  courses.sort((a, b) => a.code.localeCompare(b.code));

  // 3. Fetch Platform statistics
  const totalUsersSnap = await db.collection("users").count().get();
  const totalUsers = totalUsersSnap.data().count;
  
  const totalCoursesSnap = await db.collection("courses").count().get();
  const totalCourses = totalCoursesSnap.data().count;

  const initials = session.email.substring(0, 2).toUpperCase();
  const displayName = session.email.split("@")[0];

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <a href="/" className="admin-sidebar-brand">
          <img src="/logo.png" alt="Lagankhel IT Academy Logo" />
          <span className="admin-sidebar-brand-name">LITA Admin</span>
        </a>

        <ul className="admin-sidebar-menu">
          <li>
            <a href="/dashboard/admin" className="admin-sidebar-link active">
              <span>📊</span> Dashboard
            </a>
          </li>
          <li>
            <a href="/academics" className="admin-sidebar-link" target="_blank" rel="noopener noreferrer">
              <span>📖</span> Academics Site
            </a>
          </li>
          <li>
            <a href="/campus-life" className="admin-sidebar-link" target="_blank" rel="noopener noreferrer">
              <span>🏛️</span> Campus Life
            </a>
          </li>
          <li>
            <a href="/" className="admin-sidebar-link">
              <span>🏠</span> Main Website
            </a>
          </li>
        </ul>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">{initials}</div>
            <div className="admin-sidebar-profile-info">
              <span className="admin-sidebar-profile-name">{displayName}</span>
              <span className="admin-sidebar-profile-email">{session.email}</span>
            </div>
          </div>
          <form action={logout}>
            <button className="admin-sidebar-logout-btn" type="submit">
              🚪 Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main content workspace */}
      <div className="admin-main">
        {/* Top Navbar */}
        <header className="admin-navbar">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontSize: "0.7rem",
              backgroundColor: "rgba(27, 94, 32, 0.08)",
              color: "var(--college-primary)",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-full)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              width: "fit-content",
              marginBottom: "0.25rem"
            }}>
              ⚡ Admin Control Panel
            </span>
            <h1 className="admin-navbar-title">LMS Root Administrator</h1>
          </div>

          <div className="admin-navbar-right">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "1.25rem", color: "var(--text-muted)", cursor: "pointer" }}>
              <span>🔍</span>
              <span>🔔</span>
              <span>⚙️</span>
            </div>
          </div>
        </header>

        {/* Content Workspace Area */}
        <main className="admin-content bg-cream-pattern animate-fade-in" style={{ flexGrow: 1 }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>LMS System Administration</h2>
            <p className="text-muted">Monitor LMS performance, manage platform roles, audit security parameters, and toggle globally-shared resources.</p>
          </div>

          {/* Global System Stats (Original Cards) */}
          <div className="grid-cols-3" style={{ marginBottom: "2.5rem" }}>
            <div className="card" style={{ backgroundColor: "white" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>System Health</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--success)" }}>99.98%</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>All core services active and optimal</p>
            </div>
            <div className="card" style={{ backgroundColor: "white" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Platform Users</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--college-primary)" }}>{totalUsers}</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active students, instructors, staff</p>
            </div>
            <div className="card" style={{ backgroundColor: "white" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Total Courses</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--college-primary)" }}>{totalCourses}</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active teaching courses</p>
            </div>
          </div>

          {/* System & Access Grid (Original Layout and Forms) */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            {/* Active Courses Table */}
            <div className="card" style={{ height: "fit-content", backgroundColor: "white" }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: "0 0 1.5rem 0" }}>Active Platform Courses</h3>
              
              {courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📖</div>
                  <h4 style={{ margin: 0, color: "var(--text-muted)" }}>No Courses Available</h4>
                  <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>Use the panel to the right to register a new course.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {courses.map((course) => (
                    <div key={course.id} style={{
                      padding: "1.25rem",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--surface-hover)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--college-primary)", fontWeight: 700, backgroundColor: "rgba(27, 94, 32, 0.08)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                          {course.code}
                        </span>
                        <h4 style={{ margin: "0.5rem 0 0.15rem 0", fontSize: "1rem", color: "var(--college-text)" }}>{course.title}</h4>
                        <p className="text-muted" style={{ margin: 0, fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                          {course.description}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          👨‍🏫 {course.teacher?.name || course.teacher?.email?.split("@")[0]}
                        </span>
                        <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.15rem" }}>
                          👥 {course.enrollments?.length || 0} Enrolled
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Course Creation Form */}
            <CourseForm teachers={teachers} />
          </div>
        </main>
      </div>
    </div>
  );
}
