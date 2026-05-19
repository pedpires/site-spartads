import { GrainGradient } from "@paper-design/shaders-react";

export function GrainBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <GrainGradient
        style={{ height: "100%", width: "100%" }}
        colorBack="hsl(220, 100%, 2%)"
        softness={0.72}
        intensity={0.65}
        noise={0}
        shape="corners"
        offsetX={-0.1}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={0.7}
        colors={["hsl(211, 100%, 50%)", "hsl(220, 85%, 28%)", "hsl(200, 100%, 60%)"]}
      />
    </div>
  );
}
