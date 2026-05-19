import AnimatedGradient from "./animated-gradient";

export function AnimatedGradientBackground() {
  return (
    <AnimatedGradient
      config={{
        preset: "custom",
        color1: "#000818",
        color2: "#007aff",
        color3: "#3d99ff",
        rotation: -30,
        proportion: 40,
        scale: 0.5,
        speed: 25,
        distortion: 6,
        swirl: 70,
        swirlIterations: 8,
        softness: 85,
        offset: -200,
        shape: "Checks",
        shapeSize: 35,
      }}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    />
  );
}
