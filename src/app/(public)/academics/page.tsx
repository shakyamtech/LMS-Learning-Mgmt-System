import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "Academics | Lagankhel IT Academy",
  description: "Explore Lagankhel IT Academy's academic programs — from full-stack development to cybersecurity, data science, and cloud computing.",
};

const programs = [
  { icon: "💻", code: "CS-101", title: "Full-Stack Web Development", duration: "12 Months", level: "Beginner → Advanced", desc: "Master HTML, CSS, JavaScript, React, Node.js, and databases. Build real-world web applications from scratch.", color: "#4f46e5" },
  { icon: "🔐", code: "CY-201", title: "Cybersecurity & Ethical Hacking", duration: "9 Months", level: "Intermediate", desc: "Learn penetration testing, network security, vulnerability assessment, and security operations center fundamentals.", color: "#dc2626" },
  { icon: "📊", code: "DS-301", title: "Data Science & AI", duration: "10 Months", level: "Intermediate → Advanced", desc: "Python, machine learning, neural networks, data visualization, and deploying AI models in production environments.", color: "#0891b2" },
  { icon: "☁️", code: "CC-401", title: "Cloud Computing (AWS/Azure)", duration: "6 Months", level: "Beginner → Intermediate", desc: "AWS core services, Azure fundamentals, DevOps, containerization with Docker and Kubernetes, and CI/CD pipelines.", color: "#7c3aed" },
  { icon: "📱", code: "MD-501", title: "Mobile App Development", duration: "8 Months", level: "Beginner → Advanced", desc: "Build native iOS and Android apps using Flutter and React Native. UI/UX design principles included.", color: "#059669" },
  { icon: "🗄️", code: "DB-601", title: "Database Administration", duration: "5 Months", level: "Beginner → Intermediate", desc: "PostgreSQL, MySQL, MongoDB, query optimization, database design, backups, and high availability configurations.", color: "#d97706" },
];

export default function AcademicsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--college-bg-cream)" }}>
      <Breadcrumb
        title="Academics"
        subtitle="Industry-aligned IT programs designed by experts and built for real-world success."
        image="/hero_slide_2.png"
        crumbs={[{ label: "Academics", href: "/academics" }]}
      />

      {/* Programs Grid */}
      <section style={{ backgroundColor: "white", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Programs</span>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--college-primary)", margin: "0.75rem 0 0.5rem 0" }}>Courses & Programs</h2>
            <p style={{ color: "#777", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>Each program is developed with direct input from industry partners and updated every semester.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.75rem" }}>
            {programs.map((p, i) => (
              <div key={i} className="hover-program-card" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.07)", backgroundColor: "var(--college-bg-cream)" }}>
                <div style={{ height: "6px", backgroundColor: p.color }} />
                <div style={{ padding: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "2.5rem" }}>{p.icon}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: p.color, backgroundColor: `${p.color}15`, padding: "0.25rem 0.75rem", borderRadius: "20px" }}>{p.code}</span>
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--college-primary)", fontSize: "1.15rem", fontWeight: 700 }}>{p.title}</h3>
                  <p style={{ color: "#666", lineHeight: 1.6, fontSize: "0.92rem", margin: "0 0 1.5rem 0" }}>{p.desc}</p>
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <span style={{ fontSize: "0.82rem", color: "#666", backgroundColor: "white", padding: "0.3rem 0.75rem", borderRadius: "20px", border: "1px solid #eee" }}>⏱ {p.duration}</span>
                    <span style={{ fontSize: "0.82rem", color: "#666", backgroundColor: "white", padding: "0.3rem 0.75rem", borderRadius: "20px", border: "1px solid #eee" }}>📶 {p.level}</span>
                  </div>
                  <Link href="/register" className="hover-enroll-btn" style={{ padding: "0.75rem", backgroundColor: "var(--college-primary)", color: "white", textDecoration: "none", fontWeight: "bold", borderRadius: "6px", fontSize: "0.9rem" }}>
                    Enroll Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section style={{ backgroundColor: "var(--college-primary)", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0" }}>How We Teach</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem" }}>Our pedagogy is hands-on, project-driven, and industry-aligned.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {[
              { icon: "🏗️", title: "Project-Based", desc: "Build real products every semester" },
              { icon: "🤝", title: "Mentorship", desc: "1-on-1 guidance from industry pros" },
              { icon: "🧪", title: "Labs & Practice", desc: "Dedicated lab sessions every week" },
              { icon: "🌐", title: "Live Internships", desc: "Guaranteed internship placements" },
            ].map((m, i) => (
              <div key={i} className="hover-method-card" style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "2rem", textAlign: "center", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{m.icon}</div>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", fontWeight: 700 }}>{m.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.9rem" }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Highlight */}
      <section style={{ backgroundColor: "var(--college-bg-cream)", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <img src="/hero1.png" alt="Faculty" className="hover-zoom-img" style={{ width: "100%", borderRadius: "12px", objectFit: "cover", height: "380px", boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }} />
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Expert Faculty</span>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "var(--college-primary)", margin: "0.75rem 0 1.25rem 0" }}>Taught by Practitioners, Not Just Professors</h2>
            <p style={{ color: "#666", lineHeight: 1.8, marginBottom: "1.5rem" }}>All our instructors have a minimum of 5 years of real-world industry experience in addition to their teaching credentials. You learn what actually works in production.</p>
            <Link href="/admissions" className="hover-btn-primary" style={{ padding: "0.9rem 2rem", backgroundColor: "var(--college-primary)", color: "white", textDecoration: "none", fontWeight: "bold", borderRadius: "4px" }}>
              Apply Now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
