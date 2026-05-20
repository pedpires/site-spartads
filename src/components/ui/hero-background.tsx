import { useState, useEffect } from "react";
import { GrainBackground } from "./grain-background";
import { TopoBackground } from "./topo-background";
import { ShaderAnimation } from "./shader-animation";
import { FluidParticlesBg } from "./fluid-particle-bg";
import { CanvasRevealBackground } from "./canvas-reveal";

type Variant = "a" | "b" | "c" | "d" | "e";

// Only the active variant is mounted — inactive ones are fully unmounted (zero cost)
export function HeroBackground() {
  const [active, setActive] = useState<Variant>("a");

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
      {active === "a" && <GrainBackground />}
      {active === "b" && <TopoBackground />}
      {active === "c" && <ShaderAnimation />}
      {active === "d" && <FluidParticlesBg />}
      {active === "e" && <CanvasRevealBackground />}
    </div>
  );
}
