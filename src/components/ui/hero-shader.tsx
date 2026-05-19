"use client"

import { GrainGradient } from "@paper-design/shaders-react"

export function HeroShader() {
  return (
    <div className="absolute inset-0 -z-10">
      <GrainGradient
        style={{ height: "100%", width: "100%" }}
        colorBack="hsl(220, 100%, 2%)"
        softness={0.68}
        intensity={0.72}
        noise={0.08}
        shape="corners"
        offsetX={-0.15}
        offsetY={0}
        scale={1.1}
        rotation={0}
        speed={0.6}
        colors={[
          "hsl(211, 100%, 52%)",
          "hsl(220, 90%, 22%)",
          "hsl(200, 100%, 62%)",
        ]}
      />
    </div>
  )
}
