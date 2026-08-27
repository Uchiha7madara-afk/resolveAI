"use client";

import { useEffect, useRef } from "react";

export default function HeroBubble() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Bubble properties
    const bubbles: {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      hue: number;
      opacity: number;
    }[] = [];

    // Create bubbles
    const createBubbles = () => {
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < Math.min(count, 15); i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 20 + Math.random() * 80,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          hue: 200 + Math.random() * 60,
          opacity: 0.1 + Math.random() * 0.2,
        });
      }
    };
    createBubbles();

    // Animation
    let frameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((bubble) => {
        bubble.x += bubble.speedX;
        bubble.y += bubble.speedY;

        if (bubble.x < 0 || bubble.x > canvas.width) bubble.speedX *= -1;
        if (bubble.y < 0 || bubble.y > canvas.height) bubble.speedY *= -1;

        const gradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.radius,
        );

        gradient.addColorStop(
          0,
          `hsla(${bubble.hue}, 80%, 80%, ${bubble.opacity * 1.5})`,
        );
        gradient.addColorStop(
          0.5,
          `hsla(${bubble.hue + 30}, 70%, 60%, ${bubble.opacity})`,
        );
        gradient.addColorStop(
          1,
          `hsla(${bubble.hue + 60}, 60%, 40%, ${bubble.opacity * 0.5})`,
        );

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        const highlight = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          0,
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          bubble.radius * 0.4,
        );
        highlight.addColorStop(0, "rgba(255,255,255,0.6)");
        highlight.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = highlight;
        ctx.fill();

        const glow = ctx.createRadialGradient(
          bubble.x,
          bubble.y,
          bubble.radius * 0.5,
          bubble.x,
          bubble.y,
          bubble.radius * 2,
        );
        glow.addColorStop(
          0,
          `hsla(${bubble.hue}, 60%, 60%, ${bubble.opacity * 0.3})`,
        );
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
