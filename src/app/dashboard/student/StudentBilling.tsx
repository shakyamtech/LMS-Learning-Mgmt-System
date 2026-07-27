"use client";

import React, { useRef } from "react";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  notes?: string;
}

interface StudentBillingProps {
  totalFee: number;
  paidFee: number;
  studentName: string;
  studentEmail: string;
  faculty?: string | null;
  rollNo?: string | null;
  transactions: Transaction[];
}

export default function StudentBilling({
  totalFee,
  paidFee,
  studentName,
  studentEmail,
  faculty,
  rollNo,
  transactions
}: StudentBillingProps) {
  const statementRef = useRef<HTMLDivElement>(null);

  const dueFee = Math.max(0, totalFee - paidFee);
  const percentPaid = totalFee > 0 ? Math.min(100, Math.round((paidFee / totalFee) * 100)) : 0;
  const isFullyPaid = totalFee > 0 && dueFee === 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
      {/* Header Info */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", color: "#0e7490", margin: "0 0 0.25rem 0" }}>
            💳 Fee & Billing Statement
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            View your fee structure, total payments made, remaining balance, and official payment receipts.
          </p>
        </div>
        <button
          onClick={handlePrint}
          style={{
            backgroundColor: "#0e7490",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "0.65rem 1.5rem",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(14, 116, 144, 0.2)"
          }}
        >
          <span>🖨️</span> Print Statement
        </button>
      </div>

      {/* Printable Area Wrapper */}
      <div className="billing-statement-print-area" ref={statementRef} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Top 3 Summary Cards */}
        <div className="grid-cols-3" style={{ gap: "1.5rem" }}>
          {/* Card 1: Total Fee */}
          <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderLeft: "4px solid #0891b2" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>📜</div>
            <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
              Total Course Fee
            </span>
            <p className="text-h2" style={{ margin: "0.35rem 0 0.15rem 0", color: "#0e7490", fontSize: "1.75rem", fontWeight: 800 }}>
              Rs. {totalFee.toLocaleString()}
            </p>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              Faculty: <strong>{faculty || "General"}</strong>
            </span>
          </div>

          {/* Card 2: Amount Paid */}
          <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderLeft: "4px solid #10b981" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>✅</div>
            <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
              Total Paid Amount
            </span>
            <p className="text-h2" style={{ margin: "0.35rem 0 0.15rem 0", color: "#059669", fontSize: "1.75rem", fontWeight: 800 }}>
              Rs. {paidFee.toLocaleString()}
            </p>
            <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
              {percentPaid}% of total fee paid
            </span>
          </div>

          {/* Card 3: Remaining Due */}
          <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderLeft: isFullyPaid ? "4px solid #10b981" : "4px solid #f59e0b" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}>{isFullyPaid ? "🎉" : "⏳"}</div>
            <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
              Remaining Due / Balance
            </span>
            <p className="text-h2" style={{ margin: "0.35rem 0 0.15rem 0", color: isFullyPaid ? "#059669" : "#d97706", fontSize: "1.75rem", fontWeight: 800 }}>
              Rs. {dueFee.toLocaleString()}
            </p>
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: isFullyPaid ? "#059669" : "#d97706"
            }}>
              {isFullyPaid ? "✅ Fully Cleared" : "⚠️ Outstanding Balance"}
            </span>
          </div>
        </div>

        {/* Fee Payment Progress Bar */}
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
                Payment Clearance Status
              </h4>
              <p className="text-muted" style={{ margin: "0.15rem 0 0 0", fontSize: "0.82rem" }}>
                Overall percentage of academic fees cleared.
              </p>
            </div>
            <span style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              backgroundColor: isFullyPaid ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
              color: isFullyPaid ? "#059669" : "#d97706",
              padding: "0.3rem 0.85rem",
              borderRadius: "9999px"
            }}>
              {percentPaid}% CLEARED
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
              width: `${percentPaid}%`,
              height: "100%",
              backgroundColor: isFullyPaid ? "#10b981" : "#0e7490",
              backgroundImage: "linear-gradient(90deg, #0e7490 0%, #10b981 100%)",
              borderRadius: "9999px",
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>

        {/* Detailed Payment History Ledger */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h4 style={{ fontFamily: "Playfair Display, serif", margin: 0, fontSize: "1.35rem", color: "#0e7490" }}>
              🧾 Payment History & Receipts ({transactions.length})
            </h4>
            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
              Student: <strong>{studentName}</strong> ({rollNo || `ID: ${studentEmail.split("@")[0]}`})
            </span>
          </div>

          {transactions.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 1rem",
              border: "1px dashed #e5e7eb",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#f9fafb"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💳</div>
              <h4 style={{ margin: 0, fontWeight: 700, color: "var(--college-text)" }}>No Transaction Receipts Found</h4>
              <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                Payment records will appear here as fees are deposited or verified by the administration.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Date</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Receipt Description</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Category</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151" }}>Method</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151", textAlign: "right" }}>Amount Paid</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#374151", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.85rem 1rem", color: "#4b5563", whiteSpace: "nowrap" }}>
                        {tx.date}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#1f2937" }}>
                        {tx.title}
                        {tx.notes && <span style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", fontWeight: 400 }}>{tx.notes}</span>}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "#4b5563" }}>
                        <span style={{ backgroundColor: "#f3f4f6", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)", fontSize: "0.78rem" }}>
                          {tx.category || "Tuition Fee"}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "#4b5563" }}>
                        💳 {tx.paymentMethod || "Direct"}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "#059669", textAlign: "right" }}>
                        + Rs. {tx.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                        <span style={{
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          color: "#059669",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px"
                        }}>
                          ✅ Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: portrait;
              margin: 1cm;
            }
            body {
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print, aside, header, button {
              display: none !important;
            }
            .admin-layout, .admin-main, .admin-content, .card {
              background: none !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
            .billing-statement-print-area {
              display: block !important;
            }
          }
        `
      }} />
    </div>
  );
}
