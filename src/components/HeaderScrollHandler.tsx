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

      // 2. Slide down header on scroll up, slide up on scroll down
      if (currentScrollY > 350) {
        header.classList.add("scrolling-active");
        if (currentScrollY > lastScrollY) {
          // Scrolling down -> hide header smoothly
          header.classList.add("header-hidden");
        } else {
          // Scrolling up -> slide header down smoothly
          header.classList.remove("header-hidden");
        }
      } else {
        header.classList.remove("scrolling-active");
        header.classList.remove("header-hidden");
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
