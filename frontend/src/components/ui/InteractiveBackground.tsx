"use client";

import { useEffect, useRef } from "react";
import { useScroll, useSpring } from "framer-motion";

const MATH_SYMBOLS = ["∑", "∫", "∂", "Δ", "π", "Ω", "μ", "σ", "λ", "θ", "∇", "≈", "≠", "∞"];

class Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  symbol: string | null;

  constructor(width: number, height: number, isSymbol: boolean) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseX = this.x;
    this.baseY = this.y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = isSymbol ? Math.random() * 14 + 10 : Math.random() * 2 + 1;
    this.symbol = isSymbol ? MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)] : null;
  }

  update(width: number, height: number, scrollOffset: number) {
    this.x += this.vx;
    this.baseY += this.vy;
    
    // Wrap around
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.baseY < 0) this.baseY = height;
    if (this.baseY > height) this.baseY = 0;

    // Apply scroll parallax
    // Symbols move faster than small nodes to create depth
    const parallaxFactor = this.symbol ? 0.8 : 0.3;
    this.y = this.baseY - scrollOffset * parallaxFactor;
    
    // Wrap Y after scroll offset
    if (this.y < -50) this.baseY += height + 100;
    if (this.y > height + 50) this.baseY -= height + 100;
  }
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { damping: 20, stiffness: 100 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    const mouse = { x: -1000, y: -1000 };
    let currentScroll = 0;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      const numParticles = Math.floor((width * height) / 15000);
      const numSymbols = Math.floor(numParticles * 0.2);
      
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(width, height, i < numSymbols));
      }
    };

    init();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", init);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Subscribe to framer motion spring
    const unsubscribeScroll = smoothScrollY.on("change", (latest) => {
      currentScroll = latest;
    });

    let animationFrameId: number;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw subtle grid
      ctx.strokeStyle = "rgba(138, 148, 166, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offsetX = (currentScroll * 0.1) % gridSize;
      const offsetY = (currentScroll * 0.1) % gridSize;
      
      ctx.beginPath();
      for (let x = -offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = -offsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Scanline effect
      const scanlineY = (Date.now() / 20) % height;
      const gradient = ctx.createLinearGradient(0, scanlineY - 50, 0, scanlineY);
      gradient.addColorStop(0, "rgba(232, 93, 4, 0)");
      gradient.addColorStop(1, "rgba(232, 93, 4, 0.05)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanlineY - 50, width, 50);
      ctx.fillStyle = "rgba(232, 93, 4, 0.1)";
      ctx.fillRect(0, scanlineY, width, 1);
      
      // We assume a dark theme for "SafeShield Astro"
      const isDark = false; // Hardcoded to match our CSS updates
      const particleColor = isDark ? "rgba(232, 237, 242, " : "rgba(0, 0, 0, "; // Match off-white
      const accentColor = "rgba(232, 93, 4, "; // Astro Cyan
      
      particles.forEach((p) => {
        p.update(width, height, currentScroll);
        
        // Mouse interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;
        
        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          // Repel slightly
          p.x -= dx * force * 0.02;
          p.baseY -= dy * force * 0.02;
        }

        if (p.symbol) {
          // Draw Math Symbol
          ctx.font = `${p.size}px monospace`;
          ctx.fillStyle = `${particleColor}${0.1 + (distance < maxDist ? 0.2 : 0)})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.symbol, p.x, p.y);
        } else {
          // Draw Node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${accentColor}${0.3 + (distance < maxDist ? 0.5 : 0)})`;
          ctx.fill();
        }
      });
      
      // Draw Connections (Neural Net Effect)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          if (p1.symbol || p2.symbol) continue; // Don't connect symbols
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const opacity = 1 - dist / 150;
            ctx.strokeStyle = `${particleColor}${opacity * 0.15})`;
            ctx.stroke();
          }
        }
        
        // Connect to mouse
        if (!particles[i].symbol) {
          const p = particles[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            const opacity = 1 - dist / 200;
            ctx.strokeStyle = `${accentColor}${opacity * 0.3})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      unsubscribeScroll();
      cancelAnimationFrame(animationFrameId);
    };
  }, [smoothScrollY]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
      style={{ background: "transparent" }}
    />
  );
}
