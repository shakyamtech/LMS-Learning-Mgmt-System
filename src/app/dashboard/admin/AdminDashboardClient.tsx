'use client';

import React, { useState, useEffect, useRef } from "react";
import CourseForm from "./CourseForm";
import { approveStudent, rejectStudent } from "@/app/actions/auth";

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
}

interface Enrollment {
  studentId: string;
  enrolledAt: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  teacherId: string;
  teacher?: {
    name: string | null;
    email: string | null;
  };
  enrollments?: Enrollment[];
}

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  approved: boolean;
}

interface Session {
  email: string;
}

interface AdminDashboardClientProps {
  teachers: Teacher[];
  courses: Course[];
  students: Student[];
  totalUsers: number;
  totalCourses: number;
  session: Session;
  logout: (formData: FormData) => void;
}

export default function AdminDashboardClient({
  teachers,
  courses,
  students,
  totalUsers,
  totalCourses,
  session,
  logout
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "students">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New student Mahesh Shakya registered", time: "2 minutes ago" },
    { id: 2, title: "Course CS-201 assigned to Teacher Ram", time: "1 hour ago" },
    { id: 3, title: "System Database backup successful", time: "4 hours ago" }
  ]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Sync prop changes if they occur
  useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clear search query when tab changes
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const handleApprove = async (studentId: string) => {
    const res = await approveStudent(studentId);
    if (res?.success) {
      setLocalStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, approved: true } : s))
      );
    } else {
      alert(res?.error || "Failed to approve student.");
    }
  };

  const handleReject = async (studentId: string) => {
    if (!confirm("Are you sure you want to reject and delete this student account?")) return;
    const res = await rejectStudent(studentId);
    if (res?.success) {
      setLocalStudents(prev => prev.filter(s => s.id !== studentId));
    } else {
      alert(res?.error || "Failed to reject student.");
    }
  };

  const initials = session.email.substring(0, 2).toUpperCase();
  const displayName = session.email.split("@")[0];

  // Filter courses based on query
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.code.toLowerCase().includes(query) ||
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      (course.teacher?.name && course.teacher.name.toLowerCase().includes(query)) ||
      (course.teacher?.email && course.teacher.email.toLowerCase().includes(query))
    );
  });

  // Filter students based on query
  const filteredStudents = localStudents.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query))
    );
  });



  const mockSettings = [
    { id: 1, label: "⚙️ System Configuration" },
    { id: 2, label: "🔑 Security & API Keys" },
    { id: 3, label: "📊 Data Export & Analytics" }
  ];

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
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("dashboard");
              }}
              className={`admin-sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <span>📊</span> Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("students");
              }}
              className={`admin-sidebar-link ${activeTab === "students" ? "active" : ""}`}
            >
              <span>👥</span> Students
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
            <h1 className="admin-navbar-title">
              {activeTab === "dashboard" ? "LMS Root Administrator" : "Registered Students"}
            </h1>
          </div>

          <div className="admin-navbar-right" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* Search Input */}
            <div className="admin-navbar-search" style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: "var(--radius-full)",
              padding: "0.4rem 1rem",
              width: "220px",
              gap: "0.5rem"
            }}>
              <input
                type="text"
                placeholder={activeTab === "dashboard" ? "Search courses..." : "Search students..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.85rem",
                  color: "#374151"
                }}
              />
              <span style={{ fontSize: "0.9rem", color: "#9ca3af" }}>🔍</span>
            </div>

            {/* Notification Dropdown Container */}
            <div className="dropdown-container" ref={notificationsRef} style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowSettings(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.35rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Notifications"
              >
                🔔
              </button>
              {notifications.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none"
                }}>
                  {notifications.length}
                </span>
              )}

              {showNotifications && (
                <div className="dropdown-popover">
                  <div className="dropdown-popover-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>System Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      🎉 No new notifications!
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="dropdown-popover-item" style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}>
                        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span className="dropdown-popover-item-title">{notif.title}</span>
                          <span className="dropdown-popover-item-time">🕒 {notif.time}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                          }}
                          style={{
                            background: "#f3f4f6",
                            border: "none",
                            color: "#4b5563",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                            transition: "all 0.2s ease",
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fee2e2";
                            e.currentTarget.style.color = "#ef4444";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.color = "#4b5563";
                          }}
                          title="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Settings Dropdown Container */}
            <div className="dropdown-container" ref={settingsRef}>
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowNotifications(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.35rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Settings"
              >
                ⚙️
              </button>

              {showSettings && (
                <div className="dropdown-popover">
                  <div className="dropdown-popover-header">Quick System Settings</div>
                  {mockSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="dropdown-popover-item"
                      onClick={() => alert(`Redirecting to: ${setting.label}`)}
                    >
                      <span className="dropdown-popover-item-title">{setting.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Workspace Area */}
        <main className="admin-content bg-cream-pattern animate-fade-in" style={{ flexGrow: 1 }}>
          
          {activeTab === "dashboard" ? (
            /* ──── DASHBOARD TAB VIEW ──── */
            <>
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
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: "0 0 1.5rem 0" }}>
                    Active Platform Courses
                    {searchQuery && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({filteredCourses.length} found)</span>}
                  </h3>
                  
                  {filteredCourses.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📖</div>
                      <h4 style={{ margin: 0, color: "var(--text-muted)" }}>
                        {searchQuery ? "No matching courses found" : "No Courses Available"}
                      </h4>
                      <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                        {searchQuery ? "Try altering your search keywords." : "Use the panel to the right to register a new course."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {filteredCourses.map((course) => (
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
            </>
          ) : (
            /* ──── STUDENTS TAB VIEW ──── */
            <>
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>Student Directory</h2>
                <p className="text-muted">Browse all registered students currently enrolled in Lagankhel IT Academy LMS.</p>
              </div>

              <div className="card" style={{ backgroundColor: "white", padding: "2rem" }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: "0 0 1.5rem 0" }}>
                  Active Student Registrations
                  {searchQuery && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({filteredStudents.length} found)</span>}
                </h3>

                {filteredStudents.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
                    <h4 style={{ margin: 0, color: "var(--text-muted)" }}>
                      {searchQuery ? "No matching students found" : "No Registered Students"}
                    </h4>
                    <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                      {searchQuery ? "Check spelling or search terms." : "Student records will show up once users register with the Student role."}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    {filteredStudents.map((student) => {
                      const studentInitials = (student.name || student.email || "ST").substring(0, 2).toUpperCase();
                      return (
                        <div
                          key={student.id}
                          style={{
                            padding: "1.25rem",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "var(--surface-hover)",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem"
                          }}
                        >
                          <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(27, 94, 32, 0.08)",
                            color: "var(--college-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            flexShrink: 0
                          }}>
                            {studentInitials}
                          </div>
                          <div style={{ overflow: "hidden", flexGrow: 1 }}>
                            <h4 style={{ margin: "0 0 0.15rem 0", fontSize: "0.95rem", color: "var(--college-text)", fontWeight: 600 }}>
                              {student.name || "Unnamed Student"}
                            </h4>
                            <p className="text-muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {student.email}
                            </p>
                            
                            {student.approved ? (
                              <>
                                <span style={{
                                  fontSize: "0.65rem",
                                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                                  color: "var(--success)",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "var(--radius-full)",
                                  fontWeight: 700,
                                  textTransform: "uppercase"
                                }}>
                                  🟢 Active Student
                                </span>
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                                  <button
                                    onClick={() => handleReject(student.id)}
                                    style={{
                                      fontSize: "0.7rem",
                                      backgroundColor: "none",
                                      color: "#ef4444",
                                      border: "1px solid #ef4444",
                                      padding: "0.25rem 0.6rem",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      background: "none"
                                    }}
                                  >
                                    Remove Account
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span style={{
                                  fontSize: "0.65rem",
                                  backgroundColor: "rgba(234, 179, 8, 0.1)",
                                  color: "#ca8a04",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "var(--radius-full)",
                                  fontWeight: 700,
                                  textTransform: "uppercase"
                                }}>
                                  🔴 Pending Approval
                                </span>
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                                  <button
                                    onClick={() => handleApprove(student.id)}
                                    style={{
                                      fontSize: "0.7rem",
                                      backgroundColor: "var(--college-primary)",
                                      color: "white",
                                      border: "none",
                                      padding: "0.25rem 0.6rem",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontWeight: 600
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(student.id)}
                                    style={{
                                      fontSize: "0.7rem",
                                      backgroundColor: "#ef4444",
                                      color: "white",
                                      border: "none",
                                      padding: "0.25rem 0.6rem",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontWeight: 600
                                    }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
