import { cookies } from "next/headers";
import Link from "next/link";
import { decryptSession } from "@/lib/auth-utils";
import { logout } from "@/app/actions/auth";

export default async function SiteHeader() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  let session = null;
  if (sessionToken) {
    try {
      session = await decryptSession(sessionToken);
    } catch {
      // stale session — ignore
    }
  }

  const getDashboardUrl = (role: string) => {
    switch (role) {
      case "ADMIN":   return "/dashboard/admin";
      case "TEACHER": return "/dashboard/teacher";
      default:        return "/dashboard/student";
    }
  };

  return (
    <>
      {/* Top Utility Bar */}
      <div
        style={{
          backgroundColor: "var(--college-primary-dark)",
          color: "white",
          padding: "0.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.85rem",
        }}
      >
        <span>📞 01-5430967</span>
        <span>📍 Lagankhel, Lalitpur, Nepal</span>
      </div>

      {/* Main Navigation Header */}
      <header
        style={{
          backgroundColor: "var(--college-primary)",
          color: "white",
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo + Name */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            color: "white",
          }}
        >
          <img
            src="/logo.png"
            alt="Lagankhel IT Academy Logo"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--college-accent)",
            }}
          />
          <span
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.4rem",
              fontWeight: 700,
            }}
          >
            Lagankhel IT Academy
          </span>
        </Link>

        {/* Nav Links */}
        <nav
          style={{
            display: "flex",
            gap: "2rem",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          {[
            { label: "About Us",     href: "/about" },
            { label: "Admissions",   href: "/admissions" },
            { label: "Academics",    href: "/academics" },
            { label: "Campus Life",  href: "/campus-life" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "rgba(255,255,255,0.88)",
                textDecoration: "none",
                transition: "color 0.2s",
                padding: "0.25rem 0",
                borderBottom: "2px solid transparent",
              }}
              className="site-nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session ? (
            <>
              <Link
                href={getDashboardUrl(session.role)}
                style={{
                  padding: "0.6rem 1.5rem",
                  border: "2px solid var(--college-accent)",
                  borderRadius: "4px",
                  color: "var(--college-accent)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                Console ⚡
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem",
                    backgroundColor: "var(--college-accent)",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.9rem",
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
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  padding: "0.6rem 1.5rem",
                  border: "2px solid var(--college-accent)",
                  borderRadius: "4px",
                  color: "var(--college-accent)",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
