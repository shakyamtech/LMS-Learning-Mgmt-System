"use client";

import { useState } from "react";
import Link from "next/link";
import BrowseCourses from "./BrowseCourses";
import StudentAssignments from "./StudentAssignments";
import CourseWorkspace from "./CourseWorkspace";

interface Session {
  email: string;
  name?: string;
}

interface StudentConsoleProps {
  enrollments: any[];
  availableCourses: any[];
  activeCount?: number;
  completedCount?: number;
  averageProgress?: number;
  session?: Session;
  logout?: (formData: FormData) => void;
}

export default function StudentConsole({
  enrollments,
  availableCourses,
  activeCount = 0,
  completedCount = 0,
  averageProgress = 0,
  session,
  logout
}: StudentConsoleProps) {
  const [selectedWorkspaceCourse, setSelectedWorkspaceCourse] = useState<any | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"dashboard" | "courses" | "browse" | "assignments">("dashboard");

  // Synchronize dynamic updates back if selectedWorkspaceCourse changes in db
  const activeCourse = selectedWorkspaceCourse
    ? enrollments.find((e) => e.course.id === selectedWorkspaceCourse.id)?.course
    : null;

  const studentDisplayName = session?.name || (session?.email ? session.email.split("@")[0] : "Student");
  const initials = studentDisplayName.substring(0, 2).toUpperCase();

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <Link href="/" className="admin-sidebar-brand">
          <img src="/logo.png" alt="Lagankhel IT Academy Logo" />
          <span className="admin-sidebar-brand-name">LITA Student</span>
        </Link>

        <ul className="admin-sidebar-menu">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveConsoleTab("dashboard");
              }}
              className={`admin-sidebar-link ${activeConsoleTab === "dashboard" ? "active" : ""}`}
            >
              <span>📊</span> Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveConsoleTab("courses");
              }}
              className={`admin-sidebar-link ${activeConsoleTab === "courses" ? "active" : ""}`}
            >
              <span>📚</span> My Enrolled Courses
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveConsoleTab("browse");
              }}
              className={`admin-sidebar-link ${activeConsoleTab === "browse" ? "active" : ""}`}
            >
              <span>🔍</span> Browse & Enroll Courses
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveConsoleTab("assignments");
              }}
              className={`admin-sidebar-link ${activeConsoleTab === "assignments" ? "active" : ""}`}
            >
              <span>📝</span> My Assignments & Grades
            </a>
          </li>
        </ul>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">{initials}</div>
            <div className="admin-sidebar-profile-info">
              <span className="admin-sidebar-profile-name">{studentDisplayName}</span>
              <span className="admin-sidebar-profile-email">{session?.email || ""}</span>
            </div>
          </div>
          {logout && (
            <form action={logout}>
              <button className="admin-sidebar-logout-btn" type="submit">
                🚪 Logout
              </button>
            </form>
          )}
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
              ⚡ Student Learning Hub
            </span>
            <h1 className="admin-navbar-title">
              {activeConsoleTab === "dashboard" ? "Student Dashboard" :
               activeConsoleTab === "courses" ? "My Enrolled Courses" :
               activeConsoleTab === "browse" ? "Browse & Enroll in Courses" :
               "My Assignments & Grades"}
            </h1>
          </div>
        </header>

        {/* Content Workspace Area */}
        <main className="admin-content bg-cream-pattern animate-fade-in" style={{ flexGrow: 1 }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>
              Welcome back, {studentDisplayName}!
            </h2>
            <p className="text-muted" style={{ margin: 0 }}>Here is an overview of your active courses, learning progress, and pending assignments.</p>
          </div>

          {/* Overview Stat Cards Grid */}
          <div className="grid-cols-3" style={{ marginBottom: "2.5rem" }}>
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Enrolled Courses</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--college-primary)" }}>{enrollments.length}</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                {activeCount} in-progress, {completedCount} completed
              </p>
            </div>
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Average Progress</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--success)" }}>{averageProgress}%</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Across all enrolled courses</p>
            </div>
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Academic Status</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "#b45309" }}>Good Standing</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active student account</p>
            </div>
          </div>

          {/* TAB CONTENT SWITCHER */}
          {activeConsoleTab === "dashboard" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
              {/* Active Courses */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
                  <h3 style={{ fontFamily: "Playfair Display, serif", margin: "0 0 1.25rem 0", fontSize: "1.35rem", color: "var(--college-primary)" }}>
                    Your Active Courses
                  </h3>

                  {enrollments.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      border: "1px dashed #d1d5db",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "#f9fafb"
                    }}>
                      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏫</div>
                      <h4 style={{ margin: 0, fontWeight: 700, color: "var(--college-text)" }}>No Enrolled Courses</h4>
                      <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                        You are not currently taking any classes. Browse available courses to begin!
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {enrollments.map((enrollment) => {
                        const course = enrollment.course;
                        const isCompleted = enrollment.progress === 100;
                        const progressColor = isCompleted ? "var(--success)" : "var(--college-primary)";

                        return (
                          <div
                            key={enrollment.id}
                            onClick={() => setSelectedWorkspaceCourse(course)}
                            style={{
                              padding: "1.25rem",
                              border: "1px solid #e5e7eb",
                              borderRadius: "var(--radius-md)",
                              backgroundColor: "#ffffff",
                              cursor: "pointer",
                              transition: "all 0.2s ease-in-out"
                            }}
                            className="student-course-card"
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{
                                    fontSize: "0.7rem",
                                    color: "var(--college-primary)",
                                    fontWeight: 700,
                                    border: "1px solid rgba(27, 94, 32, 0.2)",
                                    padding: "0.1rem 0.4rem",
                                    borderRadius: "var(--radius-sm)",
                                    backgroundColor: "rgba(27, 94, 32, 0.06)"
                                  }}>
                                    {course.code}
                                  </span>
                                  {isCompleted && (
                                    <span style={{
                                      fontSize: "0.7rem",
                                      color: "#059669",
                                      fontWeight: 700,
                                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                                      padding: "0.1rem 0.4rem",
                                      borderRadius: "var(--radius-sm)"
                                    }}>
                                      Completed
                                    </span>
                                  )}
                                </div>
                                <h4 style={{ margin: "0.35rem 0 0.15rem 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--college-text)" }}>
                                  {course.title}
                                </h4>
                                <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                                  Instructor: <strong>{course.teacher.name || course.teacher.email?.split("@")[0]}</strong> ({course.teacher.email})
                                </p>
                              </div>
                              <span style={{ fontWeight: 700, fontSize: "1.1rem", color: progressColor }}>
                                {enrollment.progress}%
                              </span>
                            </div>

                            <div style={{
                              height: "8px",
                              width: "100%",
                              backgroundColor: "#f3f4f6",
                              borderRadius: "var(--radius-full)",
                              overflow: "hidden",
                              marginBottom: "1rem"
                            }}>
                              <div style={{
                                height: "100%",
                                width: `${enrollment.progress}%`,
                                backgroundColor: progressColor,
                                borderRadius: "var(--radius-full)",
                                transition: "width 0.4s ease-out"
                              }} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <span style={{
                                padding: "0.35rem 0.85rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "white",
                                backgroundColor: "var(--college-primary)",
                                borderRadius: "var(--radius-sm)"
                              }}>
                                📢 Open Workspace &rarr;
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Student Assignments summary */}
                <StudentAssignments enrollments={enrollments} />
              </div>

              {/* Sidepanel: Browse Courses */}
              <BrowseCourses courses={availableCourses} />
            </div>
          )}

          {activeConsoleTab === "courses" && (
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", margin: "0 0 1.25rem 0", fontSize: "1.35rem", color: "var(--college-primary)" }}>
                My Enrolled Courses & Learning Workspaces
              </h3>
              {enrollments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <p className="text-muted">You are not enrolled in any courses yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  {enrollments.map((enrollment) => {
                    const course = enrollment.course;
                    return (
                      <div
                        key={enrollment.id}
                        onClick={() => setSelectedWorkspaceCourse(course)}
                        style={{
                          padding: "1.25rem",
                          border: "1px solid #e5e7eb",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "#ffffff",
                          cursor: "pointer"
                        }}
                        className="student-course-card"
                      >
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--college-primary)" }}>
                          {course.code}
                        </span>
                        <h4 style={{ margin: "0.25rem 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--college-text)" }}>
                          {course.title}
                        </h4>
                        <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 0.75rem 0" }}>
                          {course.description}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-primary)" }}>
                            Progress: {enrollment.progress}%
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "var(--college-primary)", fontWeight: 700 }}>
                            Open Workspace &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeConsoleTab === "browse" && (
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <BrowseCourses courses={availableCourses} />
            </div>
          )}

          {activeConsoleTab === "assignments" && (
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <StudentAssignments enrollments={enrollments} />
            </div>
          )}
        </main>
      </div>

      {/* Course Workspace Slide Drawer */}
      {selectedWorkspaceCourse && (
        <CourseWorkspace
          isOpen={selectedWorkspaceCourse !== null}
          onClose={() => setSelectedWorkspaceCourse(null)}
          course={activeCourse || selectedWorkspaceCourse}
        />
      )}

      <style jsx global>{`
        .student-course-card {
          transition: all 0.2s ease-in-out;
        }
        .student-course-card:hover {
          border-color: var(--college-primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(27, 94, 32, 0.12);
        }
      `}</style>
    </div>
  );
}
