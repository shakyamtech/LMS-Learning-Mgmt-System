"use client";

import { updateProgress } from "@/app/actions/courses";
import { createAssignment, gradeSubmission } from "@/app/actions/assignments";
import { createAnnouncement, deleteAnnouncement, createComment } from "@/app/actions/announcements";
import { useState, useTransition, useActionState, useEffect, useRef } from "react";

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

interface TeacherConsoleProps {
  courses: Course[];
}

export default function TeacherConsole({ courses }: TeacherConsoleProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    courses.length > 0 ? courses[0].id : null
  );
  
  // Workspace Tab management: "roster", "assignments", or "announcements"
  const [activeTab, setActiveTab] = useState<"roster" | "assignments" | "announcements">("roster");
  
  // Announcements local state
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [announceState, announceAction, isAnnouncePending] = useActionState(createAnnouncement, null);
  const announceFormRef = useRef<HTMLFormElement>(null);
  
  // Auto collapse announcement creation form
  useEffect(() => {
    if (announceState?.success) {
      setShowAnnounceForm(false);
      announceFormRef.current?.reset();
    }
  }, [announceState]);

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
  
  // Roster slider states
  const [localProgress, setLocalProgress] = useState<Record<string, number>>({});
  const [savingEnrollmentId, setSavingEnrollmentId] = useState<string | null>(null);
  
  // Grading states
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<string, number>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // Form action for Assignment Creation
  const [createState, createAction, isCreatingPending] = useActionState(createAssignment, null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const createFormRef = useRef<HTMLFormElement>(null);

  // Auto-collapse creation form upon successful completion
  useEffect(() => {
    if (createState?.success) {
      setShowCreateForm(false);
      createFormRef.current?.reset();
    }
  }, [createState]);

  const handleSliderChange = (enrollmentId: string, value: number) => {
    setLocalProgress((prev) => ({
      ...prev,
      [enrollmentId]: value,
    }));
  };

  const handleApplyProgress = (enrollmentId: string, progressValue: number) => {
    setError(null);
    setSavingEnrollmentId(enrollmentId);

    startTransition(async () => {
      try {
        await updateProgress(enrollmentId, progressValue);
        setLocalProgress((prev) => {
          const updated = { ...prev };
          delete updated[enrollmentId];
          return updated;
        });
      } catch (err: any) {
        setError(err.message || "Failed to update progress.");
      } finally {
        setSavingEnrollmentId(null);
      }
    });
  };

  const handleGradeSubmit = (submissionId: string) => {
    setError(null);
    const score = gradeInputs[submissionId];
    const comments = feedbackInputs[submissionId] || "";

    if (score === undefined || score < 0 || score > 100) {
      setError("Please specify a valid grade between 0 and 100.");
      return;
    }

    setGradingSubmissionId(submissionId);
    startTransition(async () => {
      try {
        await gradeSubmission(submissionId, score, comments);
        // Clear inputs on success
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

  if (courses.length === 0) {
    return (
      <div className="card" style={{
        textAlign: "center",
        padding: "4rem 2rem",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)"
      }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>👨‍🏫</div>
        <h3 className="text-h3" style={{ margin: "0 0 0.5rem 0" }}>No Assigned Courses</h3>
        <p className="text-muted" style={{ maxWidth: "450px", margin: "0 auto 1.5rem auto", fontSize: "0.95rem" }}>
          You aren't assigned to teach any active courses. Contact the System Administrator to set up your teaching schedule.
        </p>
      </div>
    );
  }

  // Compile all submissions across all assignments for the currently selected course
  const allSubmissions = selectedCourse
    ? selectedCourse.assignments.flatMap((assignment) =>
        assignment.submissions.map((sub) => ({
          ...sub,
          assignmentTitle: assignment.title,
          dueDate: assignment.dueDate
        }))
      )
    : [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: "2rem" }}>
      {/* Left Sidebar: Course Selection */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 className="text-h3" style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>Courses You Teach</h3>
        {courses.map((course) => {
          const isActive = course.id === selectedCourseId;
          return (
            <button
              key={course.id}
              onClick={() => {
                setSelectedCourseId(course.id);
                setError(null);
                setActiveTab("roster"); // Default tab on change
              }}
              style={{
                width: "100%",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: isActive ? "2px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: isActive ? "var(--surface)" : "var(--background)",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: isActive ? "var(--shadow-md)" : "none",
                transition: "all 0.2s ease-in-out",
                outline: "none"
              }}
              className="course-selector-btn"
            >
              <div className="flex-between" style={{ marginBottom: "0.35rem" }}>
                <span style={{
                  fontSize: "0.7rem",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: 700,
                  backgroundColor: isActive ? "rgba(79, 70, 229, 0.08)" : "rgba(0, 0, 0, 0.03)",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "var(--radius-sm)"
                }}>
                  {course.code}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  👥 {course.enrollments.length} Students
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)" }}>
                {course.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Right Core Console: Managed workspace */}
      <div className="card" style={{ height: "fit-content", padding: "2rem" }}>
        {selectedCourse ? (
          <>
            {/* Header info */}
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
              <div className="flex-between" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{
                  fontSize: "0.75rem",
                  color: "var(--primary)",
                  backgroundColor: "rgba(79, 70, 229, 0.08)",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-sm)"
                }}>
                  {selectedCourse.code} Management Panel
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setActiveTab("roster")}
                    className={`btn ${activeTab === "roster" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderRadius: "var(--radius-sm)" }}
                  >
                    👥 Class Roster
                  </button>
                  <button
                    onClick={() => setActiveTab("assignments")}
                    className={`btn ${activeTab === "assignments" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderRadius: "var(--radius-sm)" }}
                  >
                    📝 Assignments ({selectedCourse.assignments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`btn ${activeTab === "announcements" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderRadius: "var(--radius-sm)" }}
                  >
                    📢 Announcements ({selectedCourse.announcements?.length || 0})
                  </button>
                </div>
              </div>
              <h3 className="text-h3" style={{ margin: "0.75rem 0 0.25rem 0", fontSize: "1.35rem" }}>
                {selectedCourse.title}
              </h3>
              <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4" }}>
                {selectedCourse.description}
              </p>
            </div>

            {error && (
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--error)",
                color: "var(--error)",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                fontWeight: 500
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* TAB 1: CLASS ROSTER */}
            {activeTab === "roster" && (
              <>
                <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600 }}>
                  Roster & Progress Control
                </h4>

                {selectedCourse.enrollments.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "3rem 1rem",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--surface-hover)"
                  }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>😴</div>
                    <h4 style={{ margin: 0, color: "var(--text-muted)" }}>No Students Enrolled</h4>
                    <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                      Students will appear here once they enroll from their dashboard.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {selectedCourse.enrollments.map((enrollment) => {
                      const currentVal =
                        localProgress[enrollment.id] !== undefined
                          ? localProgress[enrollment.id]
                          : enrollment.progress;

                      const isModified = currentVal !== enrollment.progress;
                      const isSaving = savingEnrollmentId === enrollment.id;

                      return (
                        <div key={enrollment.id} style={{
                          padding: "1.25rem",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--background)"
                        }}>
                          <div className="flex-between" style={{ marginBottom: "0.75rem" }}>
                            <div>
                              <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
                                {enrollment.student.name || enrollment.student.email?.split("@")[0]}
                              </h5>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {enrollment.student.email}
                              </span>
                            </div>
                            <span style={{
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              color: currentVal === 100 ? "var(--success)" : "var(--primary)"
                            }}>
                              {currentVal}%
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                            <div style={{ flex: 1 }}>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={currentVal}
                                disabled={isPending}
                                onChange={(e) => handleSliderChange(enrollment.id, parseInt(e.target.value))}
                                style={{
                                  width: "100%",
                                  accentColor: currentVal === 100 ? "var(--success)" : "var(--primary)",
                                  height: "6px",
                                  borderRadius: "var(--radius-full)",
                                  cursor: isPending ? "not-allowed" : "pointer"
                                }}
                              />
                            </div>

                            <button
                              className={`btn ${isModified ? "btn-primary" : "btn-secondary"}`}
                              disabled={!isModified || isPending}
                              onClick={() => handleApplyProgress(enrollment.id, currentVal)}
                              style={{
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.75rem",
                                minWidth: "75px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.25rem"
                              }}
                            >
                              {isSaving ? (
                                <span className="spinner" style={{
                                  width: "10px",
                                  height: "10px",
                                  border: "1.5px solid rgba(255, 255, 255, 0.3)",
                                  borderTop: "1.5px solid white",
                                  borderRadius: "50%",
                                  animation: "spin 0.6s linear infinite"
                                }} />
                              ) : isModified ? (
                                "Apply"
                              ) : (
                                "Saved"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: ASSIGNMENTS & GRADING */}
            {activeTab === "assignments" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                
                {/* Course Assignments Header */}
                <div>
                  <div className="flex-between" style={{ marginBottom: "1rem" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Active Course Assignments</h4>
                    <button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="btn btn-secondary"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                    >
                      {showCreateForm ? "Cancel" : "✨ New Assignment"}
                    </button>
                  </div>

                  {/* Create Assignment Form */}
                  {showCreateForm && (
                    <form
                      ref={createFormRef}
                      action={createAction}
                      className="glass-panel"
                      style={{
                        padding: "1.25rem",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        marginBottom: "1.5rem",
                        backgroundColor: "var(--surface-hover)"
                      }}
                    >
                      <input type="hidden" name="courseId" value={selectedCourse.id} />
                      
                      {createState?.error && (
                        <div style={{ color: "var(--error)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                          ⚠️ {createState.error}
                        </div>
                      )}

                      <div className="input-group">
                        <label className="input-label" htmlFor="title" style={{ fontSize: "0.8rem" }}>Assignment Title</label>
                        <input
                          className="input-field"
                          type="text"
                          id="title"
                          name="title"
                          placeholder="e.g. Midterm Lab submission"
                          required
                          disabled={isCreatingPending}
                          style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label" htmlFor="description" style={{ fontSize: "0.8rem" }}>Task Details / Prompt</label>
                        <textarea
                          className="input-field"
                          id="description"
                          name="description"
                          placeholder="Outline code instructions or text questions..."
                          required
                          disabled={isCreatingPending}
                          rows={2}
                          style={{ fontFamily: "inherit", resize: "none", padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                        <label className="input-label" htmlFor="dueDate" style={{ fontSize: "0.8rem" }}>Deadline Date</label>
                        <input
                          className="input-field"
                          type="datetime-local"
                          id="dueDate"
                          name="dueDate"
                          required
                          disabled={isCreatingPending}
                          style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                        />
                      </div>

                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={isCreatingPending}
                        style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem" }}
                      >
                        {isCreatingPending ? "Publishing..." : "Publish Assignment"}
                      </button>
                    </form>
                  )}

                  {/* List Assignments */}
                  {selectedCourse.assignments.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: "0.85rem", fontStyle: "italic", margin: 0 }}>
                      No assignments have been published for this course yet.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {selectedCourse.assignments.map((assignment) => (
                        <div key={assignment.id} style={{
                          padding: "1rem",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--background)"
                        }}>
                          <div className="flex-between" style={{ marginBottom: "0.25rem" }}>
                            <h5 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{assignment.title}</h5>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              Deadline: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", lineHeight: 1.4 }}>
                            {assignment.description}
                          </p>
                          <div className="text-muted" style={{ fontSize: "0.75rem", display: "flex", gap: "1rem" }}>
                            <span>📥 {assignment.submissions.length} Submissions</span>
                            <span>⏱️ Published: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submissions Grading Workspace */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600 }}>Student Submissions Inbox</h4>
                  
                  {allSubmissions.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "2rem 1rem",
                      border: "1px dashed var(--border)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--surface-hover)"
                    }}>
                      <span style={{ fontSize: "1.5rem" }}>📭</span>
                      <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                        Inbox is empty. Enrolled students haven't uploaded answers to any published tasks yet.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {allSubmissions.map((submission) => {
                        const isGraded = submission.status === "GRADED";
                        const isGradingPending = gradingSubmissionId === submission.id;
                        
                        // Current values bound to state or DB
                        const scoreVal = gradeInputs[submission.id] !== undefined 
                          ? gradeInputs[submission.id] 
                          : (submission.grade ?? "");
                          
                        const feedbackVal = feedbackInputs[submission.id] !== undefined 
                          ? feedbackInputs[submission.id] 
                          : (submission.feedback ?? "");

                        const isModified = 
                          gradeInputs[submission.id] !== undefined || 
                          feedbackInputs[submission.id] !== undefined;

                        return (
                          <div key={submission.id} style={{
                            padding: "1.25rem",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "var(--surface-hover)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem"
                          }}>
                            <div className="flex-between">
                              <div>
                                <span style={{
                                  fontSize: "0.7rem",
                                  backgroundColor: "var(--background)",
                                  border: "1px solid var(--border)",
                                  padding: "0.1rem 0.4rem",
                                  borderRadius: "var(--radius-sm)",
                                  color: "var(--text-muted)",
                                  fontWeight: 600
                                }}>
                                  {submission.assignmentTitle}
                                </span>
                                <h5 style={{ margin: "0.35rem 0 0 0", fontSize: "0.95rem", fontWeight: 600 }}>
                                  {submission.student.name || submission.student.email?.split("@")[0]}
                                </h5>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{submission.student.email}</span>
                              </div>
                              
                              <span style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                padding: "0.15rem 0.5rem",
                                borderRadius: "var(--radius-sm)",
                                backgroundColor: isGraded ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                color: isGraded ? "var(--success)" : "var(--warning)"
                              }}>
                                {isGraded ? `Graded: ${submission.grade}%` : "Pending Review"}
                              </span>
                            </div>

                            {/* Submission Text content */}
                            <div style={{
                              padding: "0.75rem 1rem",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor: "var(--background)",
                              borderLeft: "3px solid var(--primary)",
                              fontSize: "0.85rem",
                              lineHeight: 1.4,
                              whiteSpace: "pre-wrap",
                              fontFamily: "monospace",
                              color: "var(--text-main)"
                            }}>
                              {submission.content}
                            </div>

                            {/* Grading Inputs Form */}
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "100px 1fr 100px",
                              gap: "1rem",
                              alignItems: "flex-end",
                              marginTop: "0.5rem"
                            }}>
                              <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Score (0-100)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={scoreVal}
                                  onChange={(e) => setGradeInputs(prev => ({ ...prev, [submission.id]: parseInt(e.target.value) || 0 }))}
                                  placeholder="Grade"
                                  disabled={isPending}
                                  className="input-field"
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: "34px" }}
                                />
                              </div>

                              <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Instructor Comments</label>
                                <input
                                  type="text"
                                  value={feedbackVal}
                                  onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [submission.id]: e.target.value }))}
                                  placeholder="Leave positive feedback, critiques..."
                                  disabled={isPending}
                                  className="input-field"
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.8rem", height: "34px" }}
                                />
                              </div>

                              <button
                                onClick={() => handleGradeSubmit(submission.id)}
                                disabled={!isModified || isPending}
                                className={`btn ${isModified ? "btn-primary" : "btn-secondary"}`}
                                style={{
                                  height: "34px",
                                  fontSize: "0.75rem",
                                  padding: "0 0.75rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "0.25rem"
                                }}
                              >
                                {isGradingPending ? (
                                  <span className="spinner" style={{
                                    width: "10px",
                                    height: "10px",
                                    border: "1.5px solid rgba(255, 255, 255, 0.3)",
                                    borderTop: "1.5px solid white",
                                    borderRadius: "50%",
                                    animation: "spin 0.6s linear infinite"
                                  }} />
                                ) : isGraded ? (
                                  isModified ? "Update" : "Graded"
                                ) : (
                                  "Submit"
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ANNOUNCEMENTS */}
            {activeTab === "announcements" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                
                {/* Header */}
                <div className="flex-between" style={{ marginBottom: "1rem" }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Published Course Announcements</h4>
                  <button
                    onClick={() => setShowAnnounceForm(!showAnnounceForm)}
                    className="btn btn-secondary"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                  >
                    {showAnnounceForm ? "Cancel" : "✨ New Announcement"}
                  </button>
                </div>

                {/* Form to Create Announcement */}
                {showAnnounceForm && (
                  <form
                    ref={announceFormRef}
                    action={announceAction}
                    className="glass-panel"
                    style={{
                      padding: "1.25rem",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "1.5rem",
                      backgroundColor: "var(--surface-hover)"
                    }}
                  >
                    <input type="hidden" name="courseId" value={selectedCourse.id} />
                    
                    {announceState?.error && (
                      <div style={{ color: "var(--error)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                        ⚠️ {announceState.error}
                      </div>
                    )}

                    <div className="input-group">
                      <label className="input-label" htmlFor="announce-title" style={{ fontSize: "0.8rem" }}>Announcement Title</label>
                      <input
                        className="input-field"
                        type="text"
                        id="announce-title"
                        name="title"
                        placeholder="e.g. Welcome to the class & Syllabus details"
                        required
                        disabled={isAnnouncePending}
                        style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                      <label className="input-label" htmlFor="announce-content" style={{ fontSize: "0.8rem" }}>Announcement Content</label>
                      <textarea
                        className="input-field"
                        id="announce-content"
                        name="content"
                        placeholder="Post announcements, study resources details, or general news..."
                        required
                        disabled={isAnnouncePending}
                        rows={4}
                        style={{ fontFamily: "inherit", resize: "none", padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                      />
                    </div>

                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={isAnnouncePending}
                      style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem" }}
                    >
                      {isAnnouncePending ? "Publishing..." : "Publish Announcement"}
                    </button>
                  </form>
                )}

                {/* Announcement List */}
                {!selectedCourse.announcements || selectedCourse.announcements.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "3rem 1rem",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--surface-hover)"
                  }}>
                    <span style={{ fontSize: "2rem" }}>📢</span>
                    <p className="text-muted" style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
                      No announcements have been published for this course yet.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {selectedCourse.announcements.map((announcement) => (
                      <div key={announcement.id} style={{
                        padding: "1.5rem",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--background)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem"
                      }}>
                        {/* Header details */}
                        <div className="flex-between">
                          <div>
                            <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
                              {announcement.title}
                            </h5>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              By {announcement.author.name || announcement.author.email?.split("@")[0]} ({announcement.author.email}) &bull; {new Date(announcement.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            disabled={isPending}
                            className="btn btn-secondary"
                            style={{
                              padding: "0.35rem 0.5rem",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--error)",
                              backgroundColor: "rgba(239, 68, 68, 0.05)",
                              border: "1px solid rgba(239, 68, 68, 0.15)",
                              cursor: "pointer",
                              fontSize: "0.75rem"
                            }}
                            title="Delete Announcement"
                          >
                            🗑️ Delete
                          </button>
                        </div>

                        {/* Content */}
                        <p style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          lineHeight: "1.5",
                          whiteSpace: "pre-wrap",
                          color: "var(--text-main)"
                        }}>
                          {announcement.content}
                        </p>

                        {/* Collapsible Discussion Thread */}
                        <div style={{
                          borderTop: "1px solid var(--border)",
                          paddingTop: "1rem",
                          backgroundColor: "var(--surface-hover)",
                          margin: "0.5rem -1.5rem -1.5rem -1.5rem",
                          padding: "1rem 1.5rem",
                          borderRadius: "0 0 var(--radius-md) var(--radius-md)"
                        }}>
                          <h6 style={{ margin: "0 0 0.75rem 0", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            💬 Discussion Q&A ({announcement.comments?.length || 0})
                          </h6>

                          {/* Comments list */}
                          {!announcement.comments || announcement.comments.length === 0 ? (
                            <p className="text-muted" style={{ margin: 0, fontSize: "0.8rem", fontStyle: "italic", paddingBottom: "0.5rem" }}>
                              No replies in this thread yet.
                            </p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                              {announcement.comments.map((comment) => (
                                <div key={comment.id} style={{
                                  padding: "0.75rem",
                                  borderRadius: "var(--radius-sm)",
                                  backgroundColor: "var(--background)",
                                  border: "1px solid var(--border)",
                                  fontSize: "0.85rem"
                                }}>
                                  <div className="flex-between" style={{ marginBottom: "0.25rem" }}>
                                    <strong style={{ color: "var(--text-main)" }}>
                                      {comment.author.name || comment.author.email?.split("@")[0]}
                                    </strong>
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, color: "var(--text-main)", lineHeight: 1.4 }}>
                                    {comment.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Post comment reply */}
                          <form onSubmit={handleCommentSubmit} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                            <input type="hidden" name="announcementId" value={announcement.id} />
                            <input
                              type="text"
                              name="content"
                              placeholder="Write a reply, answer questions..."
                              required
                              disabled={isPending}
                              className="input-field"
                              style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem", height: "34px", flex: 1 }}
                            />
                            <button
                              type="submit"
                              disabled={isPending}
                              className="btn btn-primary"
                              style={{ padding: "0 0.75rem", fontSize: "0.75rem", height: "34px" }}
                            >
                              Post Reply
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

      <style jsx global>{`
        .course-selector-btn:hover {
          background-color: var(--surface-hover) !important;
          transform: translateX(2px);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
