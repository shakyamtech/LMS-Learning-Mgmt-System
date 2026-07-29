"use client";

import React, { useState } from "react";
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
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onAvatarUpdated
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"photo" | "password">("photo");

  // Photo state
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user.avatar || null);
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

  if (!isOpen) return null;

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
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resultDataUrl = canvas.toDataURL("image/jpeg", quality);

            const approxBytes = Math.round(resultDataUrl.length * 0.75);
            if (approxBytes <= 48000) {
              break;
            }
          }

          maxDim = Math.round(maxDim * 0.85);
          quality = Math.max(0.15, quality - 0.12);
        }

        const finalAvatar = resultDataUrl || (event.target?.result as string);
        setPreviewAvatar(finalAvatar);
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
      setPhotoSuccess("Profile photo updated successfully!");
      onAvatarUpdated(previewAvatar);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPass) {
      setPassError("Please enter your current password.");
      return;
    }
    if (!newPass) {
      setPassError("Please enter your new password.");
      return;
    }
    if (newPass.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setIsSavingPass(true);
    const res = await changeOwnPassword(currentPass, newPass);
    setIsSavingPass(false);

    if (res.error) {
      setPassError(res.error);
    } else {
      setPassSuccess("Your security password has been updated successfully!");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    }
  };

  const initials = (user.name || user.email || "US").substring(0, 2).toUpperCase();

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(6px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "1.25rem",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        animation: "modalSlideUp 0.3s ease-out"
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: "#164e63",
          backgroundImage: "linear-gradient(135deg, #164e63 0%, #0e7490 100%)",
          padding: "1.25rem 1.5rem",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
              ⚙️ Account &amp; Security Settings
            </h3>
            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "#a5f3fc" }}>
              {user.name} ({user.email})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc"
        }}>
          <button
            type="button"
            onClick={() => setActiveTab("photo")}
            style={{
              flex: 1,
              padding: "0.85rem",
              border: "none",
              borderBottom: activeTab === "photo" ? "3px solid #0e7490" : "3px solid transparent",
              backgroundColor: activeTab === "photo" ? "#ffffff" : "transparent",
              color: activeTab === "photo" ? "#0e7490" : "#64748b",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            📷 Profile Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            style={{
              flex: 1,
              padding: "0.85rem",
              border: "none",
              borderBottom: activeTab === "password" ? "3px solid #0e7490" : "3px solid transparent",
              backgroundColor: activeTab === "password" ? "#ffffff" : "transparent",
              color: activeTab === "password" ? "#0e7490" : "#64748b",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            🔐 Change Password
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: "1.5rem" }}>
          {activeTab === "photo" && (
            <div style={{ textAlign: "center" }}>
              {/* Photo Preview Circle */}
              <div style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                backgroundColor: "#0e7490",
                color: "white",
                margin: "0 auto 1.25rem auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: 800,
                border: "4px solid #ffffff",
                boxShadow: "0 0 0 3px rgba(14, 116, 144, 0.3), 0 8px 16px rgba(0, 0, 0, 0.15)",
                overflow: "hidden"
              }}>
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Profile Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  initials
                )}
              </div>

              {photoError && (
                <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "0.65rem", borderRadius: "0.5rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  {photoError}
                </div>
              )}
              {photoSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "0.65rem", borderRadius: "0.5rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  {photoSuccess}
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  htmlFor="user-photo-input"
                  style={{
                    display: "inline-block",
                    padding: "0.6rem 1.25rem",
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    border: "1px solid #cbd5e1"
                  }}
                >
                  📁 Choose New Photo
                </label>
                <input
                  id="user-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                  ⚡ Auto-compressed under 50KB for fast campus sync.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isUploadingPhoto || !selectedFile}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: isUploadingPhoto || !selectedFile ? "#94a3b8" : "#0e7490",
                  backgroundImage: isUploadingPhoto || !selectedFile ? "none" : "linear-gradient(135deg, #0e7490 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.65rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: isUploadingPhoto || !selectedFile ? "not-allowed" : "pointer",
                  boxShadow: isUploadingPhoto || !selectedFile ? "none" : "0 4px 14px rgba(14, 116, 144, 0.25)"
                }}
              >
                {isUploadingPhoto ? "Saving Photo..." : "Save Profile Photo"}
              </button>
            </div>
          )}

          {activeTab === "password" && (
            <form onSubmit={handleSavePassword}>
              {passError && (
                <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "0.65rem", borderRadius: "0.5rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "0.65rem", borderRadius: "0.5rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  {passSuccess}
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPass}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: isSavingPass ? "#94a3b8" : "#0e7490",
                  backgroundImage: isSavingPass ? "none" : "linear-gradient(135deg, #0e7490 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.65rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: isSavingPass ? "not-allowed" : "pointer",
                  boxShadow: isSavingPass ? "none" : "0 4px 14px rgba(14, 116, 144, 0.25)"
                }}
              >
                {isSavingPass ? "Updating Password..." : "Update Security Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
