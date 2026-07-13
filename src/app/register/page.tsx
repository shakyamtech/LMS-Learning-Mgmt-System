"use client";

import { register } from "@/app/actions/auth";
import Link from "next/link";
import { useActionState, useState } from "react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null);
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: "100vh", padding: "2rem 1rem", background: "radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "560px", padding: "3rem 2.5rem", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="text-h2 text-gradient" style={{ margin: "0 0 0.5rem 0" }}>Create Account</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.95rem" }}>
            Join our modern LMS platform today
          </p>
        </div>

        <form action={formAction}>
          {state?.error && (
            <div style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid var(--error)",
              color: "var(--error)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>⚠️</span> {state.error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input
              className="input-field"
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              required
              disabled={isPending}
              style={{ fontSize: "0.95rem" }}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              className="input-field"
              type="email"
              id="email"
              name="email"
              placeholder="john@example.com"
              required
              disabled={isPending}
              style={{ fontSize: "0.95rem" }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: "1.5rem" }}>
            <label className="input-label" htmlFor="password">Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="•••••••• (Min 6 characters)"
                required
                minLength={6}
                disabled={isPending}
                style={{ fontSize: "0.95rem", paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.25rem",
                  userSelect: "none",
                  outline: "none",
                  transition: "color var(--transition-fast)"
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Hidden input to pass selected role to the form action */}
          <input type="hidden" name="role" value={selectedRole} />

          <div className="input-group" style={{ marginBottom: "2.5rem" }}>
            <label className="input-label">Select Your Role</label>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "0.5rem" }}>
              {/* Student Card */}
              <div 
                onClick={() => setSelectedRole("STUDENT")}
                style={{
                  border: selectedRole === "STUDENT" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  backgroundColor: selectedRole === "STUDENT" ? "rgba(79, 70, 229, 0.05)" : "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  boxShadow: selectedRole === "STUDENT" ? "0 4px 12px rgba(79, 70, 229, 0.15)" : "none",
                  transform: selectedRole === "STUDENT" ? "translateY(-2px)" : "none",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 0.25rem", marginTop: "-0.25rem" }}>
                  <input 
                    type="radio" 
                    checked={selectedRole === "STUDENT"} 
                    onChange={() => setSelectedRole("STUDENT")}
                    style={{ accentColor: "var(--primary)", cursor: "pointer" }} 
                  />
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🎓</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>Student</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem", lineHeight: "1.2" }}>Learn & view courses</div>
              </div>

              {/* Teacher Card */}
              <div 
                onClick={() => setSelectedRole("TEACHER")}
                style={{
                  border: selectedRole === "TEACHER" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  backgroundColor: selectedRole === "TEACHER" ? "rgba(79, 70, 229, 0.05)" : "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  boxShadow: selectedRole === "TEACHER" ? "0 4px 12px rgba(79, 70, 229, 0.15)" : "none",
                  transform: selectedRole === "TEACHER" ? "translateY(-2px)" : "none",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 0.25rem", marginTop: "-0.25rem" }}>
                  <input 
                    type="radio" 
                    checked={selectedRole === "TEACHER"} 
                    onChange={() => setSelectedRole("TEACHER")}
                    style={{ accentColor: "var(--primary)", cursor: "pointer" }} 
                  />
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>👨‍🏫</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>Teacher</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem", lineHeight: "1.2" }}>Manage & teach classes</div>
              </div>

              {/* Admin Card */}
              <div 
                onClick={() => setSelectedRole("ADMIN")}
                style={{
                  border: selectedRole === "ADMIN" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  backgroundColor: selectedRole === "ADMIN" ? "rgba(79, 70, 229, 0.05)" : "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  boxShadow: selectedRole === "ADMIN" ? "0 4px 12px rgba(79, 70, 229, 0.15)" : "none",
                  transform: selectedRole === "ADMIN" ? "translateY(-2px)" : "none",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 0.25rem", marginTop: "-0.25rem" }}>
                  <input 
                    type="radio" 
                    checked={selectedRole === "ADMIN"} 
                    onChange={() => setSelectedRole("ADMIN")}
                    style={{ accentColor: "var(--primary)", cursor: "pointer" }} 
                  />
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>⚡</div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>Admin</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem", lineHeight: "1.2" }}>Control the system</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isPending}
            style={{ width: "100%", padding: "0.875rem", display: "flex", gap: "0.5rem", position: "relative" }}
          >
            {isPending ? (
              <>
                <span className="spinner" style={{
                  width: "18px",
                  height: "18px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite"
                }} />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", marginBottom: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "var(--primary)" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
