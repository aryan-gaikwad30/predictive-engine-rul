"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "PRODUCT", id: "product" },
    { name: "HOW IT WORKS", id: "how-it-works" },
    { name: "ANALYZE", id: "analyze" },
    { name: "RESULTS", id: "results" },
    { name: "ENGINEERING", id: "engineering" },
  ];

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full transition-all duration-300"
        initial={false}
        animate={{
          paddingTop: isScrolled && !prefersReducedMotion ? "1rem" : "1.5rem",
          paddingBottom: isScrolled && !prefersReducedMotion ? "0" : "1.5rem",
        }}
      >
        <motion.nav
          className="flex items-center justify-between px-6 md:px-8 w-full transition-all duration-300"
          initial={false}
          animate={{
            backgroundColor: isScrolled ? "rgba(245, 244, 239, 0.95)" : "transparent",
            backdropFilter: isScrolled ? "blur(12px)" : "none",
            borderBottom: isScrolled ? "1px solid var(--color-border)" : "1px solid transparent",
            maxWidth: "1440px",
          }}
        >
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 py-4">
            <span className="font-bold tracking-tighter text-lg md:text-xl text-[var(--color-graphite)] uppercase whitespace-nowrap">
              Predictive<span className="text-[var(--color-industrial)]">Engine</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex flex-1 justify-center items-center gap-8 px-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScroll(link.id)}
                className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] hover:text-[var(--color-graphite)] transition-colors whitespace-nowrap"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* External Links */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <a href="https://github.com/aryan-gaikwad30/predictive-engine-rul" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold tracking-widest uppercase text-[var(--color-graphite)] hover:text-[var(--color-industrial)] transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold tracking-widest uppercase text-[var(--color-graphite)] hover:text-[var(--color-industrial)] transition-colors">
              LinkedIn
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex-shrink-0 py-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--color-graphite)] text-sm font-bold tracking-widest uppercase"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? "CLOSE" : "MENU"}
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[var(--background)] flex flex-col pt-24 px-8 pb-8 lg:hidden">
          <div className="flex flex-col gap-8 text-2xl font-bold tracking-tighter uppercase">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScroll(link.id)}
                className="text-left text-[var(--color-graphite)] hover:text-[var(--color-industrial)]"
              >
                {link.name}
              </button>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-4 text-sm font-semibold tracking-widest uppercase">
            <a href="https://github.com/aryan-gaikwad30/predictive-engine-rul" target="_blank" rel="noopener noreferrer" className="text-[var(--color-muted)]">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-muted)]">LinkedIn</a>
          </div>
        </div>
      )}
    </>
  );
}
