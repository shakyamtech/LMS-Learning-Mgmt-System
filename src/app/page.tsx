import { decryptSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  let session = null;
  if (sessionToken) {
    try {
      session = await decryptSession(sessionToken);
    } catch (e) {
      console.error("Stale session key ignored:", e);
    }
  }

  // Get dynamic path for user's dashboard based on role
  const getDashboardUrl = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "TEACHER":
        return "/dashboard/teacher";
      case "STUDENT":
      default:
        return "/dashboard/student";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--background)",
      color: "var(--text-main)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "var(--font-geist-sans), Arial, sans-serif"
    }}>
      {/* Premium Ambient Background Glows */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "20%",
        width: "50vw",
        height: "50vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(79, 70, 229, 0) 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        right: "10%",
        width: "45vw",
        height: "45vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Navigation Header */}
      <header className="glass-panel" style={{
        position: "sticky",
        top: "1.5rem",
        zIndex: 10,
        margin: "1.5rem auto 0 auto",
        width: "90%",
        maxWidth: "1200px",
        padding: "1rem 2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-glass)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.75rem" }}>🌌</span>
          <span className="text-gradient" style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            letterSpacing: "-0.03em"
          }}>
            AETHELGARD
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          <a href="#features" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-muted)", transition: "color 0.2s" }} className="nav-link">Features</a>
          <a href="#about" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-muted)", transition: "color 0.2s" }} className="nav-link">Platform</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-muted)", transition: "color 0.2s" }} className="nav-link">Docs</a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ textAlign: "right" }}>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>Logged in as</span>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", marginTop: "-0.1rem" }}>
                  {session.email.split("@")[0]} ({session.role})
                </div>
              </div>
              <Link href={getDashboardUrl(session.role)} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
                Console ⚡
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="container" style={{ flex: 1, zIndex: 1, paddingTop: "6.5rem", paddingBottom: "6rem", position: "relative" }}>
        
        {/* Hero Banner text */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 5rem auto" }}>
          <span className="animate-fade-in" style={{
            fontSize: "0.75rem",
            backgroundColor: "rgba(79, 70, 229, 0.08)",
            color: "var(--primary)",
            fontWeight: 700,
            padding: "0.35rem 1rem",
            borderRadius: "var(--radius-full)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            border: "1px solid rgba(79, 70, 229, 0.15)"
          }}>
            🌌 The Future of Learning Environments
          </span>

          <h1 className="text-h1 text-gradient animate-fade-in" style={{
            fontSize: "4rem",
            margin: "1.5rem 0 1.25rem 0",
            lineHeight: 1.15,
            fontWeight: 800
          }}>
            Elevating Education Beyond Gravity
          </h1>
          
          <p className="text-muted animate-fade-in" style={{
            fontSize: "1.2rem",
            lineHeight: 1.6,
            maxWidth: "650px",
            margin: "0 auto 2.5rem auto"
          }}>
            A database-synchronized Learning Management System engineered for premium aesthetics, type safety, and real-time instructor-student workflows.
          </p>

          <div className="flex-center animate-fade-in" style={{ gap: "1.5rem" }}>
            {session ? (
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <Link href={getDashboardUrl(session.role)} className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}>
                  Enter Your Dashboard
                </Link>
                <form action={logout}>
                  <button className="btn btn-secondary" type="submit" style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}>
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}>
                  Get Started Free
                </Link>
                <Link href="/login" className="btn btn-secondary" style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}>
                  View Live Platform
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section id="features" style={{ marginBottom: "6rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="text-h2" style={{ margin: "0 0 0.5rem 0" }}>Engineered Core Architectural Modules</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: "1rem" }}>A highly optimized application designed with premium glassmorphic UI design tokens.</p>
          </div>

          <div className="grid-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            
            <div className="card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
              <div style={{ fontSize: "2.5rem", userSelect: "none" }}>🎓</div>
              <div>
                <h3 className="text-h3" style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 600 }}>
                  Isolated Role-Based Portals
                </h3>
                <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Distinct, custom workspaces for Students (progress bars, courses), Teachers (roster sliders, taught subjects), and Root Administrators (classroom provisioning, teacher assignments).
                </p>
              </div>
            </div>

            <div className="card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
              <div style={{ fontSize: "2.5rem", userSelect: "none" }}>⚡</div>
              <div>
                <h3 className="text-h3" style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 600 }}>
                  One-Click Interactive Enrollments
                </h3>
                <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Stateful Student Browser cards leveraging React 19 transition triggers. Enrolling instantly migrates items across list states in parallel under the hood without a single browser refresh.
                </p>
              </div>
            </div>

            <div className="card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
              <div style={{ fontSize: "2.5rem", userSelect: "none" }}>📊</div>
              <div>
                <h3 className="text-h3" style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 600 }}>
                  Instructors Roster Console
                </h3>
                <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Teachers gain access to classroom control panels. Interactive sliders let instructors dynamically alter, grade, and apply syllabus progression metrics directly down to the database pool.
                </p>
              </div>
            </div>

            <div className="card" style={{ display: "flex", gap: "1.25rem", padding: "2rem" }}>
              <div style={{ fontSize: "2.5rem", userSelect: "none" }}>🛡️</div>
              <div>
                <h3 className="text-h3" style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 600 }}>
                  Edge Route Security & JWT
                </h3>
                <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                  Protected by Next.js Edge Middleware. HTTP-only secure cookie sessions with signed jose JWT signatures prevent unauthorized dashboard browsing and enforce strict role checking.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Tech Stack Ribbon */}
        <section id="about" style={{
          textAlign: "center",
          padding: "3rem 2rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <h3 className="text-h3" style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
            Powered By Next-Gen Technologies
          </h3>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "3rem",
            flexWrap: "wrap",
            opacity: 0.8,
            fontSize: "1.1rem",
            fontWeight: 700
          }}>
            <span>⚡ Next.js 16</span>
            <span>⚛️ React 19</span>
            <span>🔷 TypeScript 5</span>
            <span>💎 Prisma 7</span>
            <span>☁️ Supabase</span>
            <span>🟢 Postgres</span>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="glass-panel" style={{
        marginTop: "auto",
        width: "100%",
        padding: "2rem 4rem",
        borderTop: "1px solid var(--border)",
        borderRadius: "0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1
      }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Aethegard LMS Platform. Engineered by Antigravity.
        </span>
        <div style={{ display: "flex", gap: "2rem", fontSize: "0.85rem" }}>
          <a href="https://nextjs.org" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)" }}>Documentation</a>
          <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)" }}>Supabase DB</a>
          <a href="https://prisma.io" target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)" }}>Prisma Client</a>
        </div>
      </footer>

    </div>
  );
}
