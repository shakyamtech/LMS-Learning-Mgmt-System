"use client";

import { useEffect } from "react";

export default function HeaderScrollHandler() {
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const header = document.querySelector(".site-main-header");
      if (!header) return;

      const currentScrollY = window.scrollY;

      // 1. Add general scrolled class for style changes (glassmorphism, compact padding)
      if (currentScrollY > 60) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
