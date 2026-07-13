import { decryptSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import HeroSlider from "@/components/HeroSlider";
import TestimonialSlider from "@/components/TestimonialSlider";

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
    <div id="top" style={{
      minHeight: "100vh",
      backgroundColor: "var(--college-bg-cream)",
      color: "var(--college-text)",
      fontFamily: "var(--font-geist-sans), Arial, sans-serif",
      overflowX: "hidden"
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .flex-row { display: flex; flex-direction: row; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .grid-4 { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr; gap: 4rem; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
        .section-pad { padding: 6rem 4rem; }
        .hide-mobile { display: flex; }
        .hero-img-box { min-height: 500px; }
        
        @media (max-width: 1024px) {
          .flex-row { flex-direction: column; }
          .grid-3 { grid-template-columns: 1fr 1fr; }
          .grid-4 { grid-template-columns: 1fr 1fr; }
          .section-pad { padding: 4rem 2rem; }
          .hero-img-box { min-height: 400px; }
        }
        
        @media (max-width: 768px) {
          .grid-3 { grid-template-columns: 1fr; }
          .grid-4 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          .section-pad { padding: 3rem 1.5rem; }
          .hide-mobile { display: none !important; }
          .mobile-col { flex-direction: column !important; }
          .mobile-center { justify-content: center !important; text-align: center !important; }
          .mobile-img-box { min-height: 250px !important; }
          h1 { font-size: 2.8rem !important; }
          h2 { font-size: 2.2rem !important; }
          .top-bar-mobile { flex-direction: column !important; text-align: center; gap: 0.5rem; }
          .contact-form-mobile { flex-direction: column !important; }
        }
        
        @media (max-width: 380px) { /* Galaxy Fold */
          .section-pad { padding: 2rem 1rem; }
          h1 { font-size: 2.2rem !important; }
          h2 { font-size: 1.8rem !important; }
          .mobile-img-box { min-height: 200px !important; }
        }
      `}} />

      {/* 1. Top Utility Bar */}
      <div className="top-bar-mobile" style={{ backgroundColor: "var(--college-primary-dark)", color: "white", padding: "0.5rem 2rem", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
        <span>📞 01-5430967</span>
        <span>📍 Lagankhel, Lalitpur, Nepal</span>
      </div>

      {/* 2. Navigation Header */}
      <header style={{ backgroundColor: "var(--college-primary)", color: "white", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "40px", height: "40px", backgroundColor: "var(--college-accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", color: "white" }}>
            C
          </div>
          <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", fontWeight: 700 }}>Carolina College</span>
        </div>

        <nav className="hide-mobile" style={{ gap: "2rem", fontWeight: 600, fontSize: "0.95rem" }}>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>About us</Link>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>Admissions</Link>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>Academics</Link>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>Campus Life</Link>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <Link href={getDashboardUrl(session.role)} style={{ padding: "0.6rem 1.5rem", border: "2px solid var(--college-accent)", borderRadius: "4px", color: "var(--college-accent)", textDecoration: "none", fontWeight: "bold" }}>
                Console ⚡
              </Link>
              <form action={logout}>
                <button type="submit" className="hide-mobile" style={{ padding: "0.6rem 1.5rem", backgroundColor: "var(--college-accent)", border: "none", borderRadius: "4px", color: "white", fontWeight: "bold", cursor: "pointer" }}>Logout</button>
              </form>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href="/login" className="hide-mobile" style={{ color: "white", textDecoration: "none", alignSelf: "center", fontWeight: "bold" }}>Login</Link>
              <Link href="/register" style={{ padding: "0.6rem 1.5rem", border: "2px solid var(--college-accent)", borderRadius: "4px", color: "var(--college-accent)", textDecoration: "none", fontWeight: "bold" }}>
                Contact Us
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 3. Hero Section Slider */}
      <HeroSlider />

      {/* 4. About Our College Section */}
      <section className="flex-row section-pad" style={{ backgroundColor: "white", gap: "4rem" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", margin: "0 0 2rem 0", color: "var(--college-primary)" }}>
            About Our College
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "#555", marginBottom: "2rem" }}>
            Carolina College of Arts and Sciences offers a transformative educational experience. We pride ourselves on offering flexible schedules, extensive scholarship opportunities, and career assistance to ensure you succeed.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0" }}>
            {["Convenient schedules", "Generous scholarships", "Accelerated timetables", "Dedicated career assistance"].map((item, i) => (
              <li key={i} style={{ paddingLeft: "1.5rem", position: "relative", marginBottom: "0.75rem", fontSize: "1.1rem", color: "#333" }}>
                <span style={{ position: "absolute", left: 0, color: "var(--college-primary)", fontWeight: "bold" }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <Link href="#" style={{ color: "var(--college-accent)", textDecoration: "none", fontWeight: "bold", fontSize: "1.1rem" }}>Explore our programs →</Link>

          <div className="grid-3" style={{ marginTop: "4rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", margin: "0 auto 1rem auto", borderRadius: "50%", backgroundColor: "var(--college-bg-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>👨‍🏫</div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--college-primary)", fontSize: "1rem" }}>Experienced Tutors</h4>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", margin: "0 auto 1rem auto", borderRadius: "50%", backgroundColor: "var(--college-bg-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🌍</div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--college-primary)", fontSize: "1rem" }}>Students from 40+ countries</h4>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", margin: "0 auto 1rem auto", borderRadius: "50%", backgroundColor: "var(--college-bg-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🦉</div>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--college-primary)", fontSize: "1rem" }}>Modern teaching methods</h4>
            </div>
          </div>
        </div>
        <div className="mobile-img-box" style={{ flex: 1, backgroundColor: "#EAE6DF", borderRadius: "8px", position: "relative", minHeight: "500px", overflow: "hidden" }}>
          <img src="/hero2.png" alt="Nepali Students Learning" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
        </div>
      </section>

      {/* 5. Why Choose Us Section */}
      <section className="flex-row" style={{ backgroundColor: "var(--college-bg-cream)" }}>
        <div className="mobile-img-box" style={{ flex: 1, minHeight: "600px", backgroundColor: "#EAE6DF", position: "relative", overflow: "hidden" }}>
          <img src="/hero1.png" alt="Nepali Student Portrait" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="section-pad" style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", margin: "0 0 3rem 0", color: "var(--college-primary)" }}>
            Why Choose Us
          </h2>
          <div className="grid-2">
            <div className="choose-card">
              <div className="icon-wrap">🎓</div>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--college-primary)", fontSize: "1.3rem" }}>Best Programs</h3>
              <p style={{ color: "#555", marginBottom: "1.5rem", lineHeight: 1.5 }}>Our curriculum is globally recognized and highly competitive.</p>
              <Link href="#" className="btn-text">Learn More →</Link>
            </div>
            <div className="choose-card">
              <div className="icon-wrap">🔬</div>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--college-primary)", fontSize: "1.3rem" }}>Laboratories</h3>
              <p style={{ color: "#555", marginBottom: "1.5rem", lineHeight: 1.5 }}>State-of-the-art facilities for hands-on scientific research.</p>
              <Link href="#" className="btn-text">Learn More →</Link>
            </div>
            <div className="choose-card">
              <div className="icon-wrap">🏀</div>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--college-primary)", fontSize: "1.3rem" }}>Variety of Sports</h3>
              <p style={{ color: "#555", marginBottom: "1.5rem", lineHeight: 1.5 }}>Engage in over 20+ collegiate level athletic programs.</p>
              <Link href="#" className="btn-text">Learn More →</Link>
            </div>
            <div className="choose-card">
              <div className="icon-wrap">🍎</div>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--college-primary)", fontSize: "1.3rem" }}>Great Canteens</h3>
              <p style={{ color: "#555", marginBottom: "1.5rem", lineHeight: 1.5 }}>Nutritious, globally-inspired meal plans available 24/7.</p>
              <Link href="#" className="btn-text">Learn More →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "Want to study here?" (CTA Box) */}
      <section className="section-pad" style={{ position: "relative", display: "flex", justifyContent: "center", backgroundColor: "#D4AF37", backgroundImage: "linear-gradient(to right, rgba(27, 94, 32, 0.9), rgba(27, 94, 32, 0.7))" }}>
        <div style={{ backgroundColor: "white", padding: "4rem 2rem", borderRadius: "8px", maxWidth: "700px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 1, width: "100%" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", margin: "0 0 1rem 0", color: "var(--college-primary)" }}>
            Want to study here?
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "2rem", lineHeight: 1.6 }}>
            We are currently accepting applications for the upcoming fall semester. Join thousands of students making a difference.
          </p>
          <div className="mobile-col" style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/register" className="btn-primary">Send a Request</Link>
            <Link href="#" className="btn-outline">Learn More</Link>
          </div>
        </div>
      </section>

      {/* 7. Latest Events */}
      <section className="section-pad" style={{ backgroundColor: "var(--college-primary-dark)", color: "white" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", margin: 0 }}>
            Latest Events
          </h2>
        </div>
        <div className="grid-3">
          {[
            { tag: "CONFERENCES", date: "July 24, 2024", title: "Annual Science Fair & Expo", desc: "Discover the latest research from our undergrads." },
            { tag: "CAMPUS LIFE", date: "August 12, 2024", title: "Freshman Orientation Week", desc: "Welcome to campus! Get to know your peers." },
            { tag: "ACADEMICS", date: "September 5, 2024", title: "Guest Lecture: Global Econ", desc: "A special lecture by Dr. Alan Smith on global markets." }
          ].map((event, i) => (
            <div key={i} className="event-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--college-accent)", letterSpacing: "0.05em" }}>{event.tag}</span>
                <span style={{ fontSize: "0.85rem", color: "#999" }}>{event.date}</span>
              </div>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--college-primary)", fontSize: "1.4rem" }}>{event.title}</h3>
              <p style={{ color: "#555", marginBottom: "2rem", lineHeight: 1.5, flex: 1 }}>{event.desc}</p>
              <Link href="#" className="btn-text">Read More →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Financial Aid and Scholarships */}
      <section className="flex-row" style={{ backgroundColor: "var(--college-bg-cream)" }}>
        <div className="section-pad" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", margin: "0 0 2rem 0", color: "var(--college-primary)" }}>
            Financial Aid and Scholarships
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "#555", maxWidth: "500px" }}>
            We believe that a world-class education should be accessible to everyone. Explore our extensive financial aid packages, grants, and merit-based scholarships designed to support your academic journey.
          </p>
        </div>
        <div className="mobile-img-box" style={{ flex: 1, minHeight: "500px", backgroundColor: "#EAE6DF", position: "relative", overflow: "hidden" }}>
          <img src="/campus.png" alt="Nepali Campus Grounds" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </section>

      {/* 9. Graduation */}
      <section className="flex-row" style={{ backgroundColor: "var(--college-primary)", color: "white" }}>
        <div className="mobile-img-box" style={{ flex: 1, minHeight: "500px", backgroundColor: "#154A1A", position: "relative", overflow: "hidden" }}>
          <img src="/graduation.png" alt="Nepali Graduates Celebrating" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="section-pad" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "3.5rem", margin: "0 0 1.5rem 0" }}>Graduation</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: "500px", opacity: 0.9 }}>
            Join us in celebrating the extraordinary achievements of the Class of 2024. Discover the stories of our alumni and their next steps into the professional world.
          </p>
          <div>
            <Link href="#" style={{ padding: "1rem 2rem", border: "2px solid white", color: "white", textDecoration: "none", fontWeight: "bold", borderRadius: "4px", display: "inline-block" }}>Read More →</Link>
          </div>
        </div>
      </section>

      {/* 10. Testimonials Slider */}
      <TestimonialSlider />

      {/* 11. Got any questions? (Contact Form) */}
      <section className="section-pad" style={{ backgroundColor: "white", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", margin: "0 0 1rem 0", color: "var(--college-primary)" }}>
          Got any questions?
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "3rem" }}>Leave your details and we will contact you as soon as possible.</p>

        <form style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="contact-form-mobile" style={{ display: "flex", gap: "1rem" }}>
            <input type="text" placeholder="Your Name" style={{ flex: 1, padding: "1rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem" }} />
            <input type="text" placeholder="Phone Number" style={{ flex: 1, padding: "1rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem" }} />
            <input type="email" placeholder="Email Address" style={{ flex: 1, padding: "1rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem" }} />
          </div>
          <div className="mobile-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", gap: "1rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#666", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" /> By clicking this button, you agree to our privacy policy.
            </label>
            <button type="button" style={{ padding: "1rem 3rem", backgroundColor: "var(--college-primary)", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", width: "100%" }}>Send</button>
          </div>
        </form>
      </section>

      {/* 12. Footer */}
      <footer style={{ backgroundColor: "var(--college-primary-dark)", color: "white", padding: "4rem 2rem 2rem 2rem" }}>
        <div className="grid-4" style={{ marginBottom: "4rem" }}>
          {/* Col 1 */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", color: "var(--college-primary)" }}>C</div>
              <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", fontWeight: 700 }}>Carolina College</span>
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6, opacity: 0.8 }}>
              Dedicated to excellence in education, research, and campus life. Shaping the leaders of tomorrow since 1892.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ margin: "0 0 1.5rem 0", color: "var(--college-accent)", fontSize: "1.1rem" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
              <Link href="#" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>About us</Link>
              <Link href="#" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Admissions</Link>
              <Link href="#" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Academics</Link>
              <Link href="#" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Campus Life</Link>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ margin: "0 0 1.5rem 0", color: "var(--college-accent)", fontSize: "1.1rem" }}>Contact Us</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", opacity: 0.8 }}>
              <span>📞 01-5430967</span>
              <span>📍 Lagankhel, Lalitpur, Nepal</span>
              <span>✉️ info@carolina.edu</span>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ margin: "0 0 1.5rem 0", color: "var(--college-accent)", fontSize: "1.1rem" }}>Stay Connected</h4>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6, opacity: 0.8, marginBottom: "1rem" }}>Subscribe to our newsletter for the latest updates.</p>
            <div style={{ display: "flex" }}>
              <input type="email" placeholder="Your email address" style={{ flex: 1, padding: "0.75rem", border: "none", borderRadius: "4px 0 0 4px", width: "100%" }} />
              <button type="button" style={{ padding: "0.75rem 1.5rem", backgroundColor: "var(--college-accent)", color: "white", border: "none", borderRadius: "0 4px 4px 0", fontWeight: "bold", cursor: "pointer" }}>Join</button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mobile-col" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", display: "flex", justifyContent: "space-between", fontSize: "0.85rem", opacity: 0.6, gap: "1rem", textAlign: "center", alignItems: "center" }}>
          <span>© {new Date().getFullYear()} Carolina College. All rights reserved.</span>
          <div className="mobile-center" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link href="#" style={{ color: "white", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="#" style={{ color: "white", textDecoration: "none" }}>Terms & Conditions</Link>
            <a href="#top" style={{ padding: "0.4rem 1rem", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "20px", color: "white", textDecoration: "none", fontWeight: "bold", marginLeft: "1rem", transition: "all 0.2s" }}>↑ Go to Top</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
