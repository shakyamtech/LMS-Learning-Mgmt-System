"use client";

import { useState } from "react";
import Link from "next/link";

import { JWTPayload } from "@/lib/auth-utils";

interface MobileMenuProps {
  session: JWTPayload | null;
  dashboardUrl: string;
  logoutAction: () => Promise<void>;
}

export default function MobileMenu({ session, dashboardUrl, logoutAction }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className={`mobile-menu-btn-react ${isOpen ? "active" : ""}`}
        aria-label="Toggle Menu"
      >
        <span className="bar1"></span>
        <span className="bar2"></span>
        <span className="bar3"></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="mobile-menu-overlay-react"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`mobile-nav-drawer-react ${isOpen ? "open" : ""}`}
      >
        {/* Close Button X */}
        <button
          onClick={closeMenu}
          className="mobile-drawer-close-react"
        >
          ✕
        </button>

        <Link href="/" onClick={closeMenu} className="mobile-drawer-link">Home</Link>
        <Link href="/about" onClick={closeMenu} className="mobile-drawer-link">About Us</Link>
        <Link href="/admissions" onClick={closeMenu} className="mobile-drawer-link">Admissions</Link>
        <Link href="/academics" onClick={closeMenu} className="mobile-drawer-link">Academics</Link>
        <Link href="/campus-life" onClick={closeMenu} className="mobile-drawer-link">Campus Life</Link>

        <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {session ? (
            <>
              <Link
                href={dashboardUrl}
                onClick={closeMenu}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "1rem",
                  border: "2px solid var(--college-accent)",
                  borderRadius: "6px",
                  color: "var(--college-accent)",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Console ⚡
              </Link>
              <form action={logoutAction} style={{ width: "100%" }}>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "1rem",
                    backgroundColor: "var(--college-accent)",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMenu}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "1rem",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "1rem",
                  backgroundColor: "var(--college-accent)",
                  borderRadius: "6px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
