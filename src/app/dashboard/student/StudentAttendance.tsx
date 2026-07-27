"use client";

import React, { useState } from "react";

export interface AttendanceLog {
  id: string;
  courseId: string;
  courseTitle: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remark?: string;
}

interface StudentAttendanceProps {
  logs: AttendanceLog[];
  studentName: string;
}

export default function StudentAttendance({ logs, studentName }: StudentAttendanceProps) {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("ALL");

  // Extract unique courses from logs
  const courseOptions = Array.from(new Set(logs.map(l => l.courseTitle))).filter(Boolean);

  const filteredLogs = selectedCourseFilter === "ALL"
    ? logs
    : logs.filter(l => l.courseTitle === selectedCourseFilter);

  const totalClasses = filteredLogs.length;
  const presentCount = filteredLogs.filter(l => l.status === "PRESENT").length;
  const absentCount = filteredLogs.filter(l => l.status === "ABSENT").length;
  const lateCount = filteredLogs.filter(l => l.status === "LATE").length;
  const excusedCount = filteredLogs.filter(l => l.status === "EXCUSED").length;

  const attendancePercentage = totalClasses > 0
    ? Math.round(((presentCount + lateCount) / totalClasses) * 100)
    : 100;

  const isLowAttendance = totalClasses > 0 && attendancePercentage < 75;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", color: "#0e7490", margin: "0 0 0.25rem 0" }}>
            📅 Attendance & Class Participation Record
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Track your daily class attendance logs, present/absent history, and academic clearance status.
          </p>
        </div>

        {/* Course Filter Dropdown */}
        {courseOptions.length > 0 && (
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: 600,
              fontSize: "0.88rem",
              color: "#374151",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Enrolled Courses</option>
            {courseOptions.map((cTitle, idx) => (
              <option key={idx} value={cTitle}>{cTitle}</option>
            ))}
          </select>
        )}
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid-cols-4" style={{ gap: "1.25rem" }}>
        {/* Card 1: Attendance Rate */}
        <div className="card" style={{
          backgroundColor: "#ffffff",
          padding: "1.25rem",
          borderLeft: isLowAttendance ? "4px solid #ef4444" : "4px solid #10b981"
        }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>📈</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Attendance Rate
          </span>
          <p className="text-h2" style={{
            margin: "0.25rem 0 0.15rem 0",
            color: isLowAttendance ? "#dc2626" : "#059669",
            fontSize: "1.65rem",
            fontWeight: 800
          }}>
            {attendancePercentage}%
          </p>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: isLowAttendance ? "#dc2626" : "#059669"
          }}>
            {isLowAttendance ? "⚠️ Low Attendance (<75%)" : "✅ Good Standing"}
          </span>
        </div>

        {/* Card 2: Present Days */}
        <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem", borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>🟢</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Present Days
          </span>
          <p className="text-h2" style={{ margin: "0.25rem 0 0.15rem 0", color: "#059669", fontSize: "1.65rem", fontWeight: 800 }}>
            {presentCount} Days
          </p>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            Full class attendance
          </span>
        </div>

        {/* Card 3: Absent Days */}
        <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem", borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>🔴</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Absent Days
          </span>
          <p className="text-h2" style={{ margin: "0.25rem 0 0.15rem 0", color: "#dc2626", fontSize: "1.65rem", fontWeight: 800 }}>
            {absentCount} Days
          </p>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            Unexcused absences
          </span>
        </div>

        {/* Card 4: Late / Excused */}
        <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>🟡</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Late / Excused
          </span>
          <p className="text-h2" style={{ margin: "0.25rem 0 0.15rem 0", color: "#d97706", fontSize: "1.65rem", fontWeight: 800 }}>
            {lateCount + excusedCount} Days
          </p>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {lateCount} Late, {excusedCount} Excused
          </span>
        </div>
      </div>

      {/* Attendance Percentage Progress Bar */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#1f2937", fontWeight: 700 }}>
              Academic Attendance Compliance
            </h4>
            <p className="text-muted" style={{ margin: "0.15rem 0 0 0", fontSize: "0.82rem" }}>
              Minimum 75% attendance is required for term exams & academic clearance.
            </p>
          </div>
          <span style={{
            fontSize: "0.85rem",
            fontWeight: 800,
            backgroundColor: isLowAttendance ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
            color: isLowAttendance ? "#dc2626" : "#059669",
            padding: "0.3rem 0.85rem",
            borderRadius: "9999px"
          }}>
            {attendancePercentage}% ATTENDANCE
          </span>
        </div>

        <div style={{
          width: "100%",
          height: "12px",
          backgroundColor: "#e5e7eb",
          borderRadius: "9999px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${attendancePercentage}%`,
            height: "100%",
            backgroundColor: isLowAttendance ? "#ef4444" : "#10b981",
            backgroundImage: isLowAttendance
              ? "linear-gradient(90deg, #f87171 0%, #dc2626 100%)"
              : "linear-gradient(90deg, #0e7490 0%, #10b981 100%)",
            borderRadius: "9999px",
            transition: "width 0.5s ease"
          }} />
        </div>
      </div>

      {/* Attendance Log Ledger Table */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h4 style={{ fontFamily: "Playfair Display, serif", margin: 0, fontSize: "1.35rem", color: "#0e7490" }}>
            📋 Daily Attendance Logs ({filteredLogs.length})
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            Student: <strong>{studentName}</strong>
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "3rem 1rem",
            border: "1px dashed #cbd5e1",
            borderRadius: "var(--radius-md)",
            backgroundColor: "#f8fafc"
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📅</div>
            <h4 style={{ margin: 0, fontWeight: 700, color: "var(--college-text)" }}>No Attendance Records Found</h4>
            <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
              Attendance logs marked by your instructors will be displayed here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Date</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Course Title</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Instructor Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem", color: "#4b5563", fontWeight: 600, whiteSpace: "nowrap" }}>
                      📅 {log.date}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#1f2937" }}>
                      {log.courseTitle}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                      <span style={{
                        backgroundColor:
                          log.status === "PRESENT" ? "rgba(16, 185, 129, 0.15)" :
                          log.status === "ABSENT" ? "rgba(239, 68, 68, 0.15)" :
                          log.status === "LATE" ? "rgba(245, 158, 11, 0.15)" :
                          "rgba(59, 130, 246, 0.15)",
                        color:
                          log.status === "PRESENT" ? "#059669" :
                          log.status === "ABSENT" ? "#dc2626" :
                          log.status === "LATE" ? "#d97706" :
                          "#2563eb",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px"
                      }}>
                        {log.status === "PRESENT" && "🟢 PRESENT"}
                        {log.status === "ABSENT" && "🔴 ABSENT"}
                        {log.status === "LATE" && "🟡 LATE"}
                        {log.status === "EXCUSED" && "🔵 EXCUSED"}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#6b7280", fontSize: "0.85rem" }}>
                      {log.remark || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
