/* JawyXDevs style: cinematic futuristic mountain journey — the camera starts at the summit and physically descends through a black, metallic, electric-blue digital terrain. */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ArrowUpRight, ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const logo = "/manus-storage/Jawy.devs_7c146be2.jpg";
const title = "CRAFTING HIGH-PERFORMANCE DIGITAL EXPERIENCES THAT SCALE BRANDS WORLDWIDE.";

const starVertex = `attribute float size; attribute vec3 color; varying vec3 vColor; uniform float time; uniform float depth; void main(){ vColor=color; vec3 p=position; float a=time*.04*(1.-depth*.22); mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a)); p.xy=r*p.xy; p.z=mod(p.z+time*(18.+depth*13.)+1500.,3000.)-1500.; vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=size*(340./max(1.,-mv.z)); gl_Position=projectionMatrix*mv; }`;
const starFragment = `varying vec3 vColor; void main(){float d=length(gl_PointCoord-vec2(.5)); if(d>.5) discard; gl_FragColor=vec4(vColor,1.-smoothstep(.04,.5,d));}`;

type JourneyRefs = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  stars: THREE.Points[];
  terrain: THREE.Mesh[];
  structures: THREE.Object3D[];
  snow: THREE.Points | null;
  atmosphere: THREE.Mesh | null;
  nebula: THREE.Mesh | null;
  path: THREE.CatmullRomCurve3;
  target: THREE.Vector3;
  lookTarget: THREE.Vector3;
  scrollTrigger: ScrollTrigger | null;
  raf: number;
  disposed: boolean;
};

export function JawyxWebGLHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [section, setSection] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const endZ = mobile ? -2700 : -3800;
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 148, 360),
      new THREE.Vector3(180, 120, -120),
      new THREE.Vector3(-220, 76, -720),
      new THREE.Vector3(260, 18, -1420),
      new THREE.Vector3(-190, -56, -2220),
      new THREE.Vector3(155, -108, -2940),
      new THREE.Vector3(0, -138, endZ),
    ], false, "catmullrom", 0.55);
    const refs: JourneyRefs = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(70, 1, 0.1, 4200),
      renderer: null,
      composer: null,
      stars: [],
      terrain: [],
      structures: [],
      snow: null,
      atmosphere: null,
      nebula: null,
      path,
      target: path.getPointAt(0),
      lookTarget: path.getPointAt(0.065),
      scrollTrigger: null,
      raf: 0,
      disposed: false,
    };
    refs.scene.fog = new THREE.FogExp2(0xc7dce8, mobile ? 0.0004 : 0.00018);
    refs.camera.position.copy(refs.target);

    try {
      refs.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: "high-performance" });
    } catch {
      mount.classList.add("webgl-unavailable");
      return;
    }
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.8));
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.72;
    refs.renderer.setClearColor(0x000000, 0);
    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
    if (!mobile && !reducedMotion) refs.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.42, 0.78));

    const createStars = () => {
      const count = mobile ? 700 : 3000;
      for (let layer = 0; layer < 3; layer += 1) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i += 1) {
          const radius = 280 + Math.random() * 1200;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = radius * Math.cos(phi) - layer * 500;
          const color = new THREE.Color(Math.random() > 0.76 ? 0x159dff : 0xddebf4);
          colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
          sizes[i] = 0.55 + Math.random() * 1.5;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
        const material = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, depth: { value: layer } }, vertexShader: starVertex, fragmentShader: starFragment, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        const points = new THREE.Points(geometry, material);
        refs.scene.add(points); refs.stars.push(points);
      }
    };

    const createSnowfall = () => { const count = mobile ? 150 : 520; const positions = new Float32Array(count * 3); const sizes = new Float32Array(count); for (let i = 0; i < count; i += 1) { positions[i * 3] = (Math.random() - .5) * 980; positions[i * 3 + 1] = Math.random() * 360 - 80; positions[i * 3 + 2] = 260 - Math.random() * 2900; sizes[i] = .8 + Math.random() * 1.7; } const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1)); const material = new THREE.PointsMaterial({ color: 0xf5fbff, size: mobile ? 1.8 : 2.4, transparent: true, opacity: .62, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }); refs.snow = new THREE.Points(geometry, material); refs.scene.add(refs.snow); };
    const createTerrain = () => {
      const width = mobile ? 1500 : 2400;
      const depth = mobile ? 2700 : 4100;
      const xSegments = mobile ? 60 : 112;
      const zSegments = mobile ? 118 : 226;
      const cols = xSegments + 1;
      const rows = zSegments + 1;
      const positions = new Float32Array(cols * rows * 3);
      const colors = new Float32Array(cols * rows * 3);
      const indices: number[] = [];
      const smooth = (value: number) => value * value * (3 - 2 * value);
      const hash = (x: number, z: number) => { const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return n - Math.floor(n); };
      const noise = (x: number, z: number) => { const x0 = Math.floor(x); const z0 = Math.floor(z); const tx = smooth(x - x0); const tz = smooth(z - z0); const a = hash(x0, z0); const b = hash(x0 + 1, z0); const c = hash(x0, z0 + 1); const d = hash(x0 + 1, z0 + 1); return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), tz) * 2 - 1; };
      const alpineHeight = (nx: number, nz: number) => { const macro = noise(nx * 1.8, nz * 1.05) * 34 + noise(nx * 3.8, nz * 2.2) * 18; const ridged = Math.pow(1 - Math.abs(noise(nx * 6.2 + 4, nz * 3.8 - 2)), 1.65) * 38; const crag = noise(nx * 16 + 8, nz * 11 - 4) * 11; const peakA = Math.exp(-((nx + .23) ** 2 * 15 + (nz - .08) ** 2 * 10)) * 260; const peakB = Math.exp(-((nx - .12) ** 2 * 24 + (nz + .18) ** 2 * 17)) * 205; const peakC = Math.exp(-((nx + .42) ** 2 * 30 + (nz + .34) ** 2 * 22)) * 170; const peakD = Math.exp(-((nx - .4) ** 2 * 36 + (nz - .36) ** 2 * 30)) * 130; const valley = -Math.exp(-((nx + .02) ** 2 * 18 + (nz - .26) ** 2 * 13)) * 96; const glacier = -Math.exp(-((nx - .2) ** 2 * 24 + (nz + .42) ** 2 * 18)) * 54; return -148 + macro + ridged + crag + peakA + peakB + peakC + peakD + valley + glacier; };
      const snowColor = new THREE.Color(0xf7fbfc); const blueSnow = new THREE.Color(0xc0d8e5); const rockColor = new THREE.Color(0x718b9a); const darkRock = new THREE.Color(0x344b59); const mixColor = (a: THREE.Color, b: THREE.Color, amount: number) => a.clone().lerp(b, amount);
      for (let z = 0; z <= zSegments; z += 1) { const nz = z / zSegments; for (let x = 0; x <= xSegments; x += 1) { const nx = x / xSegments - .5; const index = (z * cols + x) * 3; const height = alpineHeight(nx, nz); const left = alpineHeight(nx - .008, nz); const right = alpineHeight(nx + .008, nz); const front = alpineHeight(nx, nz - .008); const back = alpineHeight(nx, nz + .008); const slope = Math.min(1, Math.sqrt((right - left) ** 2 + (back - front) ** 2) / 30); const snowLine = -78 + noise(nx * 3.4, nz * 2.2) * 14; const snowAmount = THREE.MathUtils.clamp((height - snowLine) / 112 + (1 - slope) * .38 + noise(nx * 8, nz * 9) * .12, 0, 1); const base = mixColor(darkRock, rockColor, THREE.MathUtils.clamp(height / 95 + .35, 0, 1)); const shade = mixColor(base, blueSnow, snowAmount * .68); const finalColor = mixColor(shade, snowColor, snowAmount * snowAmount * .72); positions[index] = nx * width; positions[index + 1] = height; positions[index + 2] = 360 - nz * depth; colors[index] = finalColor.r; colors[index + 1] = finalColor.g; colors[index + 2] = finalColor.b; } }
      for (let z = 0; z < zSegments; z += 1) for (let x = 0; x < xSegments; x += 1) { const a = z * cols + x; const b = a + 1; const c = a + cols; const d = c + 1; indices.push(a, c, b, b, c, d); }
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: .02, roughness: .96, clearcoat: .08, clearcoatRoughness: .84, flatShading: false, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material); refs.scene.add(mesh); refs.terrain.push(mesh);
      const createDistantLayer = (scale: number, zOffset: number, seed: number, colorA: number, colorB: number) => {
        const layerX = mobile ? 38 : 58;
        const layerZ = mobile ? 34 : 54;
        const layerCols = layerX + 1;
        const vertices = new Float32Array(layerCols * (layerZ + 1) * 3);
        const vertexColors = new Float32Array(layerCols * (layerZ + 1) * 3);
        const layerNoise = (x: number, z: number) => noise(x * scale + seed, z * scale * .72 - seed);
        const colorDark = new THREE.Color(colorA); const colorLight = new THREE.Color(colorB);
        for (let z = 0; z <= layerZ; z += 1) { const nz = z / layerZ; for (let x = 0; x <= layerX; x += 1) { const nx = x / layerX - .5; const index = (z * layerCols + x) * 3; const mountain = Math.max(0, 1 - Math.abs(nx * 1.7 + layerNoise(nx * 2, nz) * .34)); const sharp = Math.pow(mountain, 1.8) * (58 + Math.abs(layerNoise(nx * 7, nz * 4)) * 45); const folds = layerNoise(nx * 9, nz * 3) * 15; vertices[index] = nx * 2300 * scale; vertices[index + 1] = -98 + sharp + folds; vertices[index + 2] = 180 - nz * 1500 + zOffset; const snow = THREE.MathUtils.clamp((vertices[index + 1] + 55) / 90 + (1 - Math.min(1, Math.abs(folds) / 15)) * .22, 0, 1); const c = colorDark.clone().lerp(colorLight, snow); vertexColors[index] = c.r; vertexColors[index + 1] = c.g; vertexColors[index + 2] = c.b; } }
        const layerIndices: number[] = []; for (let z = 0; z < layerZ; z += 1) for (let x = 0; x < layerX; x += 1) { const a = z * layerCols + x; const b = a + 1; const c = a + layerCols; const d = c + 1; layerIndices.push(a, c, b, b, c, d); }
        const layerGeometry = new THREE.BufferGeometry(); layerGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3)); layerGeometry.setAttribute("color", new THREE.BufferAttribute(vertexColors, 3)); layerGeometry.setIndex(layerIndices); layerGeometry.computeVertexNormals();
        const layerMaterial = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .98, metalness: .02, clearcoat: .05, clearcoatRoughness: .9, transparent: true, opacity: .9, side: THREE.DoubleSide });
        const layerMesh = new THREE.Mesh(layerGeometry, layerMaterial); refs.scene.add(layerMesh); refs.terrain.push(layerMesh);
      };
      createDistantLayer(1.18, -320, 4, 0x4e6673, 0xb8d0dc); createDistantLayer(1.52, -760, 11, 0x334b59, 0x8caab9); createDistantLayer(1.92, -1250, 19, 0x203743, 0x5f7d8c); const alpineBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(16000, 9000, 1, 1), new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("/manus-storage/snowy-alpine-reference_5920fff4.jpg", texture => { texture.colorSpace = THREE.SRGBColorSpace; }), transparent: true, opacity: .82, depthWrite: false, depthTest: false, fog: true })); alpineBackdrop.position.set(0, 260, -2350); refs.scene.add(alpineBackdrop); refs.terrain.push(alpineBackdrop);
    };
    const createAtmosphere = () => {
      const geometry = new THREE.SphereGeometry(mobile ? 360 : 560, mobile ? 22 : 36, mobile ? 16 : 24);
      const material = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 } }, vertexShader: `varying vec3 n; void main(){n=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `varying vec3 n; uniform float time; void main(){float edge=pow(.72-dot(n,vec3(0.,0.,1.)),2.3); float pulse=.88+sin(time*1.5)*.08; vec3 c=vec3(.18,.5,.86)*edge*pulse; gl_FragColor=vec4(c,edge*.18);}`, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      refs.atmosphere = new THREE.Mesh(geometry, material); refs.atmosphere.position.set(210, 55, -720); refs.scene.add(refs.atmosphere);
      const nebulaGeometry = new THREE.PlaneGeometry(1600, 900, 32, 18);
      const nebulaMaterial = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, colorA: { value: new THREE.Color(0x02152a) }, colorB: { value: new THREE.Color(0x159dff) } }, vertexShader: `varying vec2 uv0; uniform float time; void main(){uv0=uv; vec3 p=position; p.z+=sin(p.x*.012+time*.4)*18.; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`, fragmentShader: `varying vec2 uv0; uniform vec3 colorA; uniform vec3 colorB; uniform float time; void main(){float f=sin(uv0.x*8.+time)*cos(uv0.y*7.-time*.4)*.5+.5; float e=1.-smoothstep(.05,.78,length(uv0-.5)); gl_FragColor=vec4(mix(colorA,colorB,f),e*.16);}`, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      refs.nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial); refs.nebula.position.set(120, 70, -680); refs.scene.add(refs.nebula);
    };

    const createStructures = () => {
      const items = mobile ? 8 : 15;
      for (let i = 0; i < items; i += 1) {
        const t = 0.08 + (i / items) * 0.82;
        const point = path.getPointAt(t);
        const group = new THREE.Group();
        const height = 18 + (i % 3) * 10;
        const material = new THREE.MeshStandardMaterial({ color: i % 2 ? 0x159dff : 0xb9c9d4, metalness: 0.85, roughness: 0.26, emissive: i % 2 ? 0x034a80 : 0x0b1b27, emissiveIntensity: i % 2 ? 1.3 : 0.42 });
        const tower = new THREE.Mesh(new THREE.BoxGeometry(3 + (i % 2) * 2, height, 3 + (i % 3)), material);
        tower.position.y = height / 2 - 62; tower.position.x = point.x + (i % 2 ? 110 : -130); tower.position.z = point.z - 35; group.add(tower);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(10 + (i % 3) * 4, 0.8, 8, 32), new THREE.MeshBasicMaterial({ color: 0x159dff, transparent: true, opacity: 0.75 }));
        ring.rotation.x = Math.PI / 2; ring.position.set(tower.position.x, tower.position.y + height / 2, tower.position.z); group.add(ring);
        refs.scene.add(group); refs.structures.push(group);
      }
    };

    createStars(); createSnowfall(); createTerrain(); createAtmosphere(); createStructures();
    const blue = new THREE.PointLight(0x8ed8ff, 3.8, 780); blue.position.set(180, 120, -320); refs.scene.add(blue);
    const silver = new THREE.PointLight(0xf4fbff, 3.2, 540); silver.position.set(-180, 160, 80); refs.scene.add(silver);
    refs.scene.add(new THREE.AmbientLight(0xb8d4e3, 1.2));

    const pointer = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => { if (!mobile) { pointer.x = (event.clientX / window.innerWidth - 0.5) * 2; pointer.y = (event.clientY / window.innerHeight - 0.5) * 2; } };
    window.addEventListener("pointermove", onPointer, { passive: true });
    const updateScroll = (value: number) => { const eased = value * value * (3 - 2 * value); refs.target.copy(refs.path.getPointAt(Math.min(0.999, eased))); refs.lookTarget.copy(refs.path.getPointAt(Math.min(0.999, eased + (mobile ? 0.055 : 0.08)))); refs.camera.fov = THREE.MathUtils.lerp(70, mobile ? 54 : 38, value); refs.camera.updateProjectionMatrix(); setProgress(value); setSection(value < 0.25 ? 1 : value < 0.45 ? 2 : value < 0.65 ? 3 : value < 0.9 ? 4 : 5); };
    refs.scrollTrigger = ScrollTrigger.create({ trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.05, onUpdate: self => updateScroll(self.progress) });
    updateScroll(0);

    const resize = () => { if (!refs.renderer || !refs.composer) return; const width = window.innerWidth; const height = window.innerHeight; refs.camera.aspect = width / height; refs.camera.updateProjectionMatrix(); refs.renderer.setSize(width, height, false); refs.composer.setSize(width, height); };
    resize(); window.addEventListener("resize", resize);
    const animate = (time: number) => {
      if (refs.disposed) return;
      const t = time * 0.001;
      refs.stars.forEach((star, index) => { (star.material as THREE.ShaderMaterial).uniforms.time.value = t; star.rotation.z = t * 0.006 * (index + 1); });
      refs.terrain.forEach((terrain, index) => { terrain.position.x = Math.sin(t * 0.08 + index) * (2 + index); terrain.rotation.z = Math.sin(t * 0.05 + index) * 0.002; }); if (refs.snow) { refs.snow.position.y = -((t * 7) % 250); refs.snow.position.x = Math.sin(t * .18) * 12; refs.snow.rotation.y = t * .015; }
      refs.structures.forEach((structure, index) => { structure.rotation.y = Math.sin(t * 0.3 + index) * 0.16; structure.position.y = Math.sin(t * 0.4 + index) * 1.5; });
      if (refs.atmosphere) { (refs.atmosphere.material as THREE.ShaderMaterial).uniforms.time.value = t; refs.atmosphere.position.x = 210 + Math.sin(t * 0.12) * 30 + pointer.x * 18; refs.atmosphere.position.y = 55 + Math.cos(t * 0.12) * 16 + pointer.y * 10; }
      if (refs.nebula) { (refs.nebula.material as THREE.ShaderMaterial).uniforms.time.value = t * 0.5; refs.nebula.position.x = 120 + Math.sin(t * 0.1) * 34 + pointer.x * 18; refs.nebula.position.y = 70 + Math.cos(t * 0.12) * 16 + pointer.y * 9; }
      refs.camera.position.lerp(new THREE.Vector3(refs.target.x + pointer.x * (mobile ? 0 : 8), refs.target.y + pointer.y * (mobile ? 0 : -4), refs.target.z), 0.075);
      refs.camera.lookAt(refs.lookTarget.x + pointer.x * 10, refs.lookTarget.y + pointer.y * 4, refs.lookTarget.z - 170);
      refs.composer?.render(); refs.raf = requestAnimationFrame(animate);
    };
    refs.raf = requestAnimationFrame(animate); setReady(true);

    return () => { refs.disposed = true; cancelAnimationFrame(refs.raf); refs.scrollTrigger?.kill(); window.removeEventListener("pointermove", onPointer); window.removeEventListener("resize", resize);       refs.stars.forEach(star => { star.geometry.dispose(); (star.material as THREE.Material).dispose(); }); if (refs.snow) { refs.snow.geometry.dispose(); (refs.snow.material as THREE.Material).dispose(); } refs.terrain.forEach(terrain => { terrain.geometry.dispose(); (terrain.material as THREE.Material).dispose(); }); refs.structures.forEach(structure => structure.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); } })); if (refs.atmosphere) { refs.atmosphere.geometry.dispose(); (refs.atmosphere.material as THREE.Material).dispose(); } if (refs.nebula) { refs.nebula.geometry.dispose(); (refs.nebula.material as THREE.Material).dispose(); } refs.renderer?.dispose(); refs.composer?.dispose(); };
  }, []);

  useEffect(() => { if (!ready) return; const context = gsap.context(() => { if (titleRef.current) gsap.from(titleRef.current.querySelectorAll(".mountain-title-char"), { y: 150, opacity: 0, duration: 1.25, stagger: 0.018, ease: "power4.out" }); if (subtitleRef.current) gsap.from(subtitleRef.current.querySelectorAll(".mountain-subtitle-line"), { y: 36, opacity: 0, duration: 0.85, stagger: 0.12, delay: 0.7, ease: "power3.out" }); if (progressRef.current) gsap.from(progressRef.current, { y: 30, opacity: 0, duration: 0.8, delay: 1 }); }); return () => context.revert(); }, [ready]);

  return <div ref={mountRef} className="mountain-journey"><canvas ref={canvasRef} className="mountain-canvas" aria-hidden="true" /><div className="mountain-side" style={{ opacity: Math.max(0, 1 - progress * 14) }}><img src={logo} alt="JawyXDevs logo" /><span>JAWYXDEVS // DIGITAL SYSTEMS</span></div><div className="mountain-copy" style={{ opacity: Math.max(0, 1 - progress * 14) }}><p className="mountain-kicker">ELITE WEB ENGINEERING STUDIO</p><h1 ref={titleRef}>{title.split(" ").map((word, index) => <span className={`mountain-title-word mountain-word-${index}`} key={`${word}-${index}`}>{word.split("").map((char, charIndex) => <span className="mountain-title-char" key={`${char}-${charIndex}`}>{char}</span>)}<span className="mountain-title-space">&nbsp;</span></span>)}</h1><div ref={subtitleRef} className="mountain-subtitle"><p className="mountain-subtitle-line">Stand at the summit of a digital world built to move.</p><p className="mountain-subtitle-line">Scroll to descend through the JawyXDevs experience.</p></div><div className="mountain-actions"><a className="button button-primary" href="#work">VIEW OUR WORK <ArrowUpRight size={16} /></a><a className="button button-ghost" href="#contact">START A PROJECT <ArrowUpRight size={16} /></a></div></div><div ref={progressRef} className="mountain-progress"><span>DESCEND</span><i><b style={{ width: `${progress * 100}%` }} /></i><strong>{String(section).padStart(2, "0")} / 05</strong><ChevronDown size={14} /></div><div className="mountain-meta">SUMMIT / 00 <span>TORONTO · WORLDWIDE</span></div></div>;
}
