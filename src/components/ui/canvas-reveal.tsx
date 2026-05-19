import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Uniforms = {
  [key: string]: { value: number[] | number[][] | number; type: string };
};

const ShaderMesh = ({
  source,
  uniforms,
}: {
  source: string;
  uniforms: Uniforms;
}) => {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);

  const getUniforms = () => {
    const out: Record<string, unknown> = {};
    for (const name in uniforms) {
      const u = uniforms[name] as { value: unknown; type: string };
      switch (u.type) {
        case "uniform1f":  out[name] = { value: u.value }; break;
        case "uniform1i":  out[name] = { value: u.value }; break;
        case "uniform1fv": out[name] = { value: u.value }; break;
        case "uniform3fv":
          out[name] = { value: (u.value as number[][]).map(v => new THREE.Vector3().fromArray(v)) };
          break;
        default: out[name] = { value: u.value };
      }
    }
    out["u_time"] = { value: 0 };
    out["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return out;
  };

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      precision mediump float;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main() {
        gl_Position = vec4(position, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
    `,
    fragmentShader: source,
    uniforms: getUniforms() as Record<string, THREE.IUniform>,
    glslVersion: THREE.GLSL3,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneFactor,
  }), [size.width, size.height, source]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.ShaderMaterial;
    mat.uniforms.u_time.value = clock.getElapsedTime();
    mat.uniforms.u_resolution.value.set(size.width * 2, size.height * 2);
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  center?: ("x" | "y")[];
}

const DotMatrix = ({
  colors = [[0, 122, 255]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 3,
  center = ["x", "y"],
}: DotMatrixProps) => {
  let colorsArray = Array(6).fill(colors[0]) as number[][];
  if (colors.length === 2) colorsArray = [...Array(3).fill(colors[0]), ...Array(3).fill(colors[1])];
  else if (colors.length === 3) colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];

  const uniforms = useMemo<Uniforms>(() => ({
    u_colors:     { value: colorsArray.map(c => [c[0]/255, c[1]/255, c[2]/255]), type: "uniform3fv" },
    u_opacities:  { value: opacities,  type: "uniform1fv" },
    u_total_size: { value: totalSize,  type: "uniform1f"  },
    u_dot_size:   { value: dotSize,    type: "uniform1f"  },
  }), [colors, opacities, totalSize, dotSize]);

  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMesh
        uniforms={uniforms}
        source={`
          precision mediump float;
          in vec2 fragCoord;
          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;
          out vec4 fragColor;

          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
          }

          void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
            ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}

            float opacity = step(0.0, st.x) * step(0.0, st.y);
            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / 5.0) + show_offset + 5.0));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            // Reveal from center outward
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist = distance(center_grid, st2);
            float timing = dist * 0.01 + random(st2) * 0.15;
            opacity *= step(timing, u_time * 0.4);

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
          }
        `}
      />
    </Canvas>
  );
};

export function CanvasRevealBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000818" }}>
      <DotMatrix
        colors={[[0, 122, 255], [61, 153, 255], [20, 90, 200]]}
        opacities={[0.08, 0.1, 0.12, 0.15, 0.18, 0.2, 0.28, 0.32, 0.4, 0.5]}
        totalSize={18}
        dotSize={3}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(0,8,24,0.55) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}
