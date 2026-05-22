/**
 * neural-background.js
 * WebGL topo-background — convertido de topo-background.tsx (React/TypeScript)
 * para vanilla JS puro. Sem dependências.
 */
(function () {
  var vsSource = [
    "attribute vec2 position;",
    "void main() {",
    "  gl_Position = vec4(position, 0.0, 1.0);",
    "}"
  ].join("\n");

  var fsSource = [
    "precision highp float;",
    "uniform float u_time;",
    "uniform vec2 u_resolution;",
    "",
    "float hash(vec2 p) {",
    "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);",
    "}",
    "",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),",
    "             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);",
    "}",
    "",
    "void main() {",
    "  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);",
    "",
    "  float depth = 1.0 / (uv.y + 1.15);",
    "  vec2 gridUv = vec2(uv.x * depth, depth + u_time * 0.15);",
    "",
    "  float n = noise(gridUv * 3.5);",
    "  float ripples = sin(gridUv.y * 18.0 + n * 8.0 + u_time * 0.5);",
    "  float topoLine = smoothstep(0.03, 0.0, abs(ripples));",
    "",
    "  vec3 baseColor   = vec3(0.0, 0.03, 0.10);",
    "  vec3 accentColor = vec3(0.0, 0.478, 1.0);",
    "  vec3 neonColor   = vec3(0.239, 0.60, 1.0);",
    "",
    "  vec3 finalColor = mix(baseColor, accentColor, n * 0.6);",
    "  finalColor += topoLine * neonColor * depth * 0.4;",
    "",
    "  float fade = smoothstep(0.1, -1.0, uv.y);",
    "  finalColor *= (1.0 - length(uv) * 0.45) * (1.0 - fade);",
    "",
    "  gl_FragColor = vec4(finalColor, 1.0);",
    "}"
  ].join("\n");

  function initTopoBackground(wrapId) {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return;

    var canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;display:block;filter:contrast(1.1) brightness(0.9);";
    wrap.appendChild(canvas);

    var gl = canvas.getContext("webgl");
    if (!gl) {
      // WebGL não suportado — mostrar fallback CSS gradient
      wrap.style.background =
        "radial-gradient(1400px 900px at 12% 0%, rgba(0,100,255,0.82), transparent 58%)," +
        "radial-gradient(900px 600px at 88% 10%, rgba(0,80,240,0.48), transparent 55%)," +
        "linear-gradient(180deg, #000818 0%, #001530 100%)";
      return;
    }

    function mkShader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    var program = gl.createProgram();
    gl.attachShader(program, mkShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, mkShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    var pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    var timeLoc = gl.getUniformLocation(program, "u_time");
    var resLoc  = gl.getUniformLocation(program, "u_resolution");

    var animId;
    function render(t) {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform1f(timeLoc, t * 0.001);
      gl.uniform2f(resLoc, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    // Limpar quando a página sair
    window.addEventListener("beforeunload", function () {
      cancelAnimationFrame(animId);
    });
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initTopoBackground("hero-bg-canvas-wrap");
    });
  } else {
    initTopoBackground("hero-bg-canvas-wrap");
  }
})();
