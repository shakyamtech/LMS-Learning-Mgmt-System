import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      style={{
        backgroundColor: "var(--college-primary-dark)",
        color: "white",
        padding: "4rem 2rem 2rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr",
          gap: "3rem",
          marginBottom: "3rem",
        }}
      >
        {/* Col 1 — Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <img
              src="/logo.png"
              alt="Lagankhel IT Academy Logo"
              style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--college-accent)" }}
            />
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", fontWeight: 700 }}>
              Lagankhel IT Academy
            </span>
          </div>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.7, opacity: 0.8 }}>
            Dedicated to excellence in IT education, research, and community. Shaping the leaders of tomorrow.
          </p>
        </div>

        {/* Col 2 — Quick Links */}
        <div>
          <h4 style={{ margin: "0 0 1.25rem 0", color: "var(--college-accent)", fontSize: "1rem", fontWeight: 700 }}>Quick Links</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.9rem" }}>
            {[
              { label: "About Us",    href: "/about" },
              { label: "Admissions",  href: "/admissions" },
              { label: "Academics",   href: "/academics" },
              { label: "Campus Life", href: "/campus-life" },
              { label: "Login",       href: "/login" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", transition: "color 0.2s" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3 — Contact */}
        <div>
          <h4 style={{ margin: "0 0 1.25rem 0", color: "var(--college-accent)", fontSize: "1rem", fontWeight: 700 }}>Contact Us</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", opacity: 0.8 }}>
            <span>📞 01-5430967</span>
            <span>📍 Lagankhel, Lalitpur, Nepal</span>
            <span>✉️ info@lagankhelit.edu.np</span>
            <span>🕐 Sun–Fri: 9am–5pm</span>
          </div>
        </div>

        {/* Col 4 — Newsletter */}
        <div>
          <h4 style={{ margin: "0 0 1.25rem 0", color: "var(--college-accent)", fontSize: "1rem", fontWeight: 700 }}>Stay Connected</h4>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.7, opacity: 0.8, marginBottom: "1rem" }}>
            Subscribe to our newsletter for the latest updates and events.
          </p>
          <div style={{ display: "flex" }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{ flex: 1, padding: "0.75rem 1rem", border: "none", borderRadius: "4px 0 0 4px", fontSize: "0.9rem", outline: "none" }}
            />
            <button
              type="button"
              style={{
                padding: "0.75rem 1.25rem",
                backgroundColor: "var(--college-accent)",
                color: "white",
                border: "none",
                borderRadius: "0 4px 4px 0",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem",
          opacity: 0.6,
        }}
      >
        <span>© {new Date().getFullYear()} Lagankhel IT Academy. All rights reserved.</span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>Terms & Conditions</Link>
          <a
            href="#"
            style={{
              padding: "0.35rem 0.9rem",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "20px",
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ↑ Top
          </a>
        </div>
      </div>
    </footer>
  );
}
