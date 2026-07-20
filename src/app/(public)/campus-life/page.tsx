import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "Campus Life | Lagankhel IT Academy",
  description: "Experience the vibrant campus life at Lagankhel IT Academy — events, clubs, sports, facilities, and a thriving student community.",
};

const events = [
  { tag: "TECH CONFERENCE", date: "August 10, 2025", title: "Annual IT Expo & Hackathon", desc: "A 48-hour hackathon where students build solutions to real-world problems. Prize pool of NPR 1,00,000.", icon: "💡" },
  { tag: "CAMPUS LIFE", date: "September 3, 2025", title: "Freshers' Orientation Day", desc: "Welcome our newest batch! An exciting day of introductions, campus tours, and getting-to-know-you activities.", icon: "🎉" },
  { tag: "CAREER", date: "October 20, 2025", title: "Industry Connect Job Fair", desc: "Meet recruiters from 30+ top tech companies and secure internships or full-time positions.", icon: "💼" },
  { tag: "CULTURAL", date: "November 15, 2025", title: "Techno-Cultural Festival", desc: "A blend of technology showcases and cultural performances celebrating Nepal's diversity and innovation.", icon: "🎭" },
  { tag: "SPORTS", date: "December 5, 2025", title: "Inter-College Sports Week", desc: "Compete in cricket, futsal, badminton, and esports against teams from colleges across Lalitpur.", icon: "🏆" },
  { tag: "ACADEMICS", date: "January 12, 2026", title: "Guest Lecture Series", desc: "Monthly talks by leaders from Google, Microsoft, and top Nepali startups sharing career insights.", icon: "🎤" },
];

const clubs = [
  { icon: "🤖", name: "AI & Robotics Club", members: "120+" },
  { icon: "🌐", name: "Web Dev Society", members: "200+" },
  { icon: "🎮", name: "Gaming & Esports Club", members: "150+" },
  { icon: "📸", name: "Photography Club", members: "80+" },
  { icon: "🎵", name: "Music & Arts Society", members: "60+" },
  { icon: "♟️", name: "Chess & Strategy Club", members: "45+" },
];

export default function CampusLifePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--college-bg-cream)" }}>
      <Breadcrumb
        title="Campus Life"
        subtitle="Life at Lagankhel IT Academy extends beyond classrooms — it's a community that celebrates learning, culture, and achievement."
        image="/campus.png"
        crumbs={[{ label: "Campus Life", href: "/campus-life" }]}
      />

      {/* Upcoming Events */}
      <section id="events" style={{ backgroundColor: "white", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Stay Connected</span>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--college-primary)", margin: "0.75rem 0 0.5rem 0" }}>Upcoming Events</h2>
            <p style={{ color: "#777", fontSize: "1.1rem" }}>Don&apos;t miss what&apos;s happening on campus this semester.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {events.map((e, i) => (
              <div key={i} className="hover-card" style={{ backgroundColor: "var(--college-bg-cream)", borderRadius: "12px", padding: "2rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{e.icon}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--college-accent)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{e.tag}</span>
                  <span style={{ fontSize: "0.82rem", color: "#999" }}>{e.date}</span>
                </div>
                <h3 style={{ margin: "0 0 0.75rem 0", color: "var(--college-primary)", fontSize: "1.1rem", fontWeight: 700 }}>{e.title}</h3>
                <p style={{ color: "#666", lineHeight: 1.65, margin: "0 0 1.5rem 0", fontSize: "0.92rem" }}>{e.desc}</p>
                <Link href="/register" className="hover-text-link" style={{ color: "var(--college-primary)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
                  Register Interest →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs & Societies */}
      <section id="clubs" style={{ backgroundColor: "var(--college-primary)", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0" }}>Clubs & Societies</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem" }}>Join a community that shares your passion and grow beyond your coursework.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {clubs.map((c, i) => (
              <div key={i} className="hover-club" style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2rem", display: "flex", alignItems: "center", gap: "1.25rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <h4 style={{ margin: "0 0 0.25rem 0", color: "white", fontWeight: 700, fontSize: "1rem" }}>{c.name}</h4>
                  <span style={{ color: "var(--college-accent)", fontWeight: 600, fontSize: "0.9rem" }}>{c.members} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" style={{ backgroundColor: "var(--college-bg-cream)", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--college-primary)", margin: "0" }}>World-Class Facilities</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { icon: "🖥️", title: "Modern Computer Labs", desc: "150+ high-end workstations with latest software suites, available 6am–10pm daily." },
                { icon: "📚", title: "Digital Library", desc: "Access to 50,000+ e-books, research journals, and industry case studies online and offline." },
                { icon: "☕", title: "Student Lounge & Café", desc: "A vibrant space to relax, collaborate, and recharge between classes." },
                { icon: "🏋️", title: "Sports & Fitness Centre", desc: "Indoor gym, badminton courts, carrom boards, and a dedicated meditation room." },
              ].map((f, i) => (
                <div key={i} className="hover-facility" style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", backgroundColor: "white", borderRadius: "10px", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <span style={{ fontSize: "2rem", flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <h4 style={{ margin: "0 0 0.35rem 0", color: "var(--college-primary)", fontWeight: 700 }}>{f.title}</h4>
                    <p style={{ color: "#777", margin: 0, fontSize: "0.92rem", lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <img src="/graduation.png" alt="Campus facilities" className="hover-zoom-img" style={{ width: "100%", borderRadius: "12px", objectFit: "cover", height: "480px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }} />
              <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", backgroundColor: "var(--college-accent)", color: "white", padding: "1rem 1.5rem", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "Playfair Display, serif" }}>500+</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>Active Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: "var(--college-primary-dark)", padding: "5rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "white", margin: "0 0 1rem 0" }}>Be Part of Our Community</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem auto" }}>
          Life at Lagankhel IT Academy is richer than any textbook. Come experience it for yourself.
        </p>
        <Link href="/register" className="hover-btn-gold" style={{ padding: "1rem 2.5rem", backgroundColor: "var(--college-accent)", color: "white", textDecoration: "none", fontWeight: "bold", borderRadius: "6px", fontSize: "1.1rem" }}>
          Apply Today
        </Link>
      </section>
    </div>
  );
}
