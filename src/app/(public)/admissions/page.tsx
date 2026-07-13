import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "Admissions | Lagankhel IT Academy",
  description: "Apply to Lagankhel IT Academy. Explore our admission requirements, scholarship opportunities, and how to join Nepal's leading IT education institution.",
};

export default function AdmissionsPage() {
  const steps = [
    { step: "01", title: "Choose Your Program", desc: "Browse our catalog of IT programs and select the one that best aligns with your career goals." },
    { step: "02", title: "Submit Application", desc: "Complete the online application form and upload your required documents securely." },
    { step: "03", title: "Entrance Assessment", desc: "Appear for a short aptitude test designed to help us understand your learning style." },
    { step: "04", title: "Receive Offer Letter", desc: "Successful applicants receive a formal offer letter within 5–7 business days." },
    { step: "05", title: "Confirm Enrollment", desc: "Accept your offer, pay the enrollment fee, and secure your seat in the program." },
    { step: "06", title: "Begin Your Journey", desc: "Attend orientation, meet your cohort, and start your transformative IT career journey." },
  ];

  const requirements = [
    { icon: "📋", label: "Completed Application Form" },
    { icon: "🎓", label: "SEE or +2 Certificates" },
    { icon: "🪪", label: "Copy of Citizenship / Passport" },
    { icon: "📸", label: "Passport-size Photographs (2)" },
    { icon: "✉️", label: "Recommendation Letter (optional)" },
    { icon: "💰", label: "Registration Fee: NPR 500" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--college-bg-cream)" }}>
      <Breadcrumb
        title="Admissions"
        subtitle="Take your first step toward a world-class IT education. Applications are open for the 2025 intake."
        image="/admissions_hero.png"
        crumbs={[{ label: "Admissions", href: "/admissions" }]}
      />

      {/* How to Apply Steps */}
      <section id="apply" style={{ backgroundColor: "white", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Simple Process</span>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--college-primary)", margin: "0.75rem 0 0.5rem 0" }}>How to Apply</h2>
            <p style={{ color: "#777", fontSize: "1.1rem" }}>Follow these 6 easy steps to begin your journey at Lagankhel IT Academy.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {steps.map((s, i) => (
              <div key={i} className="hover-step-card" style={{ padding: "2rem", borderRadius: "12px", backgroundColor: "var(--college-bg-cream)", position: "relative", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ position: "absolute", top: "1rem", right: "1.5rem", fontFamily: "Playfair Display, serif", fontSize: "4rem", fontWeight: 800, color: "rgba(27,94,32,0.06)", lineHeight: 1 }}>{s.step}</div>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "var(--college-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", marginBottom: "1.25rem" }}>{s.step}</div>
                <h3 style={{ margin: "0 0 0.75rem 0", color: "var(--college-primary)", fontSize: "1.15rem", fontWeight: 700 }}>{s.title}</h3>
                <p style={{ color: "#666", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements + CTA */}
      <section id="requirements" style={{ backgroundColor: "var(--college-primary)", padding: "6rem 5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0" }}>Required Documents</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "2rem", fontSize: "1rem" }}>Please have the following ready before starting your application.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {requirements.map((r, i) => (
                <div key={i} className="hover-requirement" style={{ display: "flex", alignItems: "center", gap: "1rem", backgroundColor: "rgba(255,255,255,0.08)", padding: "1rem 1.25rem", borderRadius: "8px", color: "white" }}>
                  <span style={{ fontSize: "1.4rem" }}>{r.icon}</span>
                  <span style={{ fontWeight: 500 }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "3rem", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📨</div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "var(--college-primary)", margin: "0 0 1rem 0" }}>Ready to Apply?</h3>
            <p style={{ color: "#666", lineHeight: 1.7, marginBottom: "2rem" }}>
              Applications for our 2025 intake are now open. Limited seats available — apply early to secure your spot!
            </p>
            <Link href="/register" className="hover-btn-primary" style={{ display: "block", padding: "1rem 2rem", backgroundColor: "var(--college-primary)", color: "white", textDecoration: "none", fontWeight: "bold", borderRadius: "8px", fontSize: "1.1rem", marginBottom: "1rem" }}>
              Start Application
            </Link>
            <Link href="/about" className="hover-btn-outline" style={{ padding: "0.9rem 2rem", border: "2px solid var(--college-primary)", color: "var(--college-primary)", textDecoration: "none", fontWeight: "bold", borderRadius: "8px" }}>
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Scholarships Banner */}
      <section id="scholarships" style={{ backgroundColor: "var(--college-bg-cream)", padding: "5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "var(--college-primary)", margin: "0 0 1rem 0" }}>🏆 Scholarship Opportunities</h2>
          <p style={{ fontSize: "1.1rem", color: "#666", lineHeight: 1.8, marginBottom: "2rem" }}>
            We believe financial constraints should never stand between talent and education. Up to <strong>40% tuition waivers</strong> are available for meritorious and economically disadvantaged students.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              { title: "Merit Scholarship", value: "Up to 40%", desc: "Based on entrance exam score" },
              { title: "Need-Based Grant", value: "Up to 30%", desc: "For economically disadvantaged students" },
              { title: "Women in Tech Award", value: "Up to 25%", desc: "Encouraging female participation in IT" },
            ].map((s, i) => (
              <div key={i} className="hover-scholarship" style={{ backgroundColor: "white", borderRadius: "10px", padding: "2rem", borderTop: "4px solid var(--college-accent)", boxShadow: "0 4px 15px rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", fontWeight: 800, color: "var(--college-accent)", marginBottom: "0.5rem" }}>{s.value}</div>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--college-primary)" }}>{s.title}</h4>
                <p style={{ color: "#888", margin: 0, fontSize: "0.9rem" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
