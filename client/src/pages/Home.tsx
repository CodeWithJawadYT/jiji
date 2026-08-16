/* JawyXDevs style: cinematic industrial futurism — dark architectural field, metallic type, signal blue rail, purposeful motion. */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, MoveRight, X } from "lucide-react";
const JawyxWebGLHero = lazy(() => import("@/components/ui/jawyx-webgl-hero").then((module) => ({ default: module.JawyxWebGLHero })));
import { PixelTrail } from "@/components/ui/pixel-trail";
import { Antigravity } from "@/components/ui/antigravity";
import Masonry from "@/components/ui/Masonry";
import WebThreads from "@/components/ui/WebThreads";

const logo = "/manus-storage/Jawy.devs_7c146be2.jpg";
const heroArt = "/manus-storage/jawyx-hero-nebula_f8cd2980.png";
const geometryArt = "/manus-storage/jawyx-project-geometry_03ed5bcd.png";
const interfaceArt = "/manus-storage/jawyx-project-interface_5014241e.png";
const companionMark = "/manus-storage/jawyx-companion-mark_8500c389.png";

const projects = [
  { number: "01", name: "Barbershop KWC", category: "Service experience", url: "https://barbershopkwc.com/", art: geometryArt, note: "A focused digital front door for a local service brand." },
  { number: "02", name: "Tigar", category: "Brand platform", url: "https://tigar.ca/", art: interfaceArt, note: "A sharp, responsive presence built around clear movement." },
  { number: "03", name: "Cambrian Custom Painting", category: "Business website", url: "https://cambriancustompainting.com/", art: geometryArt, note: "A conversion-minded site for a craft-led business." },
  { number: "04", name: "Snow Bros PTBO", category: "Local business", url: "https://snowbrosptbo.ca/", art: interfaceArt, note: "A fast, approachable web experience for seasonal demand." },
  { number: "05", name: "Fade District Cuts", category: "Service experience", url: "https://www.fadedistrictcuts.com/", art: geometryArt, note: "A modern service presence with a confident visual rhythm." },
  { number: "06", name: "VFit Legacy", category: "Digital experience", url: "https://www.vfitlegacy.com/", art: interfaceArt, note: "A platform for communicating a focused, active brand." },
];

const masonryItems = projects.map((project, index) => ({ ...project, id: project.number, img: project.art, height: [520, 380, 470, 340, 430, 360][index] }));

const services = [
  ["01", "Custom website development", "High-performance custom websites built around the way your business actually works."],
  ["02", "3D & interactive experiences", "Immersive interfaces using WebGL, motion, and depth without losing clarity."],
  ["03", "UI/UX engineering", "Modern interfaces designed for usability, confidence, and conversion."],
  ["04", "SEO / AEO / GEO", "Semantic structure and machine-readable architecture for people, search engines, and answer engines."],
  ["05", "Performance optimization", "Fast loading, responsive rendering, and a disciplined Core Web Vitals mindset."],
  ["06", "AI-ready web experiences", "Content and code structures prepared for the next generation of discovery."],
];

const plans = [
  { name: "Starter", price: "$149", description: "For simple professional websites.", features: ["Responsive website", "Modern UI", "Essential pages", "Basic SEO", "Performance optimization", "Contact integration"] },
  { name: "Professional", price: "$299", description: "For businesses that need a stronger digital presence.", features: ["Custom responsive website", "Premium UI/UX", "Advanced animations", "SEO optimization", "AEO-ready structure", "Performance optimization", "Multiple pages", "Conversion-focused sections"], featured: true },
  { name: "Elite", price: "$499", description: "For premium businesses that want an advanced digital experience.", features: ["Custom premium website", "Advanced 3D interactions", "Scroll-based animations", "Advanced GSAP animations", "Advanced SEO", "AEO optimization", "GEO / AI-search-ready architecture", "Performance optimization", "Premium UI/UX", "Advanced project presentation"] },
];

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = Array.from({ length: window.innerWidth < 700 ? 55 : 125 }, (_, i) => ({ x: Math.random(), y: Math.random(), z: Math.random(), s: 0.2 + Math.random() * 1.3, tone: i % 5 === 0 }));
    const resize = () => { canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2); canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2); canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`; context.setTransform(Math.min(window.devicePixelRatio, 2), 0, 0, Math.min(window.devicePixelRatio, 2), 0, 0); };
    const draw = () => {
      frame += reduced ? 0 : 0.0025;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      points.forEach((p) => { const drift = reduced ? 0 : Math.sin(frame + p.z * 9) * 14; const x = p.x * window.innerWidth + drift; const y = (p.y * window.innerHeight + frame * (p.z + 0.2) * 40) % window.innerHeight; const alpha = 0.18 + p.z * 0.5; context.fillStyle = p.tone ? `rgba(21,157,255,${alpha})` : `rgba(220,231,242,${alpha})`; context.beginPath(); context.arc(x, y, p.s * (p.z + 0.5), 0, Math.PI * 2); context.fill(); });
      raf = requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener("resize", resize); return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const projectStageRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => {
    const stage = projectStageRef.current;
    if (!stage) return;
    const move = (event: PointerEvent) => { const rect = stage.getBoundingClientRect(); const x = ((event.clientX - rect.left) / rect.width - .5) * 2; const y = ((event.clientY - rect.top) / rect.height - .5) * 2; stage.style.setProperty("--tilt-x", `${x * 2.8}deg`); stage.style.setProperty("--tilt-y", `${y * -2.2}deg`); stage.style.setProperty("--art-x", `${x * -1.2}%`); stage.style.setProperty("--art-y", `${y * -1.2}%`); };
    const leave = () => { stage.style.setProperty("--tilt-x", "0deg"); stage.style.setProperty("--tilt-y", "0deg"); stage.style.setProperty("--art-x", "0%"); stage.style.setProperty("--art-y", "0%"); };
    stage.addEventListener("pointermove", move); stage.addEventListener("pointerleave", leave); return () => { stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave); };
  }, [activeProject]);
  const jump = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return <div className="site-shell">
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <button className="brand-lockup" onClick={() => jump("home")} aria-label="Back to top"><img src={logo} alt="JawyXDevs logo" /><span>JAWYXDEVS<span className="brand-dot">/</span></span></button>
      <nav className="desktop-nav" aria-label="Primary navigation">{[["home", "Home"], ["work", "Work"], ["services", "Services"], ["pricing", "Pricing"], ["about", "About"], ["contact", "Contact"]].map(([id, label]) => <button key={id} onClick={() => jump(id)}>{label}</button>)}</nav>
      <button className="nav-cta" onClick={() => jump("contact")}>Start a project <ArrowUpRight size={15} /></button>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    {menuOpen && <div className="mobile-menu">{[["home", "Home"], ["work", "Work"], ["services", "Services"], ["pricing", "Pricing"], ["about", "About"], ["contact", "Contact"]].map(([id, label], index) => <button key={id} style={{ animationDelay: `${index * 45}ms` }} onClick={() => jump(id)}><span>0{index + 1}</span>{label}<ArrowUpRight size={18} /></button>)}</div>}

    <main>
      <section id="home" className="hero" style={{ backgroundColor: "#000000" }}>
        <Suspense fallback={null}><JawyxWebGLHero /></Suspense><WebThreads color1="#5227FF" color2="#FF9FFC" color3="#FFFFFF" speed={0.2} threadCount={6} frequency={5} spread={0.18} taper={1} position={0.56} fanMode="center" glow={0.02} falloff={0.6} thickness={1.1} brightness={0.72} opacity={0.92} mirror grain grainIntensity={0.035} mouseInteraction mouseStrength={0.3} /><Antigravity count={190} magnetRadius={6} ringRadius={7} waveSpeed={0.4} waveAmplitude={1} particleSize={0.9} lerpSpeed={0.05} color="#ffffff" autoAnimate particleVariance={0.85} rotationSpeed={0.03} depthFactor={1} pulseSpeed={3} particleShape="capsule" fieldStrength={10} /><PixelTrail gridSize={46} trailSize={0.11} maxAge={340} interpolate={5} color="#5227FF" />
      </section>

      <section id="about" className="manifesto section-dark"><div className="section-rail"><span>02</span><span>Manifesto</span></div><div className="manifesto-inner reveal-on-scroll"><p className="eyebrow">The JawyXDevs approach</p><h2>We don't just build websites.<br /><span>We build digital experiences.</span></h2><div className="manifesto-bottom"><p className="large-copy">The web is where your brand proves what it is. We combine modern frontend engineering, intentional interaction, and search-ready architecture to make that proof impossible to miss.</p><div className="capability-list"><span>High-performance development</span><span>Responsive interfaces</span><span>Interactive 3D experiences</span><span>Conversion-focused UX</span></div></div></div></section>

      <section id="services" className="services section-dark"><div className="section-rail"><span>03</span><span>Capabilities</span></div><div className="services-inner reveal-on-scroll"><div className="section-heading"><p className="eyebrow">What we engineer</p><h2>Built for the<br /><span>next interaction.</span></h2><p>From the first line of code to the last pixel on screen, every layer has a job.</p></div><div className="service-list">{services.map(([number, title, desc]) => <article className="service-row" key={number}><span className="service-number">{number}</span><h3>{title}</h3><p>{desc}</p><ArrowUpRight className="service-arrow" size={21} /></article>)}</div></div></section>

      <section id="work" className="work-section"><div className="section-rail"><span>04</span><span>Selected work</span></div><div className="work-inner"><div className="section-heading work-heading"><p className="eyebrow">A selection of live work</p><h2>Work with<br /><span>signal.</span></h2><p>Real projects. Real links. No invented numbers.</p></div><div className="featured-project reveal-on-scroll"><a ref={projectStageRef} href={projects[activeProject].url} target="_blank" rel="noreferrer" className="project-stage"><img className="selected-logo-poster" src={companionMark} alt={`${projects[activeProject].name} selected website logo`} /><div className="stage-overlay" /><span className="stage-index">{projects[activeProject].number} / 06</span><span className="visit-pill">Visit website <ArrowUpRight size={15} /></span><div className="project-title"><p>{projects[activeProject].category}</p><h3>{projects[activeProject].name}</h3></div></a><div className="project-caption"><p>{projects[activeProject].note}</p><span>Open live site ↗</span></div></div><div className="masonry-intro"><span>Scroll / explore the archive</span><span>Six live builds / open each tile</span></div><Masonry items={masonryItems} ease="power3.out" duration={0.7} stagger={0.07} animateFrom="bottom" scaleOnHover hoverScale={0.96} blurToFocus /></div></section>

      <section id="pricing" className="pricing section-dark"><div className="section-rail"><span>05</span><span>Engagement</span></div><div className="pricing-inner"><div className="section-heading"><p className="eyebrow">Choose your altitude</p><h2>Clear scope.<br /><span>Strong signal.</span></h2><p>Simple packages for shipping a sharper digital presence.</p></div><div className="price-grid reveal-on-scroll">{plans.map(plan => <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.name}>{plan.featured && <div className="recommended">Recommended</div>}<p className="plan-label">{plan.name}</p><div className="price">{plan.price}</div><p className="plan-description">{plan.description}</p><div className="feature-stack">{plan.features.map(feature => <span key={feature}><i />{feature}</span>)}</div><button className="price-button" onClick={() => jump("contact")}>Choose {plan.name} <ArrowUpRight size={15} /></button></article>)}</div><p className="custom-note">Need something custom? <button onClick={() => jump("contact")}>Let's build it <ArrowUpRight size={14} /></button></p></div></section>

      <section className="principles"><div className="principles-orb" aria-hidden="true" /><div className="principles-inner reveal-on-scroll"><p className="eyebrow">Why JawyXDevs</p><h2>The standard is<br /><span>how it feels.</span></h2><div className="principle-grid"><div><span>01</span><h3>Performance first</h3><p>Fast, optimized experiences that respect attention.</p></div><div><span>02</span><h3>Built for every screen</h3><p>Responsive from the first breakpoint to the widest display.</p></div><div><span>03</span><h3>Search ready</h3><p>SEO, AEO, and GEO-aware architecture from day one.</p></div><div><span>04</span><h3>Interactive by design</h3><p>Motion that communicates, not distracts.</p></div></div></div></section>

      <section id="contact" className="contact-section"><div className="contact-inner reveal-on-scroll"><div><p className="eyebrow">06 / Start a project</p><h2>Make the first<br /><em>screen</em> do more.</h2></div><div className="contact-side"><p>Tell us what you’re building, what needs to move, and where you want to go next.</p><a href="mailto:jawyxdevs@gmail.com" className="contact-link">jawyxdevs@gmail.com <ArrowUpRight size={20} /></a><a href="tel:03151082775" className="contact-link contact-phone">03151082775 <ArrowUpRight size={20} /></a><p className="contact-note">Available for select projects worldwide.</p></div></div></section>
    </main>
    <footer><div className="footer-brand"><img src={logo} alt="JawyXDevs" /><p>Elite Web Engineering<br />& Digital Experiences.</p></div><div className="footer-links"><button onClick={() => jump("work")}>Work</button><button onClick={() => jump("services")}>Services</button><button onClick={() => jump("contact")}>Contact</button></div><div className="footer-end"><span>© {new Date().getFullYear()} JawyXDevs</span><span>Built with intent.</span></div></footer>
  </div>;
}
