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
      {/* Screen Header & Action Button */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.75rem", color: "#0e7490", margin: "0 0 0.25rem 0" }}>
            💳 Fee & Billing Statement
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            View your fee structure, total payments made, remaining balance, and print official fee vouchers.
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
          <span>🧾</span> Print Official Bill Voucher
        </button>
      </div>

      {/* On-Screen Billing Dashboard View */}
      <div className="on-screen-dashboard-view" ref={statementRef} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Top 3 Summary Cards */}
        <div className="billing-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {/* Card 1: Total Fee */}
          <div className="billing-card" style={{
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #e5e7eb",
            borderLeft: "5px solid #0891b2",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
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
          <div className="billing-card" style={{
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #e5e7eb",
            borderLeft: "5px solid #10b981",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
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
          <div className="billing-card" style={{
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #e5e7eb",
            borderLeft: isFullyPaid ? "5px solid #10b981" : "5px solid #f59e0b",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
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
        <div className="billing-card" style={{
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
              borderRadius: "9999px"
            }} />
          </div>
        </div>

        {/* Detailed Payment History Ledger */}
        <div className="billing-card" style={{
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
              border: "1px dashed #cbd5e1",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#f8fafc"
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

      {/* DEDICATED OFFICIAL COLLEGE FEE BILL / CASH VOUCHER FOR PRINT (Compact Half Page Format) */}
      <div className="official-bill-receipt-voucher" style={{ display: "none" }}>
        <div style={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          border: "2px solid #0e7490",
          borderRadius: "8px",
          padding: "1rem 1.15rem",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box"
        }}>
          {/* Bill Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0e7490", paddingBottom: "0.65rem", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <img src="/logo.png" alt="LITA Logo" style={{ width: "46px", height: "46px", borderRadius: "50%", border: "2px solid #d4af37", flexShrink: 0 }} />
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0e7490", fontFamily: "Playfair Display, serif", lineHeight: 1.1 }}>
                  LAGANKHEL IT ACADEMY
                </h2>
                <span style={{ fontSize: "0.68rem", color: "#4b5563", fontWeight: 600, display: "block" }}>
                  Lagankhel-12, Lalitpur, Nepal • Tel: +977 01-55XXXXX
                </span>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#0e7490", textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-block", marginTop: "0.1rem" }}>
                  OFFICIAL FEE RECEIPT &amp; CASH VOUCHER
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right", border: "1px solid #cbd5e1", padding: "0.35rem 0.65rem", borderRadius: "6px", backgroundColor: "#f8fafc", flexShrink: 0 }}>
              <div style={{ fontSize: "0.62rem", color: "#6b7280", fontWeight: 700 }}>VOUCHER NO.</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0e7490" }}>LITA-FEE-{studentEmail.split("@")[0].toUpperCase()}</div>
              <div style={{ fontSize: "0.65rem", color: "#4b5563", marginTop: "0.1rem" }}><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Student Info Box */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem 1rem", backgroundColor: "#f1f5f9", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", marginBottom: "0.75rem", color: "#374151" }}>
            <div><strong style={{ color: "#111827" }}>Student Name:</strong> {studentName}</div>
            <div><strong style={{ color: "#111827" }}>Academic Program:</strong> {faculty || "General"}</div>
            <div><strong style={{ color: "#111827" }}>Student Roll / ID:</strong> {rollNo || `ID: ${studentEmail.split("@")[0]}`}</div>
            <div><strong style={{ color: "#111827" }}>Email:</strong> {studentEmail}</div>
          </div>

          {/* Particulars & Fee Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", marginBottom: "0.75rem", color: "#1f2937" }}>
            <thead>
              <tr style={{ backgroundColor: "#0e7490", color: "#ffffff" }}>
                <th style={{ padding: "0.4rem 0.55rem", textAlign: "center", width: "35px" }}>S.N.</th>
                <th style={{ padding: "0.4rem 0.55rem", textAlign: "left" }}>Particulars / Description</th>
                <th style={{ padding: "0.4rem 0.55rem", textAlign: "right", width: "95px" }}>Total (Rs.)</th>
                <th style={{ padding: "0.4rem 0.55rem", textAlign: "right", width: "95px" }}>Paid (Rs.)</th>
                <th style={{ padding: "0.4rem 0.55rem", textAlign: "right", width: "95px" }}>Due (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                <td style={{ padding: "0.45rem 0.55rem", textAlign: "center", color: "#374151" }}>1</td>
                <td style={{ padding: "0.45rem 0.55rem", fontWeight: 700, color: "#111827" }}>
                  Academic Tuition &amp; Program Fee ({faculty || "General"})
                </td>
                <td style={{ padding: "0.45rem 0.55rem", textAlign: "right", fontWeight: 700, color: "#111827" }}>{totalFee.toLocaleString()}</td>
                <td style={{ padding: "0.45rem 0.55rem", textAlign: "right", fontWeight: 700, color: "#059669" }}>{paidFee.toLocaleString()}</td>
                <td style={{ padding: "0.45rem 0.55rem", textAlign: "right", fontWeight: 700, color: dueFee > 0 ? "#dc2626" : "#059669" }}>{dueFee.toLocaleString()}</td>
              </tr>

              {transactions.length > 0 && transactions.map((tx, idx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#fafafa" }}>
                  <td style={{ padding: "0.35rem 0.55rem", textAlign: "center", fontSize: "0.75rem", color: "#6b7280" }}>{idx + 2}</td>
                  <td style={{ padding: "0.35rem 0.55rem", fontSize: "0.75rem", color: "#374151" }}>
                    Receipt: <strong style={{ color: "#111827" }}>{tx.title}</strong> ({tx.date}) [{tx.paymentMethod}]
                  </td>
                  <td style={{ padding: "0.35rem 0.55rem", textAlign: "right", fontSize: "0.75rem", color: "#6b7280" }}>-</td>
                  <td style={{ padding: "0.35rem 0.55rem", textAlign: "right", fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>+{tx.amount.toLocaleString()}</td>
                  <td style={{ padding: "0.35rem 0.55rem", textAlign: "right", fontSize: "0.75rem", color: "#6b7280" }}>-</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Clearance Summary Box */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "1rem", color: "#374151" }}>
            <div style={{ fontSize: "0.75rem" }}>
              <strong style={{ color: "#111827" }}>Payment Status:</strong>{" "}
              <span style={{ fontWeight: 800, color: isFullyPaid ? "#059669" : "#d97706" }}>
                {isFullyPaid ? "✅ FULLY CLEARED (100%)" : `⚠️ ${percentPaid}% CLEARED (${dueFee.toLocaleString()} DUE)`}
              </span>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.78rem" }}>
              <span style={{ color: "#4b5563", marginRight: "0.85rem" }}>Total Deposited: <strong style={{ color: "#059669" }}>Rs. {paidFee.toLocaleString()}</strong></span>
              <span style={{ color: "#4b5563" }}>Balance Due: <strong style={{ color: dueFee > 0 ? "#dc2626" : "#059669" }}>Rs. {dueFee.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Signature & Seal Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "1rem", borderTop: "1px dashed #cbd5e1" }}>
            <div style={{ textAlign: "center", borderTop: "1px solid #4b5563", width: "130px", paddingTop: "0.2rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#374151" }}>Student Signature</span>
            </div>
            <div style={{ textAlign: "center", fontSize: "0.62rem", color: "#6b7280" }}>
              <span>✅ Official Computer-Generated Cash Receipt</span>
              <br />
              <span>Lagankhel IT Academy • Finance &amp; Accounting Office</span>
            </div>
            <div style={{ textAlign: "center", borderTop: "1px solid #4b5563", width: "150px", paddingTop: "0.2rem" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#374151" }}>Authorized Accountant</span>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .admin-sidebar,
            .admin-navbar,
            .admin-sidebar-footer,
            aside,
            header,
            button,
            .no-print,
            .on-screen-dashboard-view {
              display: none !important;
            }
            .admin-layout, .admin-main, .admin-content, .card {
              background: none !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
            }
            .official-bill-receipt-voucher {
              display: block !important;
              width: 100% !important;
              max-width: 680px !important;
              margin: 0 auto !important;
              padding-top: 5px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `
      }} />
    </div>
  );
}
