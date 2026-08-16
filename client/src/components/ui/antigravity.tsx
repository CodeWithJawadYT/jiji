/* JawyXDevs style: pure-black cinematic field with an icy-blue antigravity particle ring behind the hero typography. */
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import "./antigravity.css";

type Particle = { t: number; speed: number; mx: number; my: number; mz: number; cx: number; cy: number; cz: number; randomRadiusOffset: number };

function AntigravityInner({ count = 300, magnetRadius = 6, ringRadius = 7, waveSpeed = .4, waveAmplitude = 1, particleSize = 1.5, lerpSpeed = .05, color = "#dff6ff", autoAnimate = true, particleVariance = 1, rotationSpeed = .03, depthFactor = 1, pulseSpeed = 3, particleShape = "capsule", fieldStrength = 10 }: { count?: number; magnetRadius?: number; ringRadius?: number; waveSpeed?: number; waveAmplitude?: number; particleSize?: number; lerpSpeed?: number; color?: string; autoAnimate?: boolean; particleVariance?: number; rotationSpeed?: number; depthFactor?: number; pulseSpeed?: number; particleShape?: "capsule" | "sphere" | "box" | "tetrahedron"; fieldStrength?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });
  const particles = useMemo<Particle[]>(() => {
    const width = viewport.width || 100; const height = viewport.height || 100;
    return Array.from({ length: count }, () => { const x = (Math.random() - .5) * width; const y = (Math.random() - .5) * height; const z = (Math.random() - .5) * 20; return { t: Math.random() * 100, speed: .01 + Math.random() / 200, mx: x, my: y, mz: z, cx: x, cy: y, cz: z, randomRadiusOffset: (Math.random() - .5) * 2 }; });
  }, [count, viewport.width, viewport.height]);
  useFrame((state) => {
    const mesh = meshRef.current; if (!mesh) return;
    const { viewport: v, pointer: m } = state;
    const mouseDist = Math.hypot(m.x - lastMousePos.current.x, m.y - lastMousePos.current.y);
    if (mouseDist > .001) { lastMouseMoveTime.current = Date.now(); lastMousePos.current = { x: m.x, y: m.y }; }
    let destX = (m.x * v.width) / 2; let destY = (m.y * v.height) / 2;
    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) { const time = state.clock.getElapsedTime(); destX = Math.sin(time * .5) * (v.width / 4); destY = Math.cos(time) * (v.height / 4); }
    virtualMouse.current.x += (destX - virtualMouse.current.x) * .05; virtualMouse.current.y += (destY - virtualMouse.current.y) * .05;
    const targetX = virtualMouse.current.x; const targetY = virtualMouse.current.y; const globalRotation = state.clock.getElapsedTime() * rotationSpeed;
    particles.forEach((particle, i) => {
      particle.t += particle.speed / 2; const projectionFactor = 1 - particle.cz / 50; const projectedTargetX = targetX * projectionFactor; const projectedTargetY = targetY * projectionFactor;
      const dx = particle.mx - projectedTargetX; const dy = particle.my - projectedTargetY; const dist = Math.hypot(dx, dy);
      const target = { x: particle.mx, y: particle.my, z: particle.mz * depthFactor };
      if (dist < magnetRadius) { const angle = Math.atan2(dy, dx) + globalRotation; const wave = Math.sin(particle.t * waveSpeed + angle) * (.5 * waveAmplitude); const deviation = particle.randomRadiusOffset * (5 / (fieldStrength + .1)); const radius = ringRadius + wave + deviation; target.x = projectedTargetX + radius * Math.cos(angle); target.y = projectedTargetY + radius * Math.sin(angle); target.z = particle.mz * depthFactor + Math.sin(particle.t) * waveAmplitude * depthFactor; }
      particle.cx += (target.x - particle.cx) * lerpSpeed; particle.cy += (target.y - particle.cy) * lerpSpeed; particle.cz += (target.z - particle.cz) * lerpSpeed;
      dummy.position.set(particle.cx, particle.cy, particle.cz); dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz); dummy.rotateX(Math.PI / 2);
      const currentDist = Math.hypot(particle.cx - projectedTargetX, particle.cy - projectedTargetY); const distFromRing = Math.abs(currentDist - ringRadius); const scaleFactor = Math.max(0, Math.min(1, 1 - distFromRing / 10)); const finalScale = scaleFactor * (.8 + Math.sin(particle.t * pulseSpeed) * .2 * particleVariance) * particleSize;
      dummy.scale.set(finalScale, finalScale, finalScale); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
    {particleShape === "capsule" && <capsuleGeometry args={[.1, .4, 4, 8]} />}
    {particleShape === "sphere" && <sphereGeometry args={[.2, 12, 12]} />}
    {particleShape === "box" && <boxGeometry args={[.3, .3, .3]} />}
    {particleShape === "tetrahedron" && <tetrahedronGeometry args={[.3]} />}
    <meshBasicMaterial color={color} transparent opacity={.42} />
  </instancedMesh>;
}

export function Antigravity(props: Parameters<typeof AntigravityInner>[0]) {
  return <div className="antigravity-layer" aria-hidden="true"><Canvas camera={{ position: [0, 0, 50], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}><AntigravityInner {...props} /></Canvas></div>;
}
