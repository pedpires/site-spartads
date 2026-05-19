import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  color: string;
}

const COLORS = ["#007aff", "#3d99ff", "#005cc8", "#1a6fff", "#0055dd"];

export function FluidParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();

    const onMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      mouseRef.current = {
        x: (cx - rect.left) / rect.width,
        y: (cy - rect.top) / rect.height,
      };
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    const spawnParticle = () => {
      const w = canvas.width, h = canvas.height;
      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;
      const spread = 80;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.2;
      particlesRef.current.push({
        x: mx + (Math.random() - 0.5) * spread,
        y: my + (Math.random() - 0.5) * spread,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        life: 0,
        maxLife: 80 + Math.random() * 120,
        size: 1.5 + Math.random() * 3.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const render = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#000818";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) spawnParticle();

      const MAX = 600;
      if (particlesRef.current.length > MAX) {
        particlesRef.current.splice(0, particlesRef.current.length - MAX);
      }

      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.vx *= 0.995;
        p.life++;

        const t = p.life / p.maxLife;
        const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.7;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      const grad = ctx.createRadialGradient(
        mouseRef.current.x * w, mouseRef.current.y * h, 0,
        mouseRef.current.x * w, mouseRef.current.y * h, w * 0.4
      );
      grad.addColorStop(0, "rgba(0,122,255,0.08)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
