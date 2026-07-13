"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  {
    title: "This is \n Carolina!",
    subtitle: "Experience an academic environment designed to foster critical thinking, global perspectives, and career readiness.",
    image: "/hero_slide_3.png",
  },
  {
    title: "Empowering \n Futures",
    subtitle: "Join a diverse community of learners and educators dedicated to excellence and innovation.",
    image: "/hero_slide_2.png",
  },
  {
    title: "Lead with \n Purpose",
    subtitle: "Discover your passion and develop the skills to make a lasting impact on the world.",
    image: "/hero_slide_1.png",
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex-row" style={{ minHeight: "calc(100vh - 120px)", backgroundColor: "var(--college-bg-cream)", position: "relative", overflow: "hidden" }}>
      <div className="section-pad" style={{ flex: 0.8, display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 2, position: "relative" }}>
        {/* We use position absolute for text to allow cross-fade without layout shift, 
            but for simplicity and responsive height we'll just let the text change inline. 
            A better approach is to map the text and change opacity. */}
        
        <div style={{ position: "relative", minHeight: "250px" }}>
          {slides.map((slide, index) => (
            <div 
              key={index} 
              style={{ 
                position: index === 0 ? "relative" : "absolute", 
                top: 0, 
                left: 0, 
                width: "100%",
                opacity: current === index ? 1 : 0, 
                visibility: current === index ? "visible" : "hidden",
                transition: "opacity 0.6s ease-in-out, visibility 0.6s ease-in-out" 
              }}
            >
              <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "4.5rem", fontWeight: 800, margin: "0 0 1.5rem 0", lineHeight: 1.1, color: "var(--college-text)", whiteSpace: "pre-line" }}>
                {slide.title.split('\n')[0]} <br /><span style={{ borderBottom: "4px solid var(--college-accent)", paddingBottom: "0.2rem" }}>{slide.title.split('\n')[1]?.trim() || ''}</span>
              </h1>
              <p style={{ fontSize: "1.2rem", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: "500px", color: "#555" }}>
                {slide.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div className="mobile-col" style={{ display: "flex", gap: "1.5rem", alignItems: "center", position: "relative", zIndex: 3 }}>
          <Link href="/register" style={{ padding: "1rem 2rem", backgroundColor: "var(--college-primary)", color: "white", textDecoration: "none", fontWeight: "bold", borderRadius: "4px", textAlign: "center" }}>Explore Admission</Link>
          <Link href="#" style={{ color: "var(--college-primary)", textDecoration: "none", fontWeight: "bold", textAlign: "center" }}>Academics →</Link>
        </div>
        
        {/* Slider Dots */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "3rem", position: "relative", zIndex: 3 }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: current === index ? "2px solid var(--college-primary)" : "none",
                backgroundColor: current === index ? "transparent" : "#ccc",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s"
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="hero-img-box mobile-img-box" style={{ flex: 1.2, backgroundColor: "#EAE6DF", position: "relative" }}>
        {/* Soft edge gradient overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "20%",
          height: "100%",
          background: "linear-gradient(to right, var(--college-bg-cream) 0%, rgba(248, 246, 240, 0) 100%)",
          zIndex: 2,
          pointerEvents: "none"
        }} />
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide.image}
            alt={`Hero Slide ${index + 1}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: current === index ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}
      </div>
    </section>
  );
}
