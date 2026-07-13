import { cookies } from "next/headers";
import Link from "next/link";
import { decryptSession } from "@/lib/auth-utils";
import { logout } from "@/app/actions/auth";
import HeaderScrollHandler from "./HeaderScrollHandler";
import MobileMenu from "./MobileMenu";

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
      <HeaderScrollHandler />
      
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
        className="site-main-header"
        style={{
          backgroundColor: "var(--college-primary)",
          color: "white",
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
            className="brand-name"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.4rem",
              fontWeight: 700,
            }}
          >
            Lagankhel IT Academy
          </span>
        </Link>

        {/* Nav Links with Dropdowns (Desktop only) */}
        <nav
          className="desktop-nav"
          style={{
            display: "flex",
            gap: "2rem",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          {[
            { label: "Home", href: "/" },
            {
              label: "About Us",
              href: "/about",
              submenu: [
                { label: "Overview & Mission", href: "/about#about" },
                { label: "Our Core Values", href: "/about#values" },
                { label: "Meet Our Leadership", href: "/about#team" },
              ],
            },
            {
              label: "Admissions",
              href: "/admissions",
              submenu: [
                { label: "How to Apply", href: "/admissions#apply" },
                { label: "Required Documents", href: "/admissions#requirements" },
                { label: "Scholarships", href: "/admissions#scholarships" },
              ],
            },
            {
              label: "Academics",
              href: "/academics",
              submenu: [
                { label: "Courses & Programs", href: "/academics#programs" },
                { label: "How We Teach", href: "/academics#methodology" },
                { label: "Expert Faculty", href: "/academics#faculty" },
              ],
            },
            {
              label: "Campus Life",
              href: "/campus-life",
              submenu: [
                { label: "Upcoming Events", href: "/campus-life#events" },
                { label: "Clubs & Societies", href: "/campus-life#clubs" },
                { label: "World-Class Facilities", href: "/campus-life#facilities" },
              ],
            },
          ].map((link) => (
            <div key={link.href} className="nav-item-container">
              <Link
                href={link.href}
                style={{
                  color: "rgba(255,255,255,0.88)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  padding: "0.25rem 0",
                  borderBottom: "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
                className="site-nav-link"
              >
                {link.label}
                {link.submenu && (
                  <span style={{ fontSize: "0.55rem", opacity: 0.8, transform: "scale(0.8)" }}>▼</span>
                )}
              </Link>
              {link.submenu && (
                <div className="dropdown-menu">
                  {link.submenu.map((sub) => (
                    <Link key={sub.href} href={sub.href} className="dropdown-item">
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Auth Buttons (Desktop only) */}
        <div className="desktop-auth" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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

        {/* React State Stateful Mobile Navigation Menu */}
        <MobileMenu 
          session={session} 
          dashboardUrl={getDashboardUrl(session?.role || "STUDENT")} 
          logoutAction={logout} 
        />
      </header>
    </>
  );
}
