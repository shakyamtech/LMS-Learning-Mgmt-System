"use client";

import { useState } from "react";
import AssignmentModal from "./AssignmentModal";

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

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
}

interface Enrollment {
  id: string;
  course: Course & {
    assignments: Assignment[];
  };
}

interface StudentAssignmentsProps {
  enrollments: Enrollment[];
}

type FilterStatus = "ALL" | "PENDING" | "SUBMITTED" | "GRADED";

export default function StudentAssignments({ enrollments }: StudentAssignmentsProps) {
  const [now] = useState(() => Date.now());
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [selectedAssignment, setSelectedAssignment] = useState<(Assignment & { courseCode: string; courseTitle: string }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compile all assignments from enrolled courses
  const allAssignments = enrollments.flatMap((enrollment) =>
    enrollment.course.assignments.map((assignment) => ({
      ...assignment,
      courseCode: enrollment.course.code,
      courseTitle: enrollment.course.title,
    }))
  );

  // Filter assignments based on active tab selection
  const filteredAssignments = allAssignments.filter((assignment) => {
    const submission = assignment.submissions?.[0] || null;
    const isSubmitted = Boolean(submission);
    const isGraded = submission?.status === "GRADED";

    if (filter === "PENDING") {
      return !submission;
    }
    if (filter === "SUBMITTED") {
      return isSubmitted && !isGraded;
    }
    if (filter === "GRADED") {
      return isGraded;
    }
    return true;
  });

  const getStatusBadge = (assignment: typeof allAssignments[0]) => {
    const submission = assignment.submissions?.[0] || null;
    if (!submission) {
      const isPastDue = new Date(assignment.dueDate).getTime() < now;
      return (
        <span style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          padding: "0.15rem 0.5rem",
          borderRadius: "var(--radius-sm)",
          backgroundColor: isPastDue ? "#fee2e2" : "#f1f5f9",
          color: isPastDue ? "#dc2626" : "#64748b"
        }}>
          {isPastDue ? "🔴 Missing" : "📝 Todo"}
        </span>
      );
    }
    if (submission.status === "GRADED") {
      return (
        <span style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          padding: "0.15rem 0.5rem",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          color: "#059669"
        }}>
          🎉 Score: {submission.grade}%
        </span>
      );
    }
    return (
      <span style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.15rem 0.5rem",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        color: "#d97706"
      }}>
        ⏳ Awaiting Grade
      </span>
    );
  };

  const handleOpenAssignment = (assignment: typeof allAssignments[0]) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "1.5rem",
      borderRadius: "var(--radius-lg)",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      height: "fit-content",
      marginTop: "2rem"
    }}>
      {/* Header and Filter Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "1.25rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", margin: 0, fontSize: "1.35rem", color: "#0e7490" }}>
            📝 Assignments & grading tasks
          </h3>
          <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
            Track task deadlines, upload answers, and view teacher feedback.
          </p>
        </div>

        {/* Filters Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", backgroundColor: "#f3f4f6", padding: "0.25rem", borderRadius: "var(--radius-md)" }}>
          {(["ALL", "PENDING", "SUBMITTED", "GRADED"] as FilterStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                borderRadius: "var(--radius-sm)",
                border: "none",
                cursor: "pointer",
                backgroundColor: filter === tab ? "#0891b2" : "transparent",
                color: filter === tab ? "#ffffff" : "#4b5563",
                boxShadow: filter === tab ? "0 1px 2px rgba(0, 0, 0, 0.05)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {tab === "ALL" && "All Tasks"}
              {tab === "PENDING" && "Todo"}
              {tab === "SUBMITTED" && "Awaiting Review"}
              {tab === "GRADED" && "Graded"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or List of Assignments */}
      {filteredAssignments.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3.5rem 1rem",
          border: "1px dashed #e5e7eb",
          borderRadius: "var(--radius-md)",
          backgroundColor: "#f9fafb"
        }}>
          <span style={{ fontSize: "2.5rem" }}>✨</span>
          <h4 style={{ margin: "0.5rem 0 0.25rem 0", color: "var(--college-text)", fontWeight: 700 }}>
            No Assignments Found
          </h4>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            {filter === "ALL" && "No assignments have been assigned to your enrolled courses."}
            {filter === "PENDING" && "Great job! You have completed all active assignment tasks."}
            {filter === "SUBMITTED" && "No submissions are currently pending grade reviews."}
            {filter === "GRADED" && "You haven't received any graded feedback yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {filteredAssignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const submission = assignment.submissions?.[0] || null;

            return (
              <div
                key={assignment.id}
                onClick={() => handleOpenAssignment(assignment)}
                style={{
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out"
                }}
                className="assignment-card-cyan"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    backgroundColor: "rgba(8, 145, 178, 0.08)",
                    border: "1px solid rgba(8, 145, 178, 0.2)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "var(--radius-sm)",
                    color: "#0891b2"
                  }}>
                    {assignment.courseCode}
                  </span>
                  {getStatusBadge(assignment)}
                </div>

                <h4 style={{
                  margin: "0 0 0.35rem 0",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--college-text)",
                  lineHeight: "1.3"
                }}>
                  {assignment.title}
                </h4>

                <p className="text-muted" style={{
                  margin: "0 0 0.75rem 0",
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
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "0.6rem",
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <span>📅 Due: {dueDate.toLocaleDateString()}</span>
                  {submission && (
                    <span style={{ color: "#059669", fontWeight: 700 }}>
                      ✓ Submitted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over submission modal */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignment={selectedAssignment}
      />

      <style jsx global>{`
        .assignment-card-cyan:hover {
          background-color: #ffffff !important;
          border-color: #0891b2 !important;
          box-shadow: 0 4px 12px rgba(8, 145, 178, 0.12);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
