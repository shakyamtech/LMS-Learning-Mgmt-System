"use client";

import { useState, useEffect } from "react";

const testimonials = [
  {
    quote: "My time at Carolina College has been nothing short of amazing. The professors actually care about your success, and the campus community is incredibly welcoming.",
    name: "Aarohi Shrestha",
    class: "Class of 2024",
    avatar: "/avatar1.png"
  },
  {
    quote: "The diverse environment and the modern computer science facilities completely transformed my career trajectory. I found my passion here.",
    name: "Sriya Maharjan",
    class: "Class of 2025",
    avatar: "/avatar2.png"
  },
  {
    quote: "Joining the academic clubs gave me practical skills I could never learn in a classroom alone. It's truly a place that builds leaders.",
    name: "Priya Thapa",
    class: "Class of 2023",
    avatar: "/avatar3.png"
  }
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-pad" style={{ backgroundColor: "var(--college-bg-cream)", textAlign: "center" }}>
      <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", margin: "0 0 4rem 0", color: "var(--college-primary)" }}>
        What Our Students Say
      </h2>
      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", padding: "4rem 2rem", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", position: "relative", minHeight: "350px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        
        {testimonials.map((testim, index) => (
          <div 
            key={index}
            style={{
              position: index === 0 ? "relative" : "absolute",
              top: index === 0 ? "auto" : "50%",
              left: index === 0 ? "auto" : "50%",
              transform: index === 0 ? "none" : "translate(-50%, -50%)",
              width: "100%",
              padding: "0 2rem",
              opacity: current === index ? 1 : 0,
              visibility: current === index ? "visible" : "hidden",
              transition: "opacity 0.5s ease-in-out, visibility 0.5s ease-in-out",
            }}
          >
            <div style={{ 
              width: "90px", 
              height: "90px", 
              borderRadius: "50%", 
              margin: "0 auto 1.5rem auto",
              backgroundImage: `url(${testim.avatar})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              border: "3px solid var(--college-bg-cream)"
            }}></div>
            <p style={{ fontSize: "1.25rem", fontStyle: "italic", color: "#555", lineHeight: 1.6, marginBottom: "2rem" }}>
              "{testim.quote}"
            </p>
            <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--college-primary)", fontSize: "1.1rem" }}>{testim.name}</h4>
            <span style={{ fontSize: "0.9rem", color: "#999" }}>{testim.class}</span>
          </div>
        ))}

        {/* Navigation Dots */}
        <div style={{ position: "absolute", bottom: "1.5rem", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: current === index ? "var(--college-primary)" : "#ddd",
                cursor: "pointer",
                padding: 0,
                transition: "background-color 0.3s"
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
