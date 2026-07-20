"use client";

import { submitAssignment } from "@/app/actions/assignments";
import { useState, useActionState, useEffect, useRef } from "react";

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

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

export default function AssignmentModal({ isOpen, onClose, assignment }: AssignmentModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(submitAssignment, null);
  const formRef = useRef<HTMLFormElement>(null);

  const existingSubmission = assignment?.submissions?.[0] || null;
  const isGraded = existingSubmission?.status === "GRADED";

  const [now] = useState(() => Date.now());

  // Reset local showForm state and form errors when modal opens or assignment changes
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowForm(!existingSubmission || existingSubmission.status !== "GRADED");
    }
  }, [isOpen, assignment, existingSubmission]);

  // Handle successful submission
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        onClose();
        // Clear state by refreshing or letting parent re-render
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  if (!isOpen || !assignment) return null;

  const dueDate = new Date(assignment.dueDate);
  const isPastDue = dueDate.getTime() < now;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(6px)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "1.5rem",
      animation: "fadeIn 0.2s ease-out"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "600px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        borderRadius: "var(--radius-lg)",
        border: "1px solid #e5e7eb",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff"
        }}>
          <div>
            <span style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#0891b2",
              letterSpacing: "0.05em"
            }}>
              📝 Course Assignment Task
            </span>
            <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.25rem", fontWeight: 700, color: "var(--college-text)" }}>
              {assignment.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Scrollable Workspace */}
        <div style={{
          padding: "1.5rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          flex: 1
        }}>
          {/* Info Details */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--surface-hover)",
            fontSize: "0.85rem",
            border: "1px solid var(--border)"
          }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
              📅 Deadline: <strong style={{ color: "var(--text-main)" }}>{dueDate.toLocaleString()}</strong>
            </span>
            <span style={{
              fontWeight: 700,
              fontSize: "0.75rem",
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: isPastDue ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
              color: isPastDue ? "var(--error)" : "var(--secondary)"
            }}>
              {isPastDue ? "🔴 Past Due" : "🟢 Active"}
            </span>
          </div>

          {/* Description / Instructions */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", fontWeight: 600 }}>Task Description</h4>
            <div style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--surface-hover)",
              fontSize: "0.9rem",
              lineHeight: "1.5",
              color: "var(--text-main)",
              whiteSpace: "pre-wrap",
              border: "1px solid var(--border)"
            }}>
              {assignment.description}
            </div>
          </div>

          {/* Grading Feedback (If graded) */}
          {isGraded && existingSubmission && (
            <div style={{
              backgroundColor: "rgba(34, 197, 94, 0.08)",
              border: "1px solid var(--success)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}>
              <div className="flex-between">
                <span style={{ color: "var(--success)", fontWeight: 700, fontSize: "0.95rem" }}>
                  🎉 Graded & Reviewed
                </span>
                <span style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--success)"
                }}>
                  {existingSubmission.grade}/100
                </span>
              </div>
              <div style={{
                fontSize: "0.85rem",
                color: "var(--text-main)",
                lineHeight: "1.45"
              }}>
                <strong>Feedback from Instructor:</strong>
                <p style={{ margin: "0.25rem 0 0 0", fontStyle: "italic" }}>
                  "{existingSubmission.feedback || "Excellent work!"}"
                </p>
              </div>
            </div>
          )}

          {/* Existing Submission Details (Awaiting review or already graded) */}
          {existingSubmission && (
            <div>
              <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
                  Your Submission
                </h4>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.4rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: isGraded ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                  color: isGraded ? "var(--success)" : "var(--warning)"
                }}>
                  {isGraded ? "Graded" : "⏳ Under Instructor Review"}
                </span>
              </div>
              
              <div style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                fontSize: "0.85rem",
                lineHeight: "1.4",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                color: "var(--text-main)",
                maxHeight: "150px",
                overflowY: "auto"
              }}>
                {existingSubmission.content}
              </div>

              {!isGraded && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-secondary"
                  style={{
                    width: "100%",
                    marginTop: "0.75rem",
                    padding: "0.5rem",
                    fontSize: "0.85rem"
                  }}
                >
                  🔄 Modify Submission / Re-upload
                </button>
              )}
            </div>
          )}

          {/* Form Actions for Submission */}
          {showForm && (
            <form
              ref={formRef}
              action={formAction}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "1.25rem"
              }}
            >
              <input type="hidden" name="assignmentId" value={assignment.id} />
              
              {state?.error && (
                <div style={{
                  color: "var(--error)",
                  fontSize: "0.8rem",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)"
                }}>
                  ⚠️ {state.error}
                </div>
              )}

              {state?.success && (
                <div style={{
                  color: "var(--success)",
                  fontSize: "0.85rem",
                  backgroundColor: "rgba(34, 197, 94, 0.08)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600
                }}>
                  ✅ {state.message}
                </div>
              )}

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="content" style={{ fontSize: "0.85rem" }}>
                  Your Submission Answer
                </label>
                <textarea
                  className="input-field"
                  id="content"
                  name="content"
                  defaultValue={existingSubmission?.content || ""}
                  placeholder="Paste GitHub repository, deployment URLs, or write a summary of your homework answers..."
                  required
                  disabled={isPending || state?.success}
                  rows={4}
                  style={{
                    fontFamily: "inherit",
                    resize: "none",
                    padding: "0.75rem",
                    fontSize: "0.85rem",
                    lineHeight: "1.4"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                {existingSubmission && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isPending || state?.success}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "0.6rem", fontSize: "0.85rem" }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending || state?.success}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    padding: "0.6rem",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  {isPending ? (
                    <>
                      <span className="spinner" style={{
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }} />
                      Uploading...
                    </>
                  ) : existingSubmission ? (
                    "Update Submission"
                  ) : (
                    "Submit Work"
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(15px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
