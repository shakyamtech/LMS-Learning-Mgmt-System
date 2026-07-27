"use client";

import React, { useRef } from "react";

interface StudentProfile {
  id: string;
  name?: string | null;
  email: string;
  faculty?: string | null;
  rollNo?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string | null;
}

interface StudentIDCardProps {
  student: StudentProfile;
}

export default function StudentIDCard({ student }: StudentIDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const studentName = student.name || student.email.split("@")[0];
  const initials = studentName.substring(0, 2).toUpperCase();
  const studentIdCode = student.rollNo || `LITA-${student.id.substring(0, 7).toUpperCase()}`;
  const facultyName = student.faculty || "Information Technology";
  const issueYear = student.createdAt ? new Date(student.createdAt).getFullYear() : new Date().getFullYear();
  const validUntil = issueYear + 4;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
      {/* Header Info */}
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", color: "#0e7490", margin: "0 0 0.25rem 0" }}>
          🪪 Digital Student Identity Card
        </h3>
        <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Official electronic ID card for academic verification and campus access.
        </p>
      </div>

      {/* ID Card Wrapper for Print */}
      <div className="id-card-print-container" ref={cardRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "380px",
            height: "540px",
            borderRadius: "1.25rem",
            backgroundColor: "#ffffff",
            backgroundImage: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            border: "2px solid #0e7490",
            boxShadow: "0 20px 25px -5px rgba(14, 116, 144, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            userSelect: "none"
          }}
        >
          {/* Top Decorative Header */}
          <div style={{
            backgroundColor: "#164e63",
            backgroundImage: "linear-gradient(135deg, #164e63 0%, #0e7490 100%)",
            padding: "1.25rem 1rem 1rem 1rem",
            color: "white",
            textAlign: "center",
            position: "relative"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.65rem", marginBottom: "0.25rem" }}>
              <img
                src="/logo.png"
                alt="Academy Logo"
                style={{ width: "38px", height: "38px", borderRadius: "50%", border: "2px solid #d4af37", backgroundColor: "white" }}
              />
              <div style={{ textAlign: "left" }}>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, fontFamily: "Playfair Display, serif", letterSpacing: "0.02em" }}>
                  LAGANKHEL IT ACADEMY
                </h4>
                <span style={{ fontSize: "0.65rem", color: "#a5f3fc", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Official Student Identity
                </span>
              </div>
            </div>

            {/* Gold Strip Line */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", backgroundColor: "#d4af37" }} />
          </div>

          {/* Student Profile Photo / Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "1.25rem" }}>
            <div style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              backgroundColor: "#0e7490",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.25rem",
              fontWeight: 800,
              border: "4px solid #ffffff",
              boxShadow: "0 4px 12px rgba(14, 116, 144, 0.25)"
            }}>
              {initials}
            </div>

            <h3 style={{ margin: "0.75rem 0 0.15rem 0", fontSize: "1.3rem", fontWeight: 800, color: "#1f2937", textAlign: "center" }}>
              {studentName}
            </h3>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              backgroundColor: "rgba(14, 116, 144, 0.1)",
              color: "#0e7490",
              padding: "0.2rem 0.75rem",
              borderRadius: "9999px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              🎓 {facultyName}
            </span>
          </div>

          {/* Student Details Grid */}
          <div style={{ padding: "1.25rem 1.75rem 1rem 1.75rem", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 0.5rem" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.68rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                  Student ID Number
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1f2937", letterSpacing: "0.03em" }}>
                  {studentIdCode}
                </span>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "0.68rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                  Program / Faculty
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1f2937" }}>
                  {facultyName}
                </span>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "0.68rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                  Issue Year
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151" }}>
                  {issueYear}
                </span>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "0.68rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                  Valid Thru
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151" }}>
                  Dec {validUntil}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "0.5rem", borderTop: "1px dashed #e5e7eb", paddingTop: "0.75rem" }}>
              <span style={{ display: "block", fontSize: "0.68rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                Registered Email
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#4b5563", wordBreak: "break-all" }}>
                {student.email}
              </span>
            </div>
          </div>

          {/* Bottom Bar & Stylized Barcode */}
          <div style={{
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e5e7eb",
            padding: "0.65rem 1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {/* Simulated Barcode */}
            <div style={{ display: "flex", gap: "2px", alignItems: "center", height: "24px" }}>
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3].map((w, idx) => (
                <div key={idx} style={{ width: `${w}px`, height: "100%", backgroundColor: "#1f2937" }} />
              ))}
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 800, color: "#16a34a" }}>
                ✅ VERIFIED ACTIVE
              </span>
              <span style={{ fontSize: "0.6rem", color: "#9ca3af" }}>
                LITA Digital Seal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handlePrint}
          style={{
            backgroundColor: "#0e7490",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 2rem",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(14, 116, 144, 0.25)",
            transition: "transform 0.15s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <span>🖨️</span> Print / Save ID Card
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .id-card-print-container, .id-card-print-container * {
              visibility: visible;
            }
            .id-card-print-container {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        `
      }} />
    </div>
  );
}
