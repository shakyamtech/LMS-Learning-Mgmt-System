import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "About Us | Lagankhel IT Academy",
  description: "Learn about Lagankhel IT Academy — our mission, history, values, and the dedicated team behind Nepal's premier IT education institution.",
};

export default function AboutPage() {
  const stats = [
    { icon: "🎓", value: "2,500+", label: "Graduates" },
    { icon: "👨‍🏫", value: "45+", label: "Expert Faculty" },
    { icon: "📚", value: "30+", label: "Courses Offered" },
    { icon: "🌍", value: "15+", label: "Industry Partners" },
  ];

  const team = [
    { name: "Dr. Ramesh Shrestha", role: "Principal & Founder", avatar: "/avatar1.png" },
    { name: "Priya Maharjan", role: "Head of Academics", avatar: "/avatar2.png" },
    { name: "Sanjay Thapa", role: "IT Department Head", avatar: "/avatar3.png" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--college-bg-cream)" }}>
      <Breadcrumb
        title="About Us"
        subtitle="Empowering Nepal's next generation of IT professionals since 2005."
        image="/about_hero.png"
        crumbs={[{ label: "About Us", href: "/about" }]}
      />

      {/* Mission & Vision */}
      <section id="about" style={{ backgroundColor: "white", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Story</span>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--college-primary)", margin: "0.75rem 0 1.5rem 0" }}>
              Shaping the Future of IT Education in Nepal
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#555", marginBottom: "1.5rem" }}>
              Founded in 2005, Lagankhel IT Academy began with a simple vision: to provide world-class technology education accessible to every Nepali student regardless of economic background.
            </p>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#555", marginBottom: "2rem" }}>
              Today, we are a premier institution with over 2,500 graduates working across Nepal, India, the US, and beyond — a testament to the quality of education and mentorship we provide.
            </p>
            <Link href="/register" className="hover-btn-primary" style={{ padding: "0.9rem 2rem", backgroundColor: "var(--college-primary)", color: "white", textDecoration: "none", fontWeight: "bold", borderRadius: "4px" }}>
              Join Our Community →
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <img src="/hero2.png" alt="Students at Lagankhel IT Academy" className="hover-zoom-img" style={{ width: "100%", borderRadius: "12px", objectFit: "cover", height: "420px", boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }} />
            <div style={{ position: "absolute", bottom: "-20px", left: "-20px", backgroundColor: "var(--college-accent)", color: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 8px 20px rgba(212,175,55,0.3)" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "Playfair Display, serif" }}>19+</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: "var(--college-primary)", padding: "5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
          {stats.map((s, i) => (
            <div key={i} className="hover-card-dark" style={{ textAlign: "center", color: "white", padding: "2rem", borderRadius: "10px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", fontWeight: 800, color: "var(--college-accent)" }}>{s.value}</div>
              <div style={{ fontSize: "1rem", opacity: 0.85, marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section id="values" style={{ backgroundColor: "var(--college-bg-cream)", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--college-primary)", margin: "0" }}>Our Core Values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              { icon: "🎯", title: "Mission", desc: "To provide affordable, world-class IT education that transforms lives and drives Nepal's digital economy forward." },
              { icon: "🔭", title: "Vision", desc: "To become South Asia's most respected IT academy — producing graduates who lead innovation across the globe." },
              { icon: "💡", title: "Innovation", desc: "We continuously update our curriculum to reflect the latest industry trends, tools, and best practices in technology." },
            ].map((v, i) => (
              <div key={i} className="hover-value-card" style={{ backgroundColor: "white", borderRadius: "12px", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderTop: "4px solid var(--college-accent)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{v.icon}</div>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: "0 0 1rem 0" }}>{v.title}</h3>
                <p style={{ color: "#666", lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section id="team" style={{ backgroundColor: "white", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>Meet Our Leadership</h2>
            <p style={{ color: "#777", fontSize: "1.1rem" }}>The dedicated team behind Lagankhel IT Academy's success.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {team.map((member, i) => (
              <div key={i} className="hover-team-card" style={{ textAlign: "center", padding: "2rem", borderRadius: "12px", backgroundColor: "var(--college-bg-cream)" }}>
                <img src={member.avatar} alt={member.name} style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--college-accent)", marginBottom: "1rem", boxShadow: "0 4px 14px rgba(0,0,0,0.12)", transition: "border-color 0.3s" }} />
                <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--college-primary)", fontSize: "1.15rem", fontWeight: 700 }}>{member.name}</h4>
                <span style={{ fontSize: "0.9rem", color: "#888" }}>{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
