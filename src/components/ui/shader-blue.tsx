import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ShaderBlue() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Same ring pattern as the original but remapped to Spartads blue palette
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.05;
        float lineWidth = 0.002;

        vec3 raw = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i = 0; i < 5; i++){
            raw[j] += lineWidth * float(i*i) / abs(
              fract(t - 0.01*float(j) + float(i)*0.01)*5.0
              - length(uv)
              + mod(uv.x + uv.y, 0.2)
            );
          }
        }

        // Dark navy base — #000818
        vec3 color = vec3(0.0, 0.031, 0.094);

        // Map ring channels to Spartads blues
        vec3 brand  = vec3(0.0,   0.478, 1.0);   // #007aff
        vec3 brand2 = vec3(0.239, 0.600, 1.0);   // #3d99ff
        vec3 light  = vec3(0.4,   0.75,  1.0);   // lighter cyan-blue

        color += raw[0] * brand  * 2.2;
        color += raw[1] * brand2 * 1.8;
        color += raw[2] * light  * 1.4;

        // Subtle radial glow towards center
        float dist = length(uv);
        color += brand * (1.0 - smoothstep(0.0, 1.2, dist)) * 0.06;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    scene.add(new THREE.Mesh(geometry, material));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const resize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener("resize", resize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000818" }}
    />
  );
}
