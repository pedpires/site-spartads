import { useRef, useEffect, useCallback } from "react";

class PerlinNoise {
  p: Uint8Array;
  grad3: number[][];

  constructor(seed: number) {
    this.p = new Uint8Array(512);
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
    ];
    const s = seed > 0 && seed < 1 ? seed : Math.random();
    const p2 = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p2[i] = i;
    for (let i = 0; i < 256; i++) {
      const j = Math.floor(s * (i + 1)) % 256;
      const k = p2[i]; p2[i] = p2[j]; p2[j] = k;
    }
    for (let i = 0; i < 512; i++) this.p[i] = p2[i & 255];
  }

  private dot(g: number[], x: number, y: number) { return g[0]*x + g[1]*y; }

  perlin2(x: number, y: number): number {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const f = (t: number) => t*t*t*(t*(t*6-15)+10);
    const u = f(x), v = f(y);
    const p = this.p, g = this.grad3;
    const n00 = this.dot(g[p[X+p[Y]]%12], x, y);
    const n01 = this.dot(g[p[X+p[Y+1]]%12], x, y-1);
    const n10 = this.dot(g[p[X+1+p[Y]]%12], x-1, y);
    const n11 = this.dot(g[p[X+1+p[Y+1]]%12], x-1, y-1);
    const lerp = (a: number, b: number, t: number) => a + t*(b-a);
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
  }
}

const CFG = {
  GRID_X_GAP: 10, GRID_Y_GAP: 32,
  GRID_WIDTH_OFFSET: 200, GRID_HEIGHT_OFFSET: 30,
  WAVE_TIME_X_FACTOR: 0.0125, WAVE_NOISE_X_FACTOR: 0.002,
  WAVE_TIME_Y_FACTOR: 0.005, WAVE_NOISE_Y_FACTOR: 0.0015,
  WAVE_NOISE_MAGNITUDE: 12, WAVE_AMPLITUDE_X: 32, WAVE_AMPLITUDE_Y: 16,
  MOUSE_INFLUENCE_RADIUS: 175, MOUSE_FALLOFF_FACTOR: 0.001,
  MOUSE_FORCE_FACTOR: 0.00065, MOUSE_SMOOTHING_FACTOR: 0.1,
  MAX_MOUSE_VELOCITY: 100, TENSION_STRENGTH: 0.005, FRICTION: 0.925,
  CURSOR_DISPLACEMENT_STRENGTH: 2, MAX_CURSOR_DISPLACEMENT: 100,
};

type Point = {
  x: number; y: number;
  wave: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number };
};

export function InteractiveWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    ctx: null as CanvasRenderingContext2D | null,
    mouse: { x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false },
    lines: [] as Point[][],
    noise: new PerlinNoise(Math.random()),
    bounding: null as DOMRect | null,
    animId: 0,
  });

  const moved = useCallback((p: Point, withCursor = true) => ({
    x: Math.round((p.x + p.wave.x + (withCursor ? p.cursor.x : 0)) * 10) / 10,
    y: Math.round((p.y + p.wave.y + (withCursor ? p.cursor.y : 0)) * 10) / 10,
  }), []);

  useEffect(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    s.ctx = canvas.getContext("2d")!;

    const setSize = () => {
      s.bounding = container.getBoundingClientRect();
      canvas.width = s.bounding.width;
      canvas.height = s.bounding.height;
    };

    const setLines = () => {
      if (!s.bounding) return;
      const { width, height } = s.bounding;
      s.lines = [];
      const tL = Math.ceil((width + CFG.GRID_WIDTH_OFFSET) / CFG.GRID_X_GAP);
      const tP = Math.ceil((height + CFG.GRID_HEIGHT_OFFSET) / CFG.GRID_Y_GAP);
      const xS = (width - CFG.GRID_X_GAP * tL) / 2;
      const yS = (height - CFG.GRID_Y_GAP * tP) / 2;
      for (let i = 0; i <= tL; i++) {
        const pts: Point[] = [];
        for (let j = 0; j <= tP; j++)
          pts.push({ x: xS + CFG.GRID_X_GAP*i, y: yS + CFG.GRID_Y_GAP*j, wave:{x:0,y:0}, cursor:{x:0,y:0,vx:0,vy:0} });
        s.lines.push(pts);
      }
    };

    const movePoints = (time: number) => {
      s.lines.forEach(pts => pts.forEach(p => {
        const mv = s.noise.perlin2(
          (p.x + time * CFG.WAVE_TIME_X_FACTOR) * CFG.WAVE_NOISE_X_FACTOR,
          (p.y + time * CFG.WAVE_TIME_Y_FACTOR) * CFG.WAVE_NOISE_Y_FACTOR
        ) * CFG.WAVE_NOISE_MAGNITUDE;
        p.wave.x = Math.cos(mv) * CFG.WAVE_AMPLITUDE_X;
        p.wave.y = Math.sin(mv) * CFG.WAVE_AMPLITUDE_Y;
        const dx = p.x - s.mouse.sx, dy = p.y - s.mouse.sy;
        const d = Math.hypot(dx, dy);
        const rad = Math.max(CFG.MOUSE_INFLUENCE_RADIUS, s.mouse.vs);
        if (d < rad) {
          const falloff = 1 - d/rad;
          const ff = Math.cos(d * CFG.MOUSE_FALLOFF_FACTOR) * falloff * rad * s.mouse.vs * CFG.MOUSE_FORCE_FACTOR;
          p.cursor.vx += Math.cos(s.mouse.a) * ff;
          p.cursor.vy += Math.sin(s.mouse.a) * ff;
        }
        p.cursor.vx += (0 - p.cursor.x) * CFG.TENSION_STRENGTH;
        p.cursor.vy += (0 - p.cursor.y) * CFG.TENSION_STRENGTH;
        p.cursor.vx *= CFG.FRICTION; p.cursor.vy *= CFG.FRICTION;
        p.cursor.x += p.cursor.vx * CFG.CURSOR_DISPLACEMENT_STRENGTH;
        p.cursor.y += p.cursor.vy * CFG.CURSOR_DISPLACEMENT_STRENGTH;
        p.cursor.x = Math.min(CFG.MAX_CURSOR_DISPLACEMENT, Math.max(-CFG.MAX_CURSOR_DISPLACEMENT, p.cursor.x));
        p.cursor.y = Math.min(CFG.MAX_CURSOR_DISPLACEMENT, Math.max(-CFG.MAX_CURSOR_DISPLACEMENT, p.cursor.y));
      }));
    };

    const drawLines = () => {
      const { ctx, bounding } = s;
      if (!ctx || !bounding) return;
      ctx.clearRect(0, 0, bounding.width, bounding.height);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,122,255,0.28)";
      ctx.lineWidth = 0.7;
      s.lines.forEach(pts => {
        const p1 = moved(pts[0], false);
        ctx.moveTo(p1.x, p1.y);
        for (let i = 0; i < pts.length - 1; i++) {
          const c = moved(pts[i], true), n = moved(pts[i+1], true);
          ctx.quadraticCurveTo(c.x, c.y, (c.x+n.x)/2, (c.y+n.y)/2);
        }
      });
      ctx.stroke();
    };

    const tick = (time: number) => {
      const m = s.mouse;
      m.sx += (m.x - m.sx) * CFG.MOUSE_SMOOTHING_FACTOR;
      m.sy += (m.y - m.sy) * CFG.MOUSE_SMOOTHING_FACTOR;
      const dx = m.sx - m.lx, dy = m.sy - m.ly, d = Math.hypot(dx, dy);
      m.v = d;
      m.vs += (d - m.vs) * CFG.MOUSE_SMOOTHING_FACTOR;
      m.vs = Math.min(CFG.MAX_MOUSE_VELOCITY, m.vs);
      m.a = Math.atan2(dy, dx);
      m.lx = m.sx; m.ly = m.sy;
      movePoints(time);
      drawLines();
      s.animId = requestAnimationFrame(tick);
    };

    const updateMouse = (x: number, y: number) => {
      if (!s.bounding) return;
      s.mouse.x = x - s.bounding.left;
      s.mouse.y = y - s.bounding.top;
      if (!s.mouse.set) {
        s.mouse.sx = s.mouse.x; s.mouse.sy = s.mouse.y;
        s.mouse.lx = s.mouse.x; s.mouse.ly = s.mouse.y;
        s.mouse.set = true;
      }
    };

    const onResize = () => { setSize(); setLines(); };
    const onMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => updateMouse(e.touches[0].clientX, e.touches[0].clientY);

    setSize(); setLines();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    s.animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(s.animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, [moved]);

  return (
    <div ref={containerRef} style={{ position:"absolute", inset:0, overflow:"hidden", background:"#000818" }}>
      <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }} />
    </div>
  );
}
