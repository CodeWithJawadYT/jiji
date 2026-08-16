/* JawyXDevs style: pure-black cinematic field with a restrained icy-blue cursor trail. */
/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { shaderMaterial, useTrailTexture } from "@react-three/drei";
import * as THREE from "three";
import "./pixel-trail.css";

const GooeyFilter = ({ id = "pixel-goo-filter", strength = 2 }: { id?: string; strength?: number }) => (
  <svg className="pixel-goo-filter-container" aria-hidden="true">
    <defs>
      <filter id={id}>
        <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

const DotMaterial = shaderMaterial(
  { resolution: new THREE.Vector2(), mouseTrail: null, gridSize: 100, pixelColor: new THREE.Color("#dff6ff") },
  `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  `uniform vec2 resolution; uniform sampler2D mouseTrail; uniform float gridSize; uniform vec3 pixelColor;
   vec2 coverUv(vec2 uv) { vec2 s = resolution.xy / max(resolution.x, resolution.y); return clamp((uv - 0.5) * s + 0.5, 0.0, 1.0); }
   void main() { vec2 uv = coverUv(gl_FragCoord.xy / resolution); vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize; float trail = texture2D(mouseTrail, gridUvCenter).r; gl_FragColor = vec4(pixelColor, trail); }`
);

function Scene({ gridSize, trailSize, maxAge, interpolate, pixelColor }: { gridSize: number; trailSize: number; maxAge: number; interpolate: number; pixelColor: string }) {
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const dotMaterial = useMemo(() => new DotMaterial(), []);
  dotMaterial.uniforms.pixelColor.value = new THREE.Color(pixelColor);
  const [trail, onMove] = useTrailTexture({ size: 512, radius: trailSize, maxAge, interpolate, ease: (x: number) => x });
  if (trail) { trail.minFilter = THREE.NearestFilter; trail.magFilter = THREE.NearestFilter; trail.wrapS = THREE.ClampToEdgeWrapping; trail.wrapT = THREE.ClampToEdgeWrapping; }
  const scale = Math.max(viewport.width, viewport.height) / 2;
  return <mesh scale={[scale, scale, 1]} onPointerMove={onMove}><planeGeometry args={[2, 2]} /><primitive object={dotMaterial} gridSize={gridSize} resolution={[size.width * viewport.dpr, size.height * viewport.dpr]} mouseTrail={trail} /></mesh>;
}

export function PixelTrail({ gridSize = 46, trailSize = 0.11, maxAge = 340, interpolate = 5, color = "#dff6ff", gooeyFilter = { id: "jawyx-pixel-goo", strength: 2 } }: { gridSize?: number; trailSize?: number; maxAge?: number; interpolate?: number; color?: string; gooeyFilter?: { id: string; strength: number } | false }) {
  return <div className="pixel-trail-layer" aria-hidden="true">
    {gooeyFilter && <GooeyFilter id={gooeyFilter.id} strength={gooeyFilter.strength} />}
    <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance", alpha: true }} className="pixel-canvas" style={gooeyFilter ? { filter: `url(#${gooeyFilter.id})` } : undefined}>
      <Scene gridSize={gridSize} trailSize={trailSize} maxAge={maxAge} interpolate={interpolate} pixelColor={color} />
    </Canvas>
  </div>;
}
