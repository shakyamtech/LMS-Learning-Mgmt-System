"use client";

import React, { useState, useEffect, useRef } from "react";
import { updateOwnAvatar, changeOwnPassword } from "@/app/actions/auth";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
  };
  onAvatarUpdated: (newAvatar: string) => void;
  onLogout?: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onAvatarUpdated,
  onLogout,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"photo" | "password">("photo");
  const panelRef = useRef<HTMLDivElement>(null);

  // Photo state
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(
    user.avatar || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Password state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPhotoError(null);
    setPhotoSuccess(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let maxDim = 300;
        let quality = 0.75;
        let resultDataUrl = "";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        for (let attempt = 0; attempt < 8; attempt++) {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
          } else {
            if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
          }
          canvas.width = width;
          canvas.height = height;
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resultDataUrl = canvas.toDataURL("image/jpeg", quality);
            if (Math.round(resultDataUrl.length * 0.75) <= 48000) break;
          }
          maxDim = Math.round(maxDim * 0.85);
          quality = Math.max(0.15, quality - 0.12);
        }

        setPreviewAvatar(resultDataUrl || (event.target?.result as string));
      };
    };
  };

  const handleSavePhoto = async () => {
    if (!previewAvatar) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);
    setPhotoSuccess(null);
    const res = await updateOwnAvatar(previewAvatar);
    setIsUploadingPhoto(false);
    if (res.error) {
      setPhotoError(res.error);
    } else {
      setPhotoSuccess("Profile photo updated!");
      onAvatarUpdated(previewAvatar);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);
    if (!currentPass) { setPassError("Enter your current password."); return; }
    if (!newPass) { setPassError("Enter your new password."); return; }
    if (newPass.length < 6) { setPassError("New password must be at least 6 characters."); return; }
    if (newPass !== confirmPass) { setPassError("Passwords do not match."); return; }
    setIsSavingPass(true);
    const res = await changeOwnPassword(currentPass, newPass);
    setIsSavingPass(false);
    if (res.error) {
      setPassError(res.error);
    } else {
      setPassSuccess("Password updated successfully!");
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    }
  };

  const initials = (user.name || user.email || "US").substring(0, 2).toUpperCase();
  const isTeacher = user.role === "TEACHER";
  const isAdmin = user.role === "ADMIN";

  const accentColor = isAdmin
    ? "#1B5E20"
    : isTeacher
    ? "#dc2626"
    : "#0891b2";

  const accentGradientEnd = isAdmin
    ? "#123d15"
    : isTeacher
    ? "#991b1b"
    : "#0e7490";

  const accentLight = isAdmin
    ? "rgba(27,94,32,0.08)"
    : isTeacher
    ? "rgba(220,38,38,0.08)"
    : "rgba(8,145,178,0.08)";

  const accentBorder = isAdmin
    ? "rgba(27,94,32,0.25)"
    : isTeacher
    ? "rgba(220,38,38,0.25)"
    : "rgba(8,145,178,0.25)";

  return (
    <>
      {/* Inline keyframes */}
      <style>{`
        @keyframes dropSlideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .ep-input:focus {
          outline: none;
          border-color: ${accentColor} !important;
          box-shadow: 0 0 0 3px ${accentBorder} !important;
        }
        .ep-tab-btn { transition: color 0.15s, border-color 0.15s, background 0.15s; }
        .ep-tab-btn:hover { background: ${accentLight} !important; }
        .ep-save-btn { transition: opacity 0.15s, box-shadow 0.15s; }
        .ep-save-btn:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      {/* Thin backdrop — just dims slightly, does NOT centre */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.08)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Dropdown panel — absolutely positioned top-right */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: "68px",           /* just below the navbar */
          right: "18px",
          zIndex: 9999,
          width: "360px",
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          boxShadow: "0 20px 60px -8px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08)",
          border: `1px solid ${accentBorder}`,
          overflow: "hidden",
          /* Slide-down animation */
          animation: isOpen ? "dropSlideDown 0.28s cubic-bezier(0.34,1.38,0.64,1) both" : "none",
          /* Hide (not unmount) when closed so animation plays cleanly */
          visibility: isOpen ? "visible" : "hidden",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: isOpen ? "none" : "opacity 0.18s ease, visibility 0.18s",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Account Settings"
      >
        {/* ── Header ── */}
        <div style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentGradientEnd} 100%)`,
          padding: "1rem 1.1rem 0.8rem",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          {/* Avatar preview */}
          <div style={{
            width: "46px", height: "46px", borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            border: "2.5px solid rgba(255,255,255,0.7)",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "1.1rem", flexShrink: 0,
          }}>
            {previewAvatar
              ? <img src={previewAvatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
          </div>

          {/* Close ✕ */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.18)", border: "none", color: "white",
              borderRadius: "50%", width: "28px", height: "28px",
              cursor: "pointer", fontSize: "0.95rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          {(["photo", "password"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className="ep-tab-btn"
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "0.72rem",
                border: "none",
                borderBottom: activeTab === tab ? `3px solid ${accentColor}` : "3px solid transparent",
                backgroundColor: activeTab === tab ? "#ffffff" : "transparent",
                color: activeTab === tab ? accentColor : "#64748b",
                fontWeight: 700, fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {tab === "photo" ? "📷 Profile Photo" : "🔐 Change Password"}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "1.1rem 1.25rem 1.25rem" }}>

          {/* Photo Tab */}
          {activeTab === "photo" && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "90px", height: "90px", borderRadius: "50%",
                backgroundColor: accentColor, color: "white",
                margin: "0 auto 1rem auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 800,
                border: "3px solid #fff",
                boxShadow: `0 0 0 3px ${accentBorder}, 0 6px 14px rgba(0,0,0,0.12)`,
                overflow: "hidden",
              }}>
                {previewAvatar
                  ? <img src={previewAvatar} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials}
              </div>

              {photoError && (
                <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.78rem", marginBottom: "0.85rem", textAlign: "left" }}>
                  {photoError}
                </div>
              )}
              {photoSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.78rem", marginBottom: "0.85rem", textAlign: "left" }}>
                  ✅ {photoSuccess}
                </div>
              )}

              <label htmlFor="ep-photo-input" style={{
                display: "inline-block", padding: "0.5rem 1.1rem",
                backgroundColor: "#f1f5f9", color: "#334155",
                borderRadius: "9999px", fontWeight: 700, fontSize: "0.8rem",
                cursor: "pointer", border: "1px solid #cbd5e1", marginBottom: "0.5rem",
              }}>
                📁 Choose Photo
              </label>
              <input id="ep-photo-input" type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />

              <p style={{ fontSize: "0.7rem", color: "#94a3b8", margin: "0 0 1rem 0" }}>
                Auto-compressed under 50 KB
              </p>

              <button
                type="button"
                className="ep-save-btn"
                onClick={handleSavePhoto}
                disabled={isUploadingPhoto || !selectedFile}
                style={{
                  width: "100%", padding: "0.68rem",
                  backgroundColor: isUploadingPhoto || !selectedFile ? "#cbd5e1" : accentColor,
                  backgroundImage: isUploadingPhoto || !selectedFile ? "none" : `linear-gradient(135deg, ${accentColor} 0%, ${accentGradientEnd} 100%)`,
                  color: "white", border: "none", borderRadius: "0.6rem",
                  fontWeight: 700, fontSize: "0.85rem",
                  cursor: isUploadingPhoto || !selectedFile ? "not-allowed" : "pointer",
                }}
              >
                {isUploadingPhoto ? "Saving…" : "Save Profile Photo"}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {passError && (
                <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.78rem" }}>
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.78rem" }}>
                  ✅ {passSuccess}
                </div>
              )}

              {[
                { label: "Current Password", value: currentPass, setter: setCurrentPass, placeholder: "Enter current password" },
                { label: "New Password",     value: newPass,     setter: setNewPass,     placeholder: "Min. 6 characters" },
                { label: "Confirm New",      value: confirmPass, setter: setConfirmPass, placeholder: "Re-enter new password" },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                    {label}
                  </label>
                  <input
                    type="password"
                    className="ep-input"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    style={{
                      width: "100%", padding: "0.6rem 0.8rem",
                      borderRadius: "0.5rem", border: "1px solid #cbd5e1",
                      fontSize: "0.85rem", boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="ep-save-btn"
                disabled={isSavingPass}
                style={{
                  width: "100%", padding: "0.68rem",
                  backgroundColor: isSavingPass ? "#cbd5e1" : accentColor,
                  backgroundImage: isSavingPass ? "none" : `linear-gradient(135deg, ${accentColor} 0%, ${accentGradientEnd} 100%)`,
                  color: "white", border: "none", borderRadius: "0.6rem",
                  fontWeight: 700, fontSize: "0.85rem",
                  cursor: isSavingPass ? "not-allowed" : "pointer",
                  marginTop: "0.25rem",
                }}
              >
                {isSavingPass ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}

          {/* Logout Section */}
          {onLogout && (
            <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  borderRadius: "0.6rem",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fef2f2";
                  e.currentTarget.style.color = "#dc2626";
                }}
              >
                🚪 Sign Out / Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
