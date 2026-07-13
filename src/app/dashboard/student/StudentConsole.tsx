"use client";

import { useState } from "react";
import BrowseCourses from "./BrowseCourses";
import StudentAssignments from "./StudentAssignments";
import CourseWorkspace from "./CourseWorkspace";

interface StudentConsoleProps {
  enrollments: any[];
  availableCourses: any[];
}

export default function StudentConsole({ enrollments, availableCourses }: StudentConsoleProps) {
  const [selectedWorkspaceCourse, setSelectedWorkspaceCourse] = useState<any | null>(null);

  // Synchronize dynamic updates back if selectedWorkspaceCourse changes in db
  const activeCourse = selectedWorkspaceCourse
    ? enrollments.find((e) => e.course.id === selectedWorkspaceCourse.id)?.course
    : null;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Left Column container for courses and assignments */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Active Enrollments */}
          <div className="card" style={{ height: "fit-content" }}>
            <h3 className="text-h3" style={{ margin: "0 0 1.5rem 0" }}>Your Active Courses</h3>
            
            {enrollments.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "4rem 1rem",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--surface-hover)"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏫</div>
                <h4 style={{ margin: 0, fontWeight: 600 }}>No Enrolled Courses</h4>
                <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                  You are not currently taking any classes. Enroll in an available course on the right to begin!
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {enrollments.map((enrollment) => {
                  const course = enrollment.course;
                  const isCompleted = enrollment.progress === 100;
                  const progressColor = isCompleted ? "var(--success)" : "var(--primary)";
                  
                  return (
                    <div 
                      key={enrollment.id} 
                      onClick={() => setSelectedWorkspaceCourse(course)}
                      style={{
                        padding: "1.25rem",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--surface-hover)",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out"
                      }}
                      className="student-course-card"
                    >
                      <div className="flex-between" style={{ marginBottom: "0.75rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                              fontWeight: 700,
                              border: "1px solid var(--border)",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor: "var(--surface)"
                            }}>
                              {course.code}
                            </span>
                            {isCompleted && (
                              <span style={{
                                fontSize: "0.7rem",
                                color: "var(--success)",
                                fontWeight: 700,
                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "var(--radius-sm)"
                              }}>
                                Completed
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: "0.35rem 0 0.15rem 0", fontSize: "1.1rem", fontWeight: 600 }}>
                            {course.title}
                          </h4>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
                        backgroundColor: "var(--border)",
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
                        <span className="btn btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          📢 Open Workspace &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assignments & Grading Console */}
          <StudentAssignments enrollments={enrollments} />
        </div>

        {/* Browse Available Courses Sidepanel */}
        <BrowseCourses courses={availableCourses} />
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
          background-color: var(--surface) !important;
          border-color: var(--primary) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </>
  );
}
