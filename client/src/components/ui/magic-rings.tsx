import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./magic-rings.css";

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;
const float HP = 1.5707963;
const float CYCLE = 3.45;
float fade(float t) { return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t); }
float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t = mod(uTime + t0, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}
void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}
`;

export function MagicRings({
  color = "#159dff",
  colorTwo = "#bcecff",
  speed = 0.55,
  ringCount = 6,
  attenuation = 10,
  lineThickness = 1.5,
  baseRadius = 0.35,
  radiusStep = 0.1,
  scaleRate = 0.1,
  opacity = 0.28,
  noiseAmount = 0.035,
  rotation = 0,
  ringGap = 1.5,
  fadeIn = 0.7,
  fadeOut = 0.5,
  followMouse = true,
  mouseInfluence = 0.18,
  hoverScale = 1.08,
  parallax = 0.04,
  clickBurst = false,
}: {
  color?: string; colorTwo?: string; speed?: number; ringCount?: number; attenuation?: number;
  lineThickness?: number; baseRadius?: number; radiusStep?: number; scaleRate?: number;
  opacity?: number; noiseAmount?: number; rotation?: number; ringGap?: number; fadeIn?: number;
  fadeOut?: number; followMouse?: boolean; mouseInfluence?: number; hoverScale?: number;
  parallax?: number; clickBurst?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ color, colorTwo, speed, ringCount, attenuation, lineThickness, baseRadius, radiusStep, scaleRate, opacity, noiseAmount, rotation, ringGap, fadeIn, fadeOut, followMouse, mouseInfluence, hoverScale, parallax, clickBurst });
  propsRef.current = { color, colorTwo, speed, ringCount, attenuation, lineThickness, baseRadius, radiusStep, scaleRate, opacity, noiseAmount, rotation, ringGap, fadeIn, fadeOut, followMouse, mouseInfluence, hoverScale, parallax, clickBurst };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }); } catch { return; }
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;
    const uniforms = {
      uTime: { value: 0 }, uAttenuation: { value: attenuation }, uResolution: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color(color) }, uColorTwo: { value: new THREE.Color(colorTwo) }, uLineThickness: { value: lineThickness },
      uBaseRadius: { value: baseRadius }, uRadiusStep: { value: radiusStep }, uScaleRate: { value: scaleRate }, uRingCount: { value: ringCount },
      uOpacity: { value: opacity }, uNoiseAmount: { value: noiseAmount }, uRotation: { value: rotation * Math.PI / 180 }, uRingGap: { value: ringGap },
      uFadeIn: { value: fadeIn }, uFadeOut: { value: fadeOut }, uMouse: { value: new THREE.Vector2() }, uMouseInfluence: { value: mouseInfluence },
      uHoverAmount: { value: 0 }, uHoverScale: { value: hoverScale }, uParallax: { value: parallax }, uBurst: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(quad);
    const mouse = new THREE.Vector2();
    const smoothMouse = new THREE.Vector2();
    const resize = () => { const w = mount.clientWidth; const h = mount.clientHeight; const dpr = Math.min(window.devicePixelRatio, 1.5); renderer.setSize(w, h, false); renderer.setPixelRatio(dpr); uniforms.uResolution.value.set(w * dpr, h * dpr); };
    const onMouseMove = (event: MouseEvent) => { const rect = mount.getBoundingClientRect(); mouse.set((event.clientX - rect.left) / rect.width - 0.5, -((event.clientY - rect.top) / rect.height - 0.5)); };
    const onMouseLeave = () => mouse.set(0, 0);
    const ro = new ResizeObserver(resize); ro.observe(mount); resize();
    mount.addEventListener("mousemove", onMouseMove); mount.addEventListener("mouseleave", onMouseLeave);
    let raf = 0; let last = 0; let elapsed = 0;
    const animate = (time: number) => {
      raf = requestAnimationFrame(animate);
      const p = propsRef.current;
      const dt = last ? Math.min(time - last, 100) : 0; last = time; elapsed += dt * 0.001 * p.speed;
      smoothMouse.lerp(mouse, 0.08);
      uniforms.uTime.value = elapsed; uniforms.uAttenuation.value = p.attenuation; uniforms.uColor.value.set(p.color); uniforms.uColorTwo.value.set(p.colorTwo);
      uniforms.uLineThickness.value = p.lineThickness; uniforms.uBaseRadius.value = p.baseRadius; uniforms.uRadiusStep.value = p.radiusStep; uniforms.uScaleRate.value = p.scaleRate;
      uniforms.uRingCount.value = p.ringCount; uniforms.uOpacity.value = p.opacity; uniforms.uNoiseAmount.value = p.noiseAmount; uniforms.uRotation.value = p.rotation * Math.PI / 180;
      uniforms.uRingGap.value = p.ringGap; uniforms.uFadeIn.value = p.fadeIn; uniforms.uFadeOut.value = p.fadeOut; uniforms.uMouse.value.copy(smoothMouse); uniforms.uMouseInfluence.value = p.followMouse ? p.mouseInfluence : 0; uniforms.uParallax.value = p.parallax;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mount.removeEventListener("mousemove", onMouseMove); mount.removeEventListener("mouseleave", onMouseLeave); mount.removeChild(renderer.domElement); renderer.dispose(); material.dispose(); quad.geometry.dispose(); };
  }, []);
  return <div ref={mountRef} className="magic-rings-container" aria-hidden="true" />;
}
