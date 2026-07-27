"use client";

import React, { useState } from "react";

export interface AttendanceEntry {
  id: string;
  courseId: string;
  courseTitle: string;
  date: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remark?: string;
  createdAt: string;
}

interface AdminAttendanceProps {
  logs: AttendanceEntry[];
}

export default function AdminAttendance({ logs }: AdminAttendanceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Group logs by studentId
  const studentsMap = new Map<string, { studentId: string; studentName: string; logs: AttendanceEntry[] }>();
  
  logs.forEach((log) => {
    if (!studentsMap.has(log.studentId)) {
      studentsMap.set(log.studentId, {
        studentId: log.studentId,
        studentName: log.studentName,
        logs: []
      });
    }
    studentsMap.get(log.studentId)!.logs.push(log);
  });

  const studentsList = Array.from(studentsMap.values()).filter((s) => {
    return (
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalEntries = logs.length;
  const totalPresent = logs.filter((l) => l.status === "PRESENT").length;
  const totalAbsent = logs.filter((l) => l.status === "ABSENT").length;
  const totalLate = logs.filter((l) => l.status === "LATE" || l.status === "EXCUSED").length;

  // Calendar Helper Calculation
  const getCalendarDays = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDayIndex, daysInMonth };
  };

  const { firstDayIndex, daysInMonth } = getCalendarDays(selectedYear, selectedMonth);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      {/* Top Header & Global Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", color: "#14532d", margin: "0 0 0.25rem 0" }}>
            📅 Student Attendance &amp; Calendar Records
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Individual monthly attendance calendar cards and master logs for all registered students.
          </p>
        </div>

        {/* View Mode Toggle & Search */}
        <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
          {/* View Toggle */}
          <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "0.25rem", borderRadius: "var(--radius-md)", border: "1px solid #cbd5e1" }}>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              style={{
                backgroundColor: viewMode === "cards" ? "#14532d" : "transparent",
                color: viewMode === "cards" ? "white" : "#4b5563",
                border: "none",
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              📅 Calendar Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                backgroundColor: viewMode === "table" ? "#14532d" : "transparent",
                color: viewMode === "table" ? "white" : "#4b5563",
                border: "none",
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              📋 Master Ledger
            </button>
          </div>

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: 700,
              fontSize: "0.85rem"
            }}
          >
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx}>{m} {selectedYear}</option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              width: "200px"
            }}
          />
        </div>
      </div>

      {/* Top 4 Summary Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem",
        width: "100%"
      }}>
        {/* Card 1: Total Entries */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid #e5e7eb",
          borderLeft: "5px solid #14532d",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Total Recorded Logs
            </span>
            <span style={{ fontSize: "1.35rem" }}>📋</span>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#14532d", margin: "0.2rem 0" }}>
            {totalEntries}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Across all courses &amp; check-ins</span>
        </div>

        {/* Card 2: Present Days */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid #e5e7eb",
          borderLeft: "5px solid #10b981",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Total Present Days
            </span>
            <span style={{ fontSize: "1.35rem" }}>🟢</span>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#059669", margin: "0.2rem 0" }}>
            {totalPresent}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>Active attendance check-ins</span>
        </div>

        {/* Card 3: Absent Days */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid #e5e7eb",
          borderLeft: "5px solid #ef4444",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Total Absent Days
            </span>
            <span style={{ fontSize: "1.35rem" }}>🔴</span>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#dc2626", margin: "0.2rem 0" }}>
            {totalAbsent}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700 }}>Unexcused absences</span>
        </div>

        {/* Card 4: Late / Excused */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid #e5e7eb",
          borderLeft: "5px solid #f59e0b",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Late / Excused
            </span>
            <span style={{ fontSize: "1.35rem" }}>🟡</span>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#d97706", margin: "0.2rem 0" }}>
            {totalLate}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Approved late or excused</span>
        </div>
      </div>

      {/* VIEW MODE 1: CALENDAR CARDS GRID */}
      {viewMode === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
          {studentsList.length === 0 ? (
            <div style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "4rem 1rem",
              border: "1px dashed #cbd5e1",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#f8fafc"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👥</div>
              <h4 style={{ margin: 0, fontWeight: 700, color: "#374151" }}>No Student Attendance Cards Found</h4>
              <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                Attendance records will appear here as students check in or instructors log daily attendance.
              </p>
            </div>
          ) : (
            studentsList.map((student) => {
              const studentLogs = student.logs;
              const presentDays = studentLogs.filter((l) => l.status === "PRESENT").length;
              const absentDays = studentLogs.filter((l) => l.status === "ABSENT").length;
              const lateDays = studentLogs.filter((l) => l.status === "LATE" || l.status === "EXCUSED").length;
              const totalClassCount = studentLogs.length;

              const percent = totalClassCount > 0 ? Math.round(((presentDays + lateDays) / totalClassCount) * 100) : 100;
              const isGoodStanding = percent >= 75;

              return (
                <div
                  key={student.studentId}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  {/* Student Card Top Header */}
                  <div style={{
                    backgroundColor: "#f8fafc",
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "#14532d",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.95rem"
                      }}>
                        {student.studentName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#14532d" }}>
                          {student.studentName}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          ID: {student.studentId}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      backgroundColor: isGoodStanding ? "#d1fae5" : "#fee2e2",
                      color: isGoodStanding ? "#065f46" : "#991b1b",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "0.25rem 0.65rem",
                      borderRadius: "9999px"
                    }}>
                      {percent}% ({isGoodStanding ? "Good" : "Low"})
                    </span>
                  </div>

                  {/* Monthly Attendance Calendar Grid */}
                  <div style={{ padding: "1.25rem", flexGrow: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#374151", textTransform: "uppercase" }}>
                        🗓️ {monthNames[selectedMonth]} {selectedYear}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                        Click date for details
                      </span>
                    </div>

                    {/* Day Headers (Sun-Sat) */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "#6b7280", marginBottom: "6px" }}>
                      <div>Su</div>
                      <div>Mo</div>
                      <div>Tu</div>
                      <div>We</div>
                      <div>Th</div>
                      <div>Fr</div>
                      <div>Sa</div>
                    </div>

                    {/* Month Days Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                      {/* Blank cells before 1st of month */}
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`blank-${i}`} style={{ height: "34px", backgroundColor: "transparent" }} />
                      ))}

                      {/* Day cells 1 to daysInMonth */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                        const formattedMonth = (selectedMonth + 1) < 10 ? `0${selectedMonth + 1}` : `${selectedMonth + 1}`;
                        const dateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`;

                        // Check if student has attendance log for this date
                        const logForDay = studentLogs.find((l) => l.date === dateStr);
                        const status = logForDay?.status;

                        let bgColor = "#f8fafc";
                        let textColor = "#6b7280";
                        let statusDot = "";
                        let borderStyle = "1px solid #e2e8f0";

                        if (status === "PRESENT") {
                          bgColor = "#d1fae5";
                          textColor = "#065f46";
                          statusDot = "🟢";
                          borderStyle = "1px solid #a7f3d0";
                        } else if (status === "ABSENT") {
                          bgColor = "#fee2e2";
                          textColor = "#991b1b";
                          statusDot = "🔴";
                          borderStyle = "1px solid #fecaca";
                        } else if (status === "LATE") {
                          bgColor = "#fef3c7";
                          textColor = "#92400e";
                          statusDot = "🟡";
                          borderStyle = "1px solid #fde68a";
                        } else if (status === "EXCUSED") {
                          bgColor = "#dbeafe";
                          textColor = "#1e40af";
                          statusDot = "🔵";
                          borderStyle = "1px solid #bfdbfe";
                        }

                        return (
                          <div
                            key={dayNum}
                            title={logForDay ? `${dateStr}: ${status} (${logForDay.courseTitle})` : `${dateStr}: No Record`}
                            style={{
                              height: "34px",
                              backgroundColor: bgColor,
                              color: textColor,
                              border: borderStyle,
                              borderRadius: "6px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.72rem",
                              fontWeight: status ? 800 : 500,
                              cursor: logForDay ? "pointer" : "default"
                            }}
                          >
                            <span>{dayNum}</span>
                            {statusDot && <span style={{ fontSize: "0.55rem", lineHeight: 1 }}>{statusDot}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mini Card Footer Stats */}
                  <div style={{
                    backgroundColor: "#f8fafc",
                    padding: "0.75rem 1.25rem",
                    borderTop: "1px dashed #cbd5e1",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#4b5563"
                  }}>
                    <span>🟢 Present: <strong>{presentDays}</strong></span>
                    <span>🔴 Absent: <strong>{absentDays}</strong></span>
                    <span>🟡 Late: <strong>{lateDays}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: MASTER LEDGER TABLE */}
      {viewMode === "table" && (
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h4 style={{ fontFamily: "Playfair Display, serif", margin: 0, fontSize: "1.35rem", color: "#14532d" }}>
              📊 Master Attendance Logs ({logs.length})
            </h4>
          </div>

          {logs.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 1rem",
              border: "1px dashed #cbd5e1",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#f8fafc"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📅</div>
              <h4 style={{ margin: 0, fontWeight: 700, color: "var(--college-text)" }}>No Attendance Records Found</h4>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Date</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Student Name</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Course / Subject</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Marked Source</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.85rem 1rem", color: "#4b5563", fontWeight: 600, whiteSpace: "nowrap" }}>
                        📅 {log.date}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#1f2937" }}>
                        {log.studentName}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "#4b5563" }}>
                        <span style={{ backgroundColor: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600 }}>
                          {log.courseTitle}
                        </span>
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
                      <td style={{ padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#6b7280" }}>
                        {log.teacherId === "SYSTEM_SELF" ? "📍 Self Marked" : "👨‍🏫 Teacher Roster"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
