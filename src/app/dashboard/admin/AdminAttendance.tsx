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
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !selectedDateFilter || log.date === selectedDateFilter;

    return matchesSearch && matchesDate;
  });

  const totalEntries = filteredLogs.length;
  const presentCount = filteredLogs.filter((l) => l.status === "PRESENT").length;
  const absentCount = filteredLogs.filter((l) => l.status === "ABSENT").length;
  const lateCount = filteredLogs.filter((l) => l.status === "LATE").length;
  const excusedCount = filteredLogs.filter((l) => l.status === "EXCUSED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", color: "#14532d", margin: "0 0 0.25rem 0" }}>
            📅 Student Attendance &amp; Class Logs
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Master attendance records for all students across daily campus check-ins and teacher course rosters.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              width: "220px"
            }}
          />

          {/* Date Picker Filter */}
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #cbd5e1",
              fontSize: "0.88rem",
              backgroundColor: "white"
            }}
          />

          {selectedDateFilter && (
            <button
              type="button"
              onClick={() => setSelectedDateFilter("")}
              style={{
                backgroundColor: "#f3f4f6",
                border: "none",
                padding: "0.55rem 0.85rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#4b5563",
                cursor: "pointer"
              }}
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid-cols-4" style={{ gap: "1.25rem" }}>
        <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem", borderLeft: "4px solid #15803d" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>📋</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Total Entries
          </span>
          <p className="text-h2" style={{ margin: "0.25rem 0", color: "#14532d", fontSize: "1.65rem", fontWeight: 800 }}>
            {totalEntries}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Filtered attendance records</span>
        </div>

        <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem", borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🟢</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Total Present
          </span>
          <p className="text-h2" style={{ margin: "0.25rem 0", color: "#059669", fontSize: "1.65rem", fontWeight: 800 }}>
            {presentCount}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>Active check-ins</span>
        </div>

        <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem", borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🔴</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Total Absent
          </span>
          <p className="text-h2" style={{ margin: "0.25rem 0", color: "#dc2626", fontSize: "1.65rem", fontWeight: 800 }}>
            {absentCount}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700 }}>Unexcused absences</span>
        </div>

        <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🟡</div>
          <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
            Late / Excused
          </span>
          <p className="text-h2" style={{ margin: "0.25rem 0", color: "#d97706", fontSize: "1.65rem", fontWeight: 800 }}>
            {lateCount + excusedCount}
          </p>
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lateCount} Late, {excusedCount} Excused</span>
        </div>
      </div>

      {/* Master Data Table */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h4 style={{ fontFamily: "Playfair Display, serif", margin: 0, fontSize: "1.35rem", color: "#14532d" }}>
            📊 Attendance Log Master Ledger ({filteredLogs.length})
          </h4>
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
              Records will appear here as students check in or teachers submit daily attendance.
            </p>
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
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
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
                      {log.teacherId === "SYSTEM_SELF" ? "📍 Self Marked (Dashboard)" : "👨‍🏫 Teacher Roster"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#6b7280", fontSize: "0.82rem" }}>
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
