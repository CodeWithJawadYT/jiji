/* JawyXDevs style: cinematic industrial futurism — the WebGL layer is a restrained signal field of cobalt light, metallic forms, and atmospheric depth. */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

gsap.registerPlugin(ScrollTrigger);

const STAR_VERTEX = `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uTime;
  uniform float uDepth;
  void main() {
    vColor = aColor;
    vec3 positionCopy = position;
    float angle = uTime * 0.045 * (1.0 - uDepth * 0.22);
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    positionCopy.xy = rotation * positionCopy.xy;
    vec4 mvPosition = modelViewMatrix * vec4(positionCopy, 1.0);
    gl_PointSize = aSize * (280.0 / max(1.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const STAR_FRAGMENT = `
  varying vec3 vColor;
  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.05, 0.5, distanceToCenter);
    gl_FragColor = vec4(vColor, alpha * 0.92);
  }
`;

export function JawyxWebGLHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    const home = document.getElementById("home");
    if (!mount || !canvas || !home) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.8);
    const refs = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(52, 1, 0.1, 1800),
      renderer: null as THREE.WebGLRenderer | null,
      composer: null as EffectComposer | null,
      stars: [] as THREE.Points[],
      forms: [] as THREE.Mesh[],
      mountains: [] as THREE.Mesh[],
      atmosphere: null as THREE.Mesh | null,
      raf: 0,
      scrollTrigger: null as ScrollTrigger | null,
      disposed: false,
    };

    refs.scene.fog = new THREE.FogExp2(0x03070c, mobile ? 0.0018 : 0.00095);
    refs.camera.position.set(0, 6, mobile ? 31 : 26);

    try {
      refs.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: "high-performance" });
    } catch {
      mount.classList.add("webgl-unavailable");
      return;
    }
    refs.renderer.setPixelRatio(pixelRatio);
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 1.05;
    refs.renderer.setClearColor(0x000000, 0);
    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
    if (!mobile && !reducedMotion) refs.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.48, 0.55, 0.72));

    const makeStars = (depth: number, count: number, spread: number) => {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      for (let i = 0; i < count; i += 1) {
        const radius = spread * (0.55 + Math.random() * 0.45);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
        positions[i * 3 + 2] = radius * Math.cos(phi) - 210;
        const blue = Math.random() > 0.72;
        const color = new THREE.Color(blue ? 0x159dff : 0xdceaf5);
        colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
        sizes[i] = 0.55 + Math.random() * (blue ? 1.7 : 1.1);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      const material = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uDepth: { value: depth } }, vertexShader: STAR_VERTEX, fragmentShader: STAR_FRAGMENT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const stars = new THREE.Points(geometry, material);
      refs.scene.add(stars); refs.stars.push(stars);
    };
    makeStars(0, mobile ? 500 : 1500, 460); makeStars(1, mobile ? 320 : 900, 640); makeStars(2, mobile ? 180 : 500, 830);

    const nebulaGeometry = new THREE.PlaneGeometry(1200, 650, 32, 18);
    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColorA: { value: new THREE.Color(0x03182c) }, uColorB: { value: new THREE.Color(0x0b6fbd) } },
      vertexShader: `varying vec2 vUv; uniform float uTime; void main(){vUv=uv; vec3 p=position; p.z += sin(p.x*.018+uTime*.5)*6.0*cos(p.y*.02+uTime*.28); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
      fragmentShader: `varying vec2 vUv; uniform vec3 uColorA; uniform vec3 uColorB; uniform float uTime; void main(){float wave=sin(vUv.x*9.0+uTime*.45)*cos(vUv.y*7.0-uTime*.25)*.5+.5; float edge=1.0-smoothstep(.08,.72,length(vUv-vec2(.5))); vec3 color=mix(uColorA,uColorB,wave); gl_FragColor=vec4(color,edge*.13);}`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial); nebula.position.set(80, 30, -230); nebula.rotation.y = -0.18; refs.scene.add(nebula);

    const atmosphereGeometry = new THREE.SphereGeometry(mobile ? 78 : 104, mobile ? 20 : 32, mobile ? 14 : 24);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec3 vNormal; uniform float uTime; void main(){float edge=pow(0.68-dot(vNormal,vec3(0.,0.,1.)),2.4); float pulse=.88+sin(uTime*1.4)*.08; vec3 color=vec3(.015,.16,.42)*edge*pulse; gl_FragColor=vec4(color,edge*.18);}`,
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    refs.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial); refs.atmosphere.position.set(172, -22, -340); refs.scene.add(refs.atmosphere);

    const mountainLayers = [
      { z: -82, y: -34, scale: 1.02, color: 0x07111d, opacity: 0.92 },
      { z: -126, y: -30, scale: 0.9, color: 0x0a2034, opacity: 0.72 },
      { z: -176, y: -26, scale: 0.78, color: 0x0b3859, opacity: 0.48 },
    ];
    mountainLayers.forEach((layer, layerIndex) => {
      const points: THREE.Vector2[] = [];
      const segments = mobile ? 26 : 46;
      for (let i = 0; i <= segments; i += 1) {
        const x = (i / segments - 0.5) * 620;
        const y = Math.sin(i * 0.48 + layerIndex) * (24 + layerIndex * 10) + Math.sin(i * 0.18) * 22 - 45;
        points.push(new THREE.Vector2(x, y));
      }
      points.push(new THREE.Vector2(900, -180), new THREE.Vector2(-900, -180));
      const geometry = new THREE.ShapeGeometry(new THREE.Shape(points));
      const material = new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide, depthWrite: false });
      const mountain = new THREE.Mesh(geometry, material);
      mountain.position.set(0, layer.y, layer.z); mountain.scale.setScalar(layer.scale); mountain.userData.baseZ = layer.z; mountain.userData.layerIndex = layerIndex;
      refs.scene.add(mountain); refs.mountains.push(mountain);
    });

    const addForm = (geometry: THREE.BufferGeometry, position: [number, number, number], rotation: [number, number, number], scale: number, blue = false) => {
      const material = new THREE.MeshStandardMaterial({ color: blue ? 0x0b74c7 : 0xc3d0da, metalness: 0.82, roughness: blue ? 0.24 : 0.34, emissive: blue ? 0x03294e : 0x1a2b38, emissiveIntensity: blue ? 0.38 : 0.18, flatShading: true });
      const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.scale.setScalar(scale); refs.scene.add(mesh); refs.forms.push(mesh);
    };

    const light = new THREE.PointLight(0x159dff, 4.5, 420); light.position.set(145, 55, -85); refs.scene.add(light);
    const fill = new THREE.PointLight(0xc6d9e8, 2.2, 360); fill.position.set(-140, 70, -90); refs.scene.add(fill);
    const ambient = new THREE.AmbientLight(0x5b7185, 1.15); refs.scene.add(ambient);

    const pointer = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => { if (mobile) return; pointer.x = (event.clientX / window.innerWidth - 0.5) * 2; pointer.y = (event.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener("pointermove", onPointer, { passive: true });

    if (!reducedMotion) {
      refs.scrollTrigger = ScrollTrigger.create({ trigger: home, start: "top top", end: "bottom top", scrub: 1.2, onUpdate: (self) => { refs.camera.position.y = THREE.MathUtils.lerp(6, -18, self.progress); refs.camera.position.z = THREE.MathUtils.lerp(mobile ? 31 : 26, mobile ? 47 : 58, self.progress); refs.camera.rotation.z = self.progress * 0.035; setScrollProgress(self.progress); setCurrentSection(Math.min(6, Math.max(1, Math.floor(self.progress * 6) + 1))); } });
    }

    const resize = () => { if (!refs.renderer || !refs.composer) return; const width = mount.clientWidth || window.innerWidth; const height = mount.clientHeight || window.innerHeight; refs.camera.aspect = width / height; refs.camera.updateProjectionMatrix(); refs.renderer.setSize(width, height, false); refs.composer.setSize(width, height); };
    resize(); window.addEventListener("resize", resize);
    const animate = (time: number) => {
      if (refs.disposed) return;
      const seconds = time * 0.001;
      refs.stars.forEach((star, index) => { (star.material as THREE.ShaderMaterial).uniforms.uTime.value = seconds; star.rotation.z = seconds * 0.008 * (index + 1); });
      (nebula.material as THREE.ShaderMaterial).uniforms.uTime.value = seconds;
      if (refs.atmosphere) (refs.atmosphere.material as THREE.ShaderMaterial).uniforms.uTime.value = seconds;
      refs.forms.forEach((form, index) => { form.rotation.x += 0.0015 * (index + 1); form.rotation.y += 0.002 * (index + 1); form.position.y += Math.sin(seconds * 0.42 + index) * 0.012; });
      refs.mountains.forEach((mountain, index) => { mountain.position.x = Math.sin(seconds * 0.11 + index) * (2 + index * 1.5); mountain.position.z = (mountain.userData.baseZ as number) + Math.sin(seconds * 0.08 + index) * 2; });
      if (!mobile) { refs.camera.position.x += (pointer.x * 3.5 - refs.camera.position.x) * 0.025; refs.camera.rotation.x += (pointer.y * -0.018 - refs.camera.rotation.x) * 0.025; }
      refs.composer?.render(); refs.raf = requestAnimationFrame(animate);
    };
    refs.raf = requestAnimationFrame(animate);

    return () => { refs.disposed = true; cancelAnimationFrame(refs.raf); refs.scrollTrigger?.kill(); window.removeEventListener("pointermove", onPointer); window.removeEventListener("resize", resize); refs.stars.forEach((star) => { star.geometry.dispose(); (star.material as THREE.Material).dispose(); }); refs.forms.forEach((form) => { form.geometry.dispose(); (form.material as THREE.Material).dispose(); }); refs.mountains.forEach((mountain) => { mountain.geometry.dispose(); (mountain.material as THREE.Material).dispose(); }); nebulaGeometry.dispose(); nebulaMaterial.dispose(); atmosphereGeometry.dispose(); atmosphereMaterial.dispose(); refs.renderer?.dispose(); refs.composer?.dispose(); };
  }, []);

  return <div ref={mountRef} className="jawyx-webgl" aria-hidden="true"><canvas ref={canvasRef} /><div className="webgl-progress"><span>SCROLL</span><i><b style={{ width: `${scrollProgress * 100}%` }} /></i><strong>{String(currentSection).padStart(2, "0")} / 06</strong></div></div>;
}
