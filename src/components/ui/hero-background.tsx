import { useState, useEffect } from "react";
import { TopoBackground } from "./topo-background";
import { FluidParticlesBg } from "./fluid-particle-bg";
import { CanvasRevealBackground } from "./canvas-reveal";

type Variant = "b" | "d" | "e";

// Only the active variant is mounted — inactive ones are fully unmounted (zero cost)
export function HeroBackground() {
  const [active, setActive] = useState<Variant>("b");

  useEffect(() => {
    const handler = (e: Event) => {
      const v = (e as CustomEvent<{ variant: Variant }>).detail?.variant;
      if (v) setActive(v);
    };
    document.addEventListener("bg-change", handler);
    return () => document.removeEventListener("bg-change", handler);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {active === "b" && <TopoBackground />}
      {active === "d" && <FluidParticlesBg />}
      {active === "e" && <CanvasRevealBackground />}
    </div>
  );
}
