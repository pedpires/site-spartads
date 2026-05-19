import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  baseX: number; baseY: number;
  vx: number; vy: number;
  size: number;
  density: number;
  friction: number;
  color: string;
}

const BASE_COLOR = "rgba(0,40,100,0.45)";
const ACTIVE_COLOR = "#007aff";

export function FluidParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    ctx.globalCompositeOperation = "lighter";

    let particles: Particle[] = [];
    let animId = 0;
    let mouseX = -1000, mouseY = -1000;
    let blast = { active: false, x: 0, y: 0, radius: 0 };
    const INTERACTION = 110;
    const MAX_BLAST = 300;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth, h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
      ctx.globalCompositeOperation = "lighter";
      initParticles(w, h);
    };

    const initParticles = (w: number, h: number) => {
      particles = [];
      const count = Math.floor((w * h) / 110);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w, y = Math.random() * h;
        const density = Math.random() * 3 + 1;
        particles.push({
          x, y, baseX: x, baseY: y,
          vx: 0, vy: 0,
          size: Math.random() * 1.2 + 0.3,
          density,
          friction: 0.9 - 0.01 * density,
          color: BASE_COLOR,
        });
      }
    };

    const easeOut = (t: number) => t * (2 - t);

    const triggerBlast = (x: number, y: number) => {
      blast = { active: true, x, y, radius: 0 };
      const start = performance.now();
      const expand = (ts: number) => {
        const prog = Math.min((ts - start) / 300, 1);
        blast.radius = easeOut(prog) * MAX_BLAST;
        if (prog < 1) requestAnimationFrame(expand);
        else setTimeout(() => { blast.active = false; }, 80);
      };
      requestAnimationFrame(expand);
    };

    const animate = () => {
      const w = container.clientWidth, h = container.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= p.friction; p.vy *= p.friction;

        const dx = mouseX - p.x, dy = mouseY - p.y;
        const d = Math.hypot(dx, dy);

        if (d < INTERACTION && d > 0) {
          const force = (INTERACTION - d) / INTERACTION;
          p.x -= (dx/d) * force * p.density * 0.6;
          p.y -= (dy/d) * force * p.density * 0.6;
          p.color = ACTIVE_COLOR;
        } else {
          p.x += (p.baseX - p.x) * 0.05;
          p.y += (p.baseY - p.y) * 0.05;
          p.color = BASE_COLOR;
        }

        if (blast.active) {
          const bdx = p.x - blast.x, bdy = p.y - blast.y;
          const bd = Math.hypot(bdx, bdy);
          if (bd < blast.radius && bd > 0) {
            const force = (blast.radius - bd) / blast.radius;
            p.vx += (bdx/bd) * force * 14;
            p.vy += (bdy/bd) * force * 14;
            const t = 1 - bd / blast.radius;
            p.color = `rgba(${Math.floor(t*30)},${Math.floor(80+t*42)},255,0.8)`;
          }
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      triggerBlast(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position:"absolute", inset:0, overflow:"hidden", background:"#000818" }}>
      <canvas ref={canvasRef} style={{ display:"block" }} />
    </div>
  );
}
