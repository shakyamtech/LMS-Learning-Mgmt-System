"use client";

import React, { useState, useTransition } from "react";
import { saveDailyAttendance, AttendanceRecordItem } from "@/app/actions/attendance";

interface Course {
  id: string;
  code: string;
  title: string;
  enrollments?: Array<{ studentId?: string; student?: { id: string } }>;
}

interface Student {
  id: string;
  name: string | null;
  email: string | null;
}

interface TeacherAttendanceMarkingProps {
  courses: any[];
  allStudents: Student[];
}

export default function TeacherAttendanceMarking({ courses, allStudents }: TeacherAttendanceMarkingProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const activeCourse: Course = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Get enrolled students for the selected course
  const enrolledStudentIds = activeCourse?.enrollments
    ?.map(e => e.studentId || e.student?.id)
    .filter(Boolean) as string[] || [];
  const enrolledStudents = allStudents.filter(s => enrolledStudentIds.includes(s.id));

  // State map of studentId -> { status, remark }
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; remark: string }>>({});
  const [isPending, startTransition] = useTransition();
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getStatus = (studentId: string) => attendanceState[studentId]?.status || "PRESENT";
  const getRemark = (studentId: string) => attendanceState[studentId]?.remark || "";

  const setStatus = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { status, remark: prev[studentId]?.remark || "" }
    }));
  };

  const setRemark = (studentId: string, remark: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { status: prev[studentId]?.status || "PRESENT", remark }
    }));
  };

  const markAll = (status: "PRESENT" | "ABSENT") => {
    const nextState: Record<string, { status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; remark: string }> = {};
    enrolledStudents.forEach(s => {
      nextState[s.id] = { status, remark: attendanceState[s.id]?.remark || "" };
    });
    setAttendanceState(nextState);
  };

  const handleSave = () => {
    if (!activeCourse) return;

    const records: AttendanceRecordItem[] = enrolledStudents.map(s => ({
      studentId: s.id,
      studentName: s.name || s.email?.split("@")[0] || "Student",
      status: getStatus(s.id),
      remark: getRemark(s.id) || undefined
    }));

    startTransition(async () => {
      setFeedbackMsg(null);
      const res = await saveDailyAttendance({
        courseId: activeCourse.id,
        courseTitle: `${activeCourse.code}: ${activeCourse.title}`,
        date: selectedDate,
        records
      });

      if (res.error) {
        setFeedbackMsg({ type: "error", text: res.error });
      } else {
        setFeedbackMsg({
          type: "success",
          text: `✅ Attendance for ${records.length} students successfully ${res.updated ? "updated" : "saved"} for ${selectedDate}!`
        });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", color: "#991b1b", margin: "0 0 0.25rem 0" }}>
            📅 Daily Attendance Management
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Select a course and date to mark daily attendance for enrolled students.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Select Course */}
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: 700,
              fontSize: "0.88rem",
              color: "#374151",
              cursor: "pointer"
            }}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>

          {/* Select Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: 700,
              fontSize: "0.88rem",
              color: "#374151"
            }}
          />
        </div>
      </div>

      {/* Feedback Message Alert */}
      {feedbackMsg && (
        <div style={{
          padding: "1rem 1.25rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: feedbackMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${feedbackMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          color: feedbackMsg.type === "success" ? "#15803d" : "#991b1b",
          fontWeight: 700,
          fontSize: "0.9rem"
        }}>
          {feedbackMsg.text}
        </div>
      )}

      {/* Roster & Attendance Controls Container */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        {/* Bulk Action Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #f3f4f6", paddingBottom: "1rem" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#1f2937" }}>
              Student Roster ({enrolledStudents.length} Enrolled)
            </h4>
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Course: <strong>{activeCourse?.code} - {activeCourse?.title}</strong> | Date: <strong>{selectedDate}</strong>
            </span>
          </div>

          {enrolledStudents.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => markAll("PRESENT")}
                style={{
                  backgroundColor: "#f0fdf4",
                  color: "#15803d",
                  border: "1px solid #bbf7d0",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🟢 Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll("ABSENT")}
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🔴 Mark All Absent
              </button>
            </div>
          )}
        </div>

        {/* Student Roster List */}
        {enrolledStudents.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "3rem 1rem",
            border: "1px dashed #cbd5e1",
            borderRadius: "var(--radius-md)",
            backgroundColor: "#f8fafc"
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
            <h4 style={{ margin: 0, fontWeight: 700, color: "var(--college-text)" }}>No Students Enrolled in This Course</h4>
            <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
              Students will appear here once they enroll in this course.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {enrolledStudents.map((s) => {
              const currentStatus = getStatus(s.id);
              const initials = (s.name || s.email || "ST").substring(0, 2).toUpperCase();

              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  {/* Student Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flex: 1 }}>
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      backgroundColor: "#991b1b",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: 800
                    }}>
                      {initials}
                    </div>
                    <div>
                      <span style={{ display: "block", fontWeight: 700, color: "#1f2937", fontSize: "0.95rem" }}>
                        {s.name || s.email?.split("@")[0]}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{s.email}</span>
                    </div>
                  </div>

                  {/* Toggle Status Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginRight: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "PRESENT")}
                      style={{
                        backgroundColor: currentStatus === "PRESENT" ? "#10b981" : "#ffffff",
                        color: currentStatus === "PRESENT" ? "#ffffff" : "#374151",
                        border: currentStatus === "PRESENT" ? "1px solid #059669" : "1px solid #cbd5e1",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: currentStatus === "PRESENT" ? "0 2px 6px rgba(16, 185, 129, 0.3)" : "none"
                      }}
                    >
                      🟢 Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "ABSENT")}
                      style={{
                        backgroundColor: currentStatus === "ABSENT" ? "#ef4444" : "#ffffff",
                        color: currentStatus === "ABSENT" ? "#ffffff" : "#374151",
                        border: currentStatus === "ABSENT" ? "1px solid #dc2626" : "1px solid #cbd5e1",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: currentStatus === "ABSENT" ? "0 2px 6px rgba(239, 68, 68, 0.3)" : "none"
                      }}
                    >
                      🔴 Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "LATE")}
                      style={{
                        backgroundColor: currentStatus === "LATE" ? "#f59e0b" : "#ffffff",
                        color: currentStatus === "LATE" ? "#ffffff" : "#374151",
                        border: currentStatus === "LATE" ? "1px solid #d97706" : "1px solid #cbd5e1",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: currentStatus === "LATE" ? "0 2px 6px rgba(245, 158, 11, 0.3)" : "none"
                      }}
                    >
                      🟡 Late
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "EXCUSED")}
                      style={{
                        backgroundColor: currentStatus === "EXCUSED" ? "#3b82f6" : "#ffffff",
                        color: currentStatus === "EXCUSED" ? "#ffffff" : "#374151",
                        border: currentStatus === "EXCUSED" ? "1px solid #2563eb" : "1px solid #cbd5e1",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: currentStatus === "EXCUSED" ? "0 2px 6px rgba(59, 130, 246, 0.3)" : "none"
                      }}
                    >
                      🔵 Excused
                    </button>
                  </div>

                  {/* Optional Remark Input */}
                  <input
                    type="text"
                    placeholder="Optional remark..."
                    value={getRemark(s.id)}
                    onChange={(e) => setRemark(s.id, e.target.value)}
                    style={{
                      padding: "0.35rem 0.65rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.78rem",
                      width: "160px"
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Save Attendance Submit Button */}
        {enrolledStudents.length > 0 && (
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              style={{
                backgroundColor: "#991b1b",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 2rem",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: isPending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(153, 27, 27, 0.25)"
              }}
            >
              <span>💾</span> {isPending ? "Saving..." : `Save Attendance for ${selectedDate}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
