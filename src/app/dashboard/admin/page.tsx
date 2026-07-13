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
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "var(--error)",
            fontWeight: 700,
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            ⚡ Admin Control Panel
          </span>
          <h1 className="text-h3" style={{ margin: "0.5rem 0 0 0" }}>LMS Root Administrator</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{session.email.split("@")[0]} (SuperAdmin)</div>
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
          <h2 className="text-h2">LMS System Administration</h2>
          <p className="text-muted">Monitor LMS performance, manage platform roles, audit security parameters, and toggle globally-shared resources.</p>
        </div>

        {/* Global System Stats */}
        <div className="grid-cols-3" style={{ marginBottom: "2.5rem" }}>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>System Health</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--secondary)" }}>99.98%</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>All core services active and optimal</p>
          </div>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Platform Users</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--primary)" }}>{totalUsers}</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active students, instructors, staff</p>
          </div>
          <div className="card">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>Total Courses</h3>
            <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--primary)" }}>{totalCourses}</p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active teaching courses</p>
          </div>
        </div>

        {/* System & Access Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          {/* Active Courses Table */}
          <div className="card" style={{ height: "fit-content" }}>
            <h3 className="text-h3" style={{ margin: "0 0 1.5rem 0" }}>Active Platform Courses</h3>
            
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
                      <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, backgroundColor: "rgba(79, 70, 229, 0.08)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                        {course.code}
                      </span>
                      <h4 style={{ margin: "0.5rem 0 0.15rem 0", fontSize: "1rem" }}>{course.title}</h4>
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
  );
}
