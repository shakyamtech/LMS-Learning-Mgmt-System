"use client";

import { createComment } from "@/app/actions/announcements";
import { useState, useTransition, useEffect, useRef } from "react";
import AssignmentModal from "./AssignmentModal";

interface Student {
  id: string;
  name: string | null;
  email: string | null;
}

interface Submission {
  id: string;
  studentId: string;
  content: string;
  grade: number | null;
  feedback: string | null;
  status: string;
  createdAt: any;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: any;
  submissions: Submission[];
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
  teacher: {
    name: string | null;
    email: string | null;
  };
  assignments: Assignment[];
  announcements: Announcement[];
}

interface CourseWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export default function CourseWorkspace({ isOpen, onClose, course }: CourseWorkspaceProps) {
  const [now] = useState(() => Date.now());
  const [activeTab, setActiveTab] = useState<"announcements" | "assignments">("announcements");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Set body overflow when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  const getStatusBadge = (assignment: Assignment) => {
    const submission = assignment.submissions?.[0] || null;
    if (!submission) {
      const isPastDue = new Date(assignment.dueDate).getTime() < now;
      return (
        <span style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          padding: "0.15rem 0.5rem",
          borderRadius: "var(--radius-sm)",
          backgroundColor: isPastDue ? "rgba(239, 68, 68, 0.1)" : "rgba(100, 116, 139, 0.1)",
          color: isPastDue ? "var(--error)" : "var(--text-muted)"
        }}>
          {isPastDue ? "🔴 Missing" : "📝 Todo"}
        </span>
      );
    }
    if (submission.status === "GRADED") {
      return (
        <span style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          padding: "0.15rem 0.5rem",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          color: "var(--success)"
        }}>
          🎉 Score: {submission.grade}%
        </span>
      );
    }
    return (
      <span style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        padding: "0.15rem 0.5rem",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        color: "var(--warning)"
      }}>
        ⏳ Awaiting Grade
      </span>
    );
  };

  const handleOpenAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(6px)",
      zIndex: 999,
      display: "flex",
      justifyContent: "flex-end",
      animation: "fadeIn 0.2s ease-out"
    }}>
      {/* Backdrop overlay listener */}
      <div 
        onClick={onClose} 
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, cursor: "pointer" }} 
      />

      <div className="glass-panel" style={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        height: "100%",
        borderLeft: "1px solid var(--border)",
        boxShadow: "var(--shadow-glass)",
        display: "flex",
        flexDirection: "column",
        borderRadius: 0,
        overflow: "hidden",
        backgroundColor: "var(--surface)",
        animation: "slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem"
        }}>
          <div className="flex-between">
            <span style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--primary)",
              backgroundColor: "rgba(79, 70, 229, 0.08)",
              padding: "0.2rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              letterSpacing: "0.05em"
            }}>
              📖 {course.code} Workspace
            </span>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "1.75rem",
                cursor: "pointer",
                padding: "0.25rem",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Close Workspace"
            >
              &times;
            </button>
          </div>
          <h2 className="text-h3" style={{ margin: "0.25rem 0 0 0", fontWeight: 700 }}>
            {course.title}
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Instructor: <strong>{course.teacher.name || course.teacher.email?.split("@")[0]}</strong> ({course.teacher.email})
          </p>

          {/* Tabs Container */}
          <div style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "1.25rem",
            backgroundColor: "var(--surface-hover)",
            padding: "0.25rem",
            borderRadius: "var(--radius-md)"
          }}>
            <button
              onClick={() => {
                setActiveTab("announcements");
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "announcements" ? "var(--surface)" : "transparent",
                color: activeTab === "announcements" ? "var(--primary)" : "var(--text-muted)",
                boxShadow: activeTab === "announcements" ? "var(--shadow-sm)" : "none",
                transition: "all var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              📢 Announcements ({course.announcements?.length || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("assignments");
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "assignments" ? "var(--surface)" : "transparent",
                color: activeTab === "assignments" ? "var(--primary)" : "var(--text-muted)",
                boxShadow: activeTab === "assignments" ? "var(--shadow-sm)" : "none",
                transition: "all var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              📝 Assignments ({course.assignments?.length || 0})
            </button>
          </div>
        </div>

        {/* Scrollable Panel Area */}
        <div style={{
          flex: 1,
          padding: "1.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          backgroundColor: "rgba(0, 0, 0, 0.01)"
        }}>
          {error && (
            <div style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid var(--error)",
              color: "var(--error)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* TAB 1: ANNOUNCEMENTS */}
          {activeTab === "announcements" && (
            <>
              {!course.announcements || course.announcements.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "4rem 1.5rem",
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface-hover)",
                  marginTop: "1rem"
                }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📢</div>
                  <h4 style={{ margin: 0, fontWeight: 600 }}>No Announcements Yet</h4>
                  <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                    Your instructor has not posted any announcements for this course.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {course.announcements.map((announcement) => (
                    <div key={announcement.id} style={{
                      padding: "1.25rem",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--surface)",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem"
                    }}>
                      {/* Meta information */}
                      <div>
                        <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", fontWeight: 700 }}>
                          {announcement.title}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          By {announcement.author.name || announcement.author.email?.split("@")[0]} &bull; {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Content text */}
                      <p style={{
                        margin: 0,
                        fontSize: "0.88rem",
                        lineHeight: "1.45",
                        whiteSpace: "pre-wrap",
                        color: "var(--text-main)"
                      }}>
                        {announcement.content}
                      </p>

                      {/* Comments / Thread Section */}
                      <div style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "0.75rem",
                        backgroundColor: "var(--surface-hover)",
                        margin: "0.5rem -1.25rem -1.25rem -1.25rem",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "0 0 var(--radius-md) var(--radius-md)"
                      }}>
                        <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          💬 Discussion Forum ({announcement.comments?.length || 0})
                        </h5>

                        {/* List comments */}
                        {!announcement.comments || announcement.comments.length === 0 ? (
                          <p className="text-muted" style={{ margin: 0, fontSize: "0.75rem", fontStyle: "italic", paddingBottom: "0.25rem" }}>
                            No replies yet. Start the conversation!
                          </p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
                            {announcement.comments.map((comment) => (
                              <div key={comment.id} style={{
                                padding: "0.5rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                backgroundColor: "var(--surface)",
                                border: "1px solid var(--border)",
                                fontSize: "0.8rem"
                              }}>
                                <div className="flex-between" style={{ marginBottom: "0.15rem" }}>
                                  <strong style={{ color: "var(--text-main)" }}>
                                    {comment.author.name || comment.author.email?.split("@")[0]}
                                  </strong>
                                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p style={{ margin: 0, color: "var(--text-main)", lineHeight: 1.35 }}>
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Leave a reply form */}
                        <form onSubmit={handleCommentSubmit} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <input type="hidden" name="announcementId" value={announcement.id} />
                          <input
                            type="text"
                            name="content"
                            placeholder="Ask a question or share ideas..."
                            required
                            disabled={isPending}
                            className="input-field"
                            style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem", height: "32px", flex: 1 }}
                          />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="btn btn-primary"
                            style={{ padding: "0 0.75rem", fontSize: "0.75rem", height: "32px" }}
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: ASSIGNMENTS */}
          {activeTab === "assignments" && (
            <>
              {!course.assignments || course.assignments.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "4rem 1.5rem",
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--surface-hover)",
                  marginTop: "1rem"
                }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📝</div>
                  <h4 style={{ margin: 0, fontWeight: 600 }}>No Assignments Assigned</h4>
                  <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                    Your instructor has not posted any assignments for this course yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {course.assignments.map((assignment) => {
                    const dueDate = new Date(assignment.dueDate);
                    const submission = assignment.submissions?.[0] || null;

                    return (
                      <div
                        key={assignment.id}
                        onClick={() => handleOpenAssignment(assignment)}
                        style={{
                          padding: "1.25rem",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--surface)",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem"
                        }}
                        className="workspace-assignment-card"
                      >
                        <div className="flex-between">
                          <span style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            color: "var(--primary)",
                            backgroundColor: "rgba(79, 70, 229, 0.06)",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid rgba(79, 70, 229, 0.1)"
                          }}>
                            Assignment Task
                          </span>
                          {getStatusBadge(assignment)}
                        </div>

                        <h4 style={{
                          margin: 0,
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: "var(--text-main)",
                          lineHeight: "1.3"
                        }}>
                          {assignment.title}
                        </h4>

                        <p className="text-muted" style={{
                          margin: 0,
                          fontSize: "0.8rem",
                          lineHeight: "1.4",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "2.8em"
                        }}>
                          {assignment.description}
                        </p>

                        <div style={{
                          borderTop: "1px solid var(--border)",
                          paddingTop: "0.6rem",
                          marginTop: "0.25rem",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <span>📅 Due: {dueDate.toLocaleDateString()}</span>
                          {submission && (
                            <span style={{ color: "var(--secondary)", fontWeight: 600 }}>
                              ✓ Submitted
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assignment Modal overlay for task workspace */}
      {selectedAssignment && (
        <AssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
        />
      )}

      {/* Local style handles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .workspace-assignment-card:hover {
          border-color: var(--primary) !important;
          background-color: var(--surface-hover) !important;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </div>
  );
}
