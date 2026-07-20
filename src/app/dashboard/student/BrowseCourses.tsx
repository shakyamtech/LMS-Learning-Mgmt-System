"use client";

import { enrollInCourse } from "@/app/actions/courses";
import { useState, useTransition } from "react";

interface Teacher {
  name: string | null;
  email: string | null;
}

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  teacher: Teacher;
}

interface BrowseCoursesProps {
  courses: Course[];
}

export default function BrowseCourses({ courses }: BrowseCoursesProps) {
  const [isPending, startTransition] = useTransition();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = (courseId: string) => {
    setError(null);
    setActiveCourseId(courseId);

    startTransition(async () => {
      try {
        await enrollInCourse(courseId);
      } catch (err: any) {
        setError(err.message || "Failed to enroll in course.");
      } finally {
        setActiveCourseId(null);
      }
    });
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "1.5rem",
      borderRadius: "var(--radius-lg)",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      height: "fit-content"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", margin: 0, fontSize: "1.35rem", color: "#0e7490" }}>
            📚 Browse Available Courses
          </h3>
          <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
            Expand your knowledge base by self-enrolling in new semester offerings.
          </p>
        </div>
        <span style={{
          fontSize: "0.75rem",
          backgroundColor: "rgba(8, 145, 178, 0.1)",
          color: "#0891b2",
          fontWeight: 700,
          padding: "0.25rem 0.75rem",
          borderRadius: "var(--radius-full)",
          textTransform: "uppercase"
        }}>
          {courses.length} Open
        </span>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #fca5a5",
          color: "#dc2626",
          padding: "0.75rem 1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1rem",
          fontSize: "0.85rem",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "3rem 1rem",
          border: "1px dashed #e5e7eb",
          borderRadius: "var(--radius-md)",
          backgroundColor: "#f9fafb"
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</div>
          <h4 style={{ margin: 0, fontWeight: 700, color: "var(--college-text)" }}>All Caught Up!</h4>
          <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
            You are enrolled in all available courses on the platform.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {courses.map((course) => {
            const isLoading = isPending && activeCourseId === course.id;
            return (
              <div
                key={course.id}
                style={{
                  padding: "1.25rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                  transition: "all 0.2s ease-in-out"
                }}
                className="hover-card-cyan"
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      color: "#0891b2",
                      fontWeight: 700,
                      backgroundColor: "rgba(8, 145, 178, 0.08)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "var(--radius-sm)"
                    }}>
                      {course.code}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 500 }}>
                      👨‍🏫 {course.teacher.name || course.teacher.email?.split("@")[0]}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 0.35rem 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--college-text)" }}>
                    {course.title}
                  </h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4" }}>
                    {course.description}
                  </p>
                </div>

                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    backgroundColor: "#0891b2",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite"
                      }} />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Enroll Now</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hover-card-cyan:hover {
          border-color: #0891b2 !important;
          box-shadow: 0 4px 12px rgba(8, 145, 178, 0.12);
        }
      `}</style>
    </div>
  );
}
