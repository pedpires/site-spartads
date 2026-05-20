import { TopoBackground } from "./topo-background";

export function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <TopoBackground />
    </div>
  );
}
