"use client";

import { login } from "@/app/actions/auth";
import Link from "next/link";
import { useActionState, useState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-center animate-fade-in bg-cream-pattern" style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "var(--college-bg-cream)" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", padding: "3rem 2.5rem", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "Playfair Display, serif", color: "var(--college-primary)", fontSize: "2.5rem", fontWeight: 800, margin: "0 0 0.5rem 0" }}>Welcome Back</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.95rem" }}>
            Log in to manage your LMS dashboard
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
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              className="input-field"
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              required
              disabled={isPending}
              style={{ fontSize: "0.95rem" }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: "2rem" }}>
            <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
              <label className="input-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              <a href="#" className="auth-login-link" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }} onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                required
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", marginBottom: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link href="/register" className="auth-login-link" style={{ fontWeight: 600, color: "var(--college-primary)" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
