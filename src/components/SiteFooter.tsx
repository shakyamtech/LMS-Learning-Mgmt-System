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
          <Link href="/" className="footer-brand-link">
            <img
              src="/logo.png"
              alt="Lagankhel IT Academy Logo"
              style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--college-accent)" }}
            />
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", fontWeight: 700 }}>
              Lagankhel IT Academy
            </span>
          </Link>
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
              <Link key={l.href} href={l.href} className="footer-link">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3 — Contact */}
        <div>
          <h4 style={{ margin: "0 0 1.25rem 0", color: "var(--college-accent)", fontSize: "1rem", fontWeight: 700 }}>Contact Us</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <span className="footer-contact-item" style={{ opacity: 0.8 }}>📞 01-5430967</span>
            <span className="footer-contact-item" style={{ opacity: 0.8 }}>📍 Lagankhel, Lalitpur, Nepal</span>
            <span className="footer-contact-item" style={{ opacity: 0.8 }}>✉️ info@lagankhelit.edu.np</span>
            <span className="footer-contact-item" style={{ opacity: 0.8 }}>🕐 Sun–Fri: 9am–5pm</span>
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
              style={{ flex: 1, padding: "0.75rem 1rem", border: "none", borderRadius: "4px 0 0 4px", fontSize: "0.9rem", outline: "none", color: "#333" }}
            />
            <button
              type="button"
              className="footer-newsletter-btn"
              style={{
                padding: "0.75rem 1.25rem",
                backgroundColor: "var(--college-accent)",
                color: "var(--college-primary-dark)",
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
        }}
      >
        <span style={{ opacity: 0.6 }}>© {new Date().getFullYear()} Lagankhel IT Academy. All rights reserved.</span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href="#" className="footer-bottom-link">Privacy Policy</Link>
          <Link href="#" className="footer-bottom-link">Terms & Conditions</Link>
          <a
            href="#"
            className="footer-top-btn"
          >
            ↑ Top
          </a>
        </div>
      </div>
    </footer>
  );
}
