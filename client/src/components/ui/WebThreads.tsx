/* JawyXDevs style: luminous woven signal threads in purple, pink, and white, layered beneath the hero typography. */
import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./WebThreads.css";

type Props = {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  threadCount?: number;
  frequency?: number;
  spread?: number;
  taper?: number;
  position?: number;
  fanMode?: "center" | "left" | "right";
  glow?: number;
  falloff?: number;
  thickness?: number;
  brightness?: number;
  opacity?: number;
  mirror?: boolean;
  shimmer?: boolean;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  className?: string;
};

const vertex = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime, uSpeed, uThreadCount, uFrequency, uSpread, uTaper, uPosition;
uniform float uFanMode, uGlow, uFalloff, uThickness, uBrightness, uOpacity, uMirror, uGrain, uGrainIntensity;
uniform vec3 uColor1, uColor2, uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength, uEnableMouse, uMouseActive;
out vec4 fragColor;
#define TAU 6.28318530718
#define MAX_THREADS 10
float glow(float x, float strength, float distanceToLine){ return distanceToLine / pow(max(x, 0.0001), strength); }
void main(){
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float n = max(uThreadCount, 1.0);
  float pinchX = uFanMode < 0.5 ? 0.5 : (uFanMode < 1.5 ? 0.0 : 1.0);
  if(uEnableMouse > 0.5) pinchX = mix(pinchX, uMouse.x, clamp(uMouseStrength, 0.0, 1.0) * uMouseActive);
  float spreadDx = uSpread * abs(uv.x - pinchX);
  float baseT = iTime * uSpeed;
  float tauOverN = TAU / n;
  float mirrorSign = uMirror > 0.5 ? sign(pinchX - uv.x) : 1.0;
  float invThickness = 1.0 / max(uThickness, 0.01);
  float yOff = uv.y - uPosition;
  float ciScale = n > 1.0 ? 1.0 / (n - 1.0) : 0.0;
  vec3 col = vec3(0.0); float gsum = 0.0;
  for(int idx=0; idx<MAX_THREADS; idx++){
    float i = float(idx); if(i >= n) break;
    float amplitude = spreadDx * (1.0 + i * uTaper);
    float phase = (baseT + i * tauOverN) * mirrorSign;
    float sdf = abs(yOff + sin(uv.x * uFrequency + phase) * amplitude) * invThickness;
    float g = glow(sdf, uFalloff, uGlow);
    vec3 threadCol = mix(uColor1, uColor2, i * ciScale);
    col += g * threadCol; gsum += g;
  }
  float core = smoothstep(0.5, 2.2, gsum);
  col = mix(col, uColor3 * gsum, core * 0.5);
  float bright = uBrightness + (uEnableMouse > 0.5 ? clamp(uMouseStrength, 0.0, 1.0) * uMouseActive * exp(-dot(uv-uMouse, uv-uMouse) * 6.0) * 0.6 : 0.0);
  col *= bright;
  float alpha = clamp(gsum, 0.0, 1.0) * uOpacity;
  vec3 outRgb = col * alpha;
  if(uGrain > 0.5){ float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity; outRgb = clamp(outRgb + grain, 0.0, 1.0); alpha = clamp(alpha + grain, 0.0, 1.0); }
  fragColor = vec4(outRgb, alpha);
}`;

const colors = (hex: string) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255] : [1, 1, 1];
};

export default function WebThreads({
  color1 = "#5227FF", color2 = "#FF9FFC", color3 = "#FFFFFF", speed = 0.2, threadCount = 6,
  frequency = 5, spread = 0.18, taper = 1, position = 0.5, fanMode = "center", glow = 0.02,
  falloff = 0.6, thickness = 1.1, brightness = 0.6, opacity = 1, mirror = true, shimmer = false,
  grain = true, grainIntensity = 0.05, mouseInteraction = true, mouseStrength = 0.3, className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef({ mouseInteraction, mouseStrength });

  useEffect(() => {
    settingsRef.current = { mouseInteraction, mouseStrength };
  }, [mouseInteraction, mouseStrength]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;";
    container.appendChild(canvas);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex, fragment,
      uniforms: {
        iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) }, uSpeed: { value: speed },
        uThreadCount: { value: threadCount }, uFrequency: { value: frequency }, uSpread: { value: spread }, uTaper: { value: taper },
        uPosition: { value: position }, uFanMode: { value: fanMode === "left" ? 1 : fanMode === "right" ? 2 : 0 }, uGlow: { value: glow },
        uFalloff: { value: falloff }, uThickness: { value: thickness }, uBrightness: { value: brightness }, uOpacity: { value: opacity },
        uMirror: { value: mirror ? 1 : 0 }, uShimmer: { value: shimmer ? 1 : 0 }, uGrain: { value: grain ? 1 : 0 },
        uGrainIntensity: { value: grainIntensity }, uColor1: { value: new Float32Array(colors(color1)) }, uColor2: { value: new Float32Array(colors(color2)) },
        uColor3: { value: new Float32Array(colors(color3)) }, uMouse: { value: new Float32Array([0.5, 0.5]) }, uMouseStrength: { value: mouseStrength },
        uEnableMouse: { value: mouseInteraction ? 1 : 0 }, uMouseActive: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const resize = () => { const rect = container.getBoundingClientRect(); renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height)); const res = program.uniforms.iResolution.value as Float32Array; res[0] = gl.drawingBufferWidth; res[1] = gl.drawingBufferHeight; };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    const current = [0.5, 0.5]; const target = [0.5, 0.5]; let active = 0; let targetActive = 0; let raf = 0; let visible = true; let pageVisible = !document.hidden; const started = performance.now();
    const onMove = (event: MouseEvent) => { const rect = canvas.getBoundingClientRect(); target[0] = (event.clientX - rect.left) / rect.width; target[1] = 1 - (event.clientY - rect.top) / rect.height; targetActive = 1; };
    const onEnter = () => { targetActive = 1; }; const onLeave = () => { targetActive = 0; };
    canvas.addEventListener("mousemove", onMove); canvas.addEventListener("mouseenter", onEnter); canvas.addEventListener("mouseleave", onLeave);
    const loop = (time: number) => { program.uniforms.iTime.value = (time - started) * 0.001; current[0] += 0.05 * (target[0] - current[0]); current[1] += 0.05 * (target[1] - current[1]); active += 0.05 * (targetActive - active); program.uniforms.uMouse.value[0] = current[0]; program.uniforms.uMouse.value[1] = current[1]; program.uniforms.uMouseActive.value = active; program.uniforms.uEnableMouse.value = settingsRef.current.mouseInteraction ? 1 : 0; program.uniforms.uMouseStrength.value = settingsRef.current.mouseStrength; renderer.render({ scene: mesh }); raf = requestAnimationFrame(loop); };
    const start = () => { if (visible && pageVisible && !raf) raf = requestAnimationFrame(loop); }; const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop(); }); intersection.observe(container);
    const visibility = () => { pageVisible = !document.hidden; pageVisible ? start() : stop(); }; document.addEventListener("visibilitychange", visibility); start();
    return () => { stop(); observer.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", visibility); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseenter", onEnter); canvas.removeEventListener("mouseleave", onLeave); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, [brightness, color1, color2, color3, fanMode, falloff, frequency, glow, grain, grainIntensity, mirror, mouseInteraction, mouseStrength, opacity, position, spread, taper, threadCount, thickness, speed, shimmer]);

  return <div ref={containerRef} className={`web-threads-container ${className}`.trim()} aria-hidden="true" />;
}
