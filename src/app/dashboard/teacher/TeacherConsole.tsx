"use client";

import { updateProgress } from "@/app/actions/courses";
import { createAssignment, gradeSubmission } from "@/app/actions/assignments";
import { createAnnouncement, deleteAnnouncement, createComment } from "@/app/actions/announcements";
import { useState, useTransition, useActionState, useEffect, useRef } from "react";
import Link from "next/link";

interface Student {
  id: string;
  name: string | null;
  email: string | null;
}

interface Enrollment {
  id: string;
  progress: number;
  grade: string | null;
  student: Student;
}

interface Submission {
  id: string;
  studentId: string;
  content: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  createdAt: any;
  student: Student;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: any;
  submissions: Submission[];
  createdAt: any;
}

interface Comment {
  id: string;
  content: string;
  createdAt: any;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
  comments: Comment[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  enrollments: Enrollment[];
  assignments: Assignment[];
  announcements: Announcement[];
}

interface Session {
  email: string;
  name?: string;
}

interface TeacherConsoleProps {
  courses: Course[];
  totalStudents?: number;
  classAverageProgress?: number;
  session?: Session;
  logout?: (formData: FormData) => void;
}

export default function TeacherConsole({
  courses,
  totalStudents = 0,
  classAverageProgress = 0,
  session,
  logout
}: TeacherConsoleProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    courses.length > 0 ? courses[0].id : null
  );

  const [activeConsoleTab, setActiveConsoleTab] = useState<"dashboard" | "courses" | "assignments" | "announcements">("dashboard");
  const [activeTab, setActiveTab] = useState<"roster" | "assignments" | "announcements">("roster");

  // Roster progress local state
  const [localProgress, setLocalProgress] = useState<{ [enrollmentId: string]: number }>({});
  const [savingEnrollmentId, setSavingEnrollmentId] = useState<string | null>(null);

  // Assignment creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createState, createAction, isCreatePending] = useActionState(createAssignment, null);
  const createFormRef = useRef<HTMLFormElement>(null);

  // Announcements state
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [announceState, announceAction, isAnnouncePending] = useActionState(createAnnouncement, null);
  const announceFormRef = useRef<HTMLFormElement>(null);

  // Grading state
  const [gradeInputs, setGradeInputs] = useState<{ [submissionId: string]: string }>({});
  const [feedbackInputs, setFeedbackInputs] = useState<{ [submissionId: string]: string }>({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (createState?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCreateForm(false);
      createFormRef.current?.reset();
    }
  }, [createState]);

  useEffect(() => {
    if (announceState?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowAnnounceForm(false);
      announceFormRef.current?.reset();
    }
  }, [announceState]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;

  const handleSaveProgress = (enrollmentId: string, currentVal: number) => {
    setError(null);
    setSavingEnrollmentId(enrollmentId);

    startTransition(async () => {
      try {
        await updateProgress(enrollmentId, currentVal);
        setLocalProgress((prev) => {
          const u = { ...prev };
          delete u[enrollmentId];
          return u;
        });
      } catch (err: any) {
        setError(err.message || "Failed to update progress.");
      } finally {
        setSavingEnrollmentId(null);
      }
    });
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteAnnouncement(announcementId);
      } catch (err: any) {
        setError(err.message || "Failed to delete announcement.");
      }
    });
  };

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const res = await createComment(null, formData);
        if (res?.error) {
          setError(res.error);
        } else {
          form.reset();
        }
      } catch (err: any) {
        setError(err.message || "Failed to post comment.");
      }
    });
  };

  const handleGradeSubmit = (submissionId: string) => {
    const scoreStr = gradeInputs[submissionId];
    const comments = feedbackInputs[submissionId] || "";

    if (!scoreStr || isNaN(Number(scoreStr))) {
      setError("Please enter a valid numeric grade.");
      return;
    }

    const score = Number(scoreStr);
    if (score < 0 || score > 100) {
      setError("Grade must be between 0 and 100.");
      return;
    }

    setError(null);
    setGradingSubmissionId(submissionId);

    startTransition(async () => {
      try {
        await gradeSubmission(submissionId, score, comments);
        setGradeInputs((prev) => {
          const u = { ...prev };
          delete u[submissionId];
          return u;
        });
        setFeedbackInputs((prev) => {
          const u = { ...prev };
          delete u[submissionId];
          return u;
        });
      } catch (err: any) {
        setError(err.message || "Failed to submit grade.");
      } finally {
        setGradingSubmissionId(null);
      }
    });
  };

  const teacherDisplayName = session?.name || (session?.email ? session.email.split("@")[0] : "Instructor");
  const initials = teacherDisplayName.substring(0, 2).toUpperCase();

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <Link href="/" className="admin-sidebar-brand">
          <img src="/logo.png" alt="Lagankhel IT Academy Logo" />
          <span className="admin-sidebar-brand-name">LITA Teacher</span>
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
                setActiveTab("roster");
              }}
              className={`admin-sidebar-link ${activeConsoleTab === "courses" ? "active" : ""}`}
            >
              <span>📚</span> My Courses & Roster
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveConsoleTab("assignments");
                setActiveTab("assignments");
              }}
              className={`admin-sidebar-link ${activeConsoleTab === "assignments" ? "active" : ""}`}
            >
              <span>📝</span> Assignments & Grading
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveConsoleTab("announcements");
                setActiveTab("announcements");
              }}
              className={`admin-sidebar-link ${activeConsoleTab === "announcements" ? "active" : ""}`}
            >
              <span>📢</span> Class Announcements
            </a>
          </li>
        </ul>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">{initials}</div>
            <div className="admin-sidebar-profile-info">
              <span className="admin-sidebar-profile-name">{teacherDisplayName}</span>
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
              ⚡ Instructor Control Panel
            </span>
            <h1 className="admin-navbar-title">
              {activeConsoleTab === "dashboard" ? "LMS Instructor Dashboard" :
               activeConsoleTab === "courses" ? "My Courses & Class Roster" :
               activeConsoleTab === "assignments" ? "Assignments & Submission Grading" :
               "Class Broadcast Announcements"}
            </h1>
          </div>
        </header>

        {/* Content Workspace Area */}
        <main className="admin-content bg-cream-pattern animate-fade-in" style={{ flexGrow: 1 }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>
              Welcome back, {teacherDisplayName}!
            </h2>
            <p className="text-muted" style={{ margin: 0 }}>Manage your student cohorts, view class statistics, edit your course curriculum, and grade submissions.</p>
          </div>

          {/* Overview Stat Cards Grid */}
          <div className="grid-cols-3" style={{ marginBottom: "2.5rem" }}>
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Total Students</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--college-primary)" }}>{totalStudents}</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active cohort across assigned classes</p>
            </div>
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Active Classes</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--success)" }}>{courses.length} Courses</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Instructing on active curriculum</p>
            </div>
            <div className="card" style={{ backgroundColor: "white", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Class Average Progress</h3>
              <p className="text-h2" style={{ margin: "0.25rem 0", color: "#b45309" }}>{classAverageProgress}%</p>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Standard learning metric speed</p>
            </div>
          </div>

          {/* Core Workspace Layout */}
          {courses.length === 0 ? (
            <div className="card" style={{
              textAlign: "center",
              padding: "4rem 2rem",
              backgroundColor: "white",
              borderRadius: "var(--radius-lg)"
            }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>👨‍🏫</div>
              <h3 style={{ fontFamily: "Playfair Display, serif", margin: "0 0 0.5rem 0", color: "var(--college-primary)", fontSize: "1.5rem" }}>
                No Assigned Courses
              </h3>
              <p className="text-muted" style={{ maxWidth: "450px", margin: "0 auto 1.5rem auto", fontSize: "0.95rem" }}>
                You aren&apos;t assigned to teach any active courses. Contact the System Administrator to set up your teaching schedule.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: "2rem" }}>
              {/* Left Sidebar: Course Selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>
                  Courses You Teach
                </h3>
                {courses.map((course) => {
                  const isActive = course.id === selectedCourseId;
                  return (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setError(null);
                        setActiveTab("roster");
                      }}
                      style={{
                        width: "100%",
                        padding: "1.25rem",
                        borderRadius: "var(--radius-md)",
                        border: isActive ? "2px solid var(--college-primary)" : "1px solid var(--border)",
                        backgroundColor: isActive ? "#ffffff" : "#f9fafb",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: isActive ? "0 4px 12px rgba(27, 94, 32, 0.12)" : "none",
                        transition: "all 0.2s ease-in-out",
                        outline: "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                        <span style={{
                          fontSize: "0.7rem",
                          color: isActive ? "var(--college-primary)" : "var(--text-muted)",
                          fontWeight: 700,
                          backgroundColor: isActive ? "rgba(27, 94, 32, 0.08)" : "rgba(0, 0, 0, 0.03)",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "var(--radius-sm)"
                        }}>
                          {course.code}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          👥 {course.enrollments.length} Students
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--college-text)" }}>
                        {course.title}
                      </h4>
                    </button>
                  );
                })}
              </div>

              {/* Right Core Console: Managed workspace */}
              <div className="card" style={{ height: "fit-content", padding: "2rem", backgroundColor: "#ffffff" }}>
                {selectedCourse ? (
                  <>
                    {/* Header info */}
                    <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          color: "var(--college-primary)",
                          backgroundColor: "rgba(27, 94, 32, 0.08)",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-sm)"
                        }}>
                          {selectedCourse.code} Management Panel
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => setActiveTab("roster")}
                            style={{
                              padding: "0.4rem 0.85rem",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              borderRadius: "var(--radius-sm)",
                              border: activeTab === "roster" ? "none" : "1px solid #d1d5db",
                              backgroundColor: activeTab === "roster" ? "var(--college-primary)" : "#ffffff",
                              color: activeTab === "roster" ? "#ffffff" : "#374151",
                              cursor: "pointer"
                            }}
                          >
                            👥 Class Roster
                          </button>
                          <button
                            onClick={() => setActiveTab("assignments")}
                            style={{
                              padding: "0.4rem 0.85rem",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              borderRadius: "var(--radius-sm)",
                              border: activeTab === "assignments" ? "none" : "1px solid #d1d5db",
                              backgroundColor: activeTab === "assignments" ? "var(--college-primary)" : "#ffffff",
                              color: activeTab === "assignments" ? "#ffffff" : "#374151",
                              cursor: "pointer"
                            }}
                          >
                            📝 Assignments ({selectedCourse.assignments.length})
                          </button>
                          <button
                            onClick={() => setActiveTab("announcements")}
                            style={{
                              padding: "0.4rem 0.85rem",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              borderRadius: "var(--radius-sm)",
                              border: activeTab === "announcements" ? "none" : "1px solid #d1d5db",
                              backgroundColor: activeTab === "announcements" ? "var(--college-primary)" : "#ffffff",
                              color: activeTab === "announcements" ? "#ffffff" : "#374151",
                              cursor: "pointer"
                            }}
                          >
                            📢 Announcements ({selectedCourse.announcements?.length || 0})
                          </button>
                        </div>
                      </div>
                      <h3 style={{ fontFamily: "Playfair Display, serif", margin: "0.75rem 0 0.25rem 0", fontSize: "1.5rem", color: "var(--college-primary)" }}>
                        {selectedCourse.title}
                      </h3>
                      <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4" }}>
                        {selectedCourse.description}
                      </p>
                    </div>

                    {error && (
                      <div className="badge badge-pending" style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        marginBottom: "1.5rem",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fca5a5"
                      }}>
                        ⚠️ {error}
                      </div>
                    )}

                    {/* TAB 1: CLASS ROSTER */}
                    {activeTab === "roster" && (
                      <div>
                        <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--college-text)" }}>Enrolled Students & Progress</h4>
                        {selectedCourse.enrollments.length === 0 ? (
                          <p className="text-muted" style={{ fontSize: "0.9rem" }}>No students are enrolled in this course yet.</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {selectedCourse.enrollments.map((e) => {
                              const currentVal = localProgress[e.id] !== undefined ? localProgress[e.id] : e.progress;
                              const isModified = currentVal !== e.progress;
                              const isSaving = savingEnrollmentId === e.id;

                              return (
                                <div key={e.id} style={{
                                  padding: "1rem",
                                  borderRadius: "var(--radius-md)",
                                  border: "1px solid var(--border)",
                                  backgroundColor: "#ffffff",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}>
                                  <div>
                                    <div style={{ fontWeight: 700, color: "var(--college-text)" }}>{e.student.name || "Unknown"}</div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{e.student.email}</div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ textAlign: "right" }}>
                                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--college-primary)" }}>{currentVal}% Progress</div>
                                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Grade: {e.grade || "N/A"}</div>
                                    </div>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={currentVal}
                                      onChange={(evt) => setLocalProgress((prev) => ({ ...prev, [e.id]: parseInt(evt.target.value) || 0 }))}
                                      style={{
                                        width: "65px",
                                        padding: "0.35rem",
                                        borderRadius: "var(--radius-sm)",
                                        border: "1px solid #d1d5db",
                                        fontSize: "0.85rem",
                                        textAlign: "center"
                                      }}
                                    />
                                    {isModified && (
                                      <button
                                        onClick={() => handleSaveProgress(e.id, currentVal)}
                                        disabled={isSaving}
                                        style={{
                                          backgroundColor: "var(--college-primary)",
                                          color: "white",
                                          border: "none",
                                          padding: "0.35rem 0.65rem",
                                          borderRadius: "var(--radius-sm)",
                                          fontSize: "0.75rem",
                                          cursor: "pointer"
                                        }}
                                      >
                                        {isSaving ? "Saving..." : "Save"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: ASSIGNMENTS */}
                    {activeTab === "assignments" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                          <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--college-text)" }}>Course Assignments & Submissions</h4>
                          <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            style={{
                              backgroundColor: "var(--college-primary)",
                              color: "white",
                              border: "none",
                              padding: "0.4rem 0.9rem",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            {showCreateForm ? "Cancel" : "➕ Create Assignment"}
                          </button>
                        </div>

                        {/* Assignment Creation Form */}
                        {showCreateForm && (
                          <form ref={createFormRef} action={createAction} style={{
                            backgroundColor: "#f9fafb",
                            padding: "1.25rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid #e5e7eb",
                            marginBottom: "1.5rem"
                          }}>
                            <input type="hidden" name="courseId" value={selectedCourse.id} />
                            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--college-primary)", marginBottom: "0.75rem" }}>
                              ➕ Create New Assignment
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
                              <input
                                type="text"
                                name="title"
                                placeholder="Assignment Title"
                                required
                                style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                              />
                              <input
                                type="date"
                                name="dueDate"
                                required
                                style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                              />
                            </div>
                            <textarea
                              name="description"
                              placeholder="Assignment instructions..."
                              required
                              rows={2}
                              style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.85rem", marginBottom: "0.75rem" }}
                            />
                            <button
                              type="submit"
                              disabled={isCreatePending}
                              style={{
                                backgroundColor: "var(--college-primary)",
                                color: "white",
                                border: "none",
                                padding: "0.45rem 1.25rem",
                                borderRadius: "var(--radius-sm)",
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                cursor: "pointer"
                              }}
                            >
                              {isCreatePending ? "Creating..." : "Publish Assignment"}
                            </button>
                          </form>
                        )}

                        {/* Assignments & Submissions list */}
                        {selectedCourse.assignments.length === 0 ? (
                          <p className="text-muted" style={{ fontSize: "0.9rem" }}>No assignments created yet.</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {selectedCourse.assignments.map((assignment) => (
                              <div key={assignment.id} style={{
                                padding: "1.25rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#ffffff"
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                  <div>
                                    <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--college-text)" }}>{assignment.title}</h5>
                                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#6b7280" }}>{assignment.description}</p>
                                  </div>
                                  <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(212, 175, 55, 0.15)", color: "#92400e", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                                    Due: {assignment.dueDate ? new Date(assignment.dueDate.seconds ? assignment.dueDate.seconds * 1000 : assignment.dueDate).toLocaleDateString() : "No Date"}
                                  </span>
                                </div>

                                {/* Submissions for this assignment */}
                                <div style={{ marginTop: "1rem", borderTop: "1px dashed #e5e7eb", paddingTop: "0.75rem" }}>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-primary)", marginBottom: "0.5rem" }}>
                                    📥 Submissions ({assignment.submissions.length})
                                  </div>
                                  {assignment.submissions.length === 0 ? (
                                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0 }}>No submissions from students yet.</p>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                      {assignment.submissions.map((sub) => (
                                        <div key={sub.id} style={{
                                          padding: "0.75rem",
                                          borderRadius: "var(--radius-sm)",
                                          border: "1px solid #f3f4f6",
                                          backgroundColor: "#f9fafb"
                                        }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--college-text)" }}>
                                              {sub.student.name || "Student"} ({sub.student.email})
                                            </span>
                                            <span style={{
                                              fontSize: "0.75rem",
                                              padding: "0.15rem 0.45rem",
                                              borderRadius: "var(--radius-sm)",
                                              fontWeight: 700,
                                              backgroundColor: sub.grade !== null ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                              color: sub.grade !== null ? "#059669" : "#d97706"
                                            }}>
                                              {sub.grade !== null ? `Graded: ${sub.grade}/100` : "Pending Grade"}
                                            </span>
                                          </div>

                                          <div style={{ fontSize: "0.8rem", color: "#374151", marginBottom: "0.5rem" }}>
                                            {sub.content}
                                          </div>

                                          {/* Grade Submission Form */}
                                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input
                                              type="number"
                                              placeholder="Grade (0-100)"
                                              value={gradeInputs[sub.id] ?? (sub.grade ?? "")}
                                              onChange={(e) => setGradeInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                              style={{ width: "90px", padding: "0.3rem 0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.8rem" }}
                                            />
                                            <input
                                              type="text"
                                              placeholder="Feedback comment..."
                                              value={feedbackInputs[sub.id] ?? (sub.feedback ?? "")}
                                              onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                              style={{ flex: 1, padding: "0.3rem 0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.8rem" }}
                                            />
                                            <button
                                              onClick={() => handleGradeSubmit(sub.id)}
                                              disabled={gradingSubmissionId === sub.id}
                                              style={{
                                                backgroundColor: "var(--college-primary)",
                                                color: "white",
                                                border: "none",
                                                padding: "0.3rem 0.75rem",
                                                borderRadius: "var(--radius-sm)",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                                cursor: "pointer"
                                              }}
                                            >
                                              {gradingSubmissionId === sub.id ? "Saving..." : "Save Grade"}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: ANNOUNCEMENTS */}
                    {activeTab === "announcements" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                          <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--college-text)" }}>Class Broadcast Announcements</h4>
                          <button
                            onClick={() => setShowAnnounceForm(!showAnnounceForm)}
                            style={{
                              backgroundColor: "var(--college-primary)",
                              color: "white",
                              border: "none",
                              padding: "0.4rem 0.9rem",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            {showAnnounceForm ? "Cancel" : "➕ Post Announcement"}
                          </button>
                        </div>

                        {showAnnounceForm && (
                          <form ref={announceFormRef} action={announceAction} style={{
                            backgroundColor: "#f9fafb",
                            padding: "1.25rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid #e5e7eb",
                            marginBottom: "1.5rem"
                          }}>
                            <input type="hidden" name="courseId" value={selectedCourse.id} />
                            <input
                              type="text"
                              name="title"
                              placeholder="Announcement Title"
                              required
                              style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.85rem", marginBottom: "0.75rem" }}
                            />
                            <textarea
                              name="content"
                              placeholder="Write announcement text..."
                              required
                              rows={3}
                              style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.85rem", marginBottom: "0.75rem" }}
                            />
                            <button
                              type="submit"
                              disabled={isAnnouncePending}
                              style={{
                                backgroundColor: "var(--college-primary)",
                                color: "white",
                                border: "none",
                                padding: "0.45rem 1.25rem",
                                borderRadius: "var(--radius-sm)",
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                cursor: "pointer"
                              }}
                            >
                              {isAnnouncePending ? "Posting..." : "Publish Announcement"}
                            </button>
                          </form>
                        )}

                        {selectedCourse.announcements.length === 0 ? (
                          <p className="text-muted" style={{ fontSize: "0.9rem" }}>No announcements posted yet.</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {selectedCourse.announcements.map((announcement) => (
                              <div key={announcement.id} style={{
                                padding: "1.25rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#ffffff"
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                  <h5 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--college-text)" }}>{announcement.title}</h5>
                                  <button
                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer" }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                                <p style={{ fontSize: "0.85rem", color: "#374151", margin: "0 0 0.75rem 0", lineHeight: "1.5" }}>{announcement.content}</p>

                                {/* Comments Section */}
                                <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-primary)", marginBottom: "0.5rem" }}>
                                    💬 Discussion ({announcement.comments.length})
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                    {announcement.comments.map((comment) => (
                                      <div key={comment.id} style={{ fontSize: "0.8rem", backgroundColor: "#f9fafb", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)" }}>
                                        <span style={{ fontWeight: 700, color: "var(--college-text)", marginRight: "0.5rem" }}>{comment.author.name || "User"}:</span>
                                        <span style={{ color: "#4b5563" }}>{comment.content}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Add Comment */}
                                  <form onSubmit={handleCommentSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                                    <input type="hidden" name="announcementId" value={announcement.id} />
                                    <input
                                      type="text"
                                      name="content"
                                      placeholder="Write a comment..."
                                      required
                                      style={{ flex: 1, padding: "0.35rem 0.65rem", borderRadius: "var(--radius-sm)", border: "1px solid #d1d5db", fontSize: "0.8rem" }}
                                    />
                                    <button
                                      type="submit"
                                      style={{
                                        backgroundColor: "var(--college-primary)",
                                        color: "white",
                                        border: "none",
                                        padding: "0.35rem 0.75rem",
                                        borderRadius: "var(--radius-sm)",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        cursor: "pointer"
                                      }}
                                    >
                                      Reply
                                    </button>
                                  </form>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="text-muted">Select a course from the panel to manage students.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
