/* JawyXDevs style: cinematic scroll expansion layered quietly behind the hero type. */
import { useEffect, useRef } from "react";
import "./scroll-expand.css";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0 || 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
};

export function ScrollExpand({ src, alt, title, scrollHint, startWidth = 42, startHeight = 58, startRadius = 24, endRadius = 0, mediaZoom = 1.35, scrollDistance = 1.2, smoothing = 0.1, overlayScrim = 0.38, children }: { src: string; alt: string; title?: string; scrollHint?: string; startWidth?: number; startHeight?: number; startRadius?: number; endRadius?: number; mediaZoom?: number; scrollDistance?: number; smoothing?: number; overlayScrim?: number; children?: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const current = useRef(0);
  const target = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!root || !frame || !media) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const apply = (progress: number) => {
      const e = smoothstep(0, 1, progress);
      const width = startWidth + (100 - startWidth) * e;
      const height = startHeight + (100 - startHeight) * e;
      const insetX = Math.max(0, (100 - width) / 2);
      const insetY = Math.max(0, (100 - height) / 2);
      const radius = startRadius + (endRadius - startRadius) * e;
      frame.style.clipPath = `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;
      media.style.transform = `scale(${mediaZoom + (1 - mediaZoom) * e})`;
      if (scrimRef.current) scrimRef.current.style.opacity = String(overlayScrim * e);
      if (titleRef.current) { const out = smoothstep(0.38, 0.86, progress); titleRef.current.style.opacity = String(1 - out); titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + .06 * out})`; }
      if (hintRef.current) { const gone = smoothstep(0, .12, progress); hintRef.current.style.opacity = String(1 - gone); hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`; }
      if (overlayRef.current) { const inn = smoothstep(.68, 1, progress); overlayRef.current.style.opacity = String(inn); overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`; }
    };
    const read = () => {
      const rect = root.getBoundingClientRect();
      const span = Math.max(1, window.innerHeight * scrollDistance);
      return clamp(-rect.top / span, 0, 1);
    };
    const tick = () => {
      const ease = reduceMotion || smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * smoothing));
      current.current += (target.current - current.current) * ease;
      if (Math.abs(target.current - current.current) < .0004) current.current = target.current;
      apply(current.current);
      raf.current = requestAnimationFrame(tick);
    };
    const onScroll = () => { target.current = read(); if (reduceMotion) { current.current = target.current; apply(current.current); } };
    target.current = read(); current.current = target.current; apply(current.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [endRadius, mediaZoom, overlayScrim, scrollDistance, smoothing, startHeight, startRadius, startWidth]);

  return <div ref={rootRef} className="scroll-expand-hero" aria-hidden="true">
    <div ref={frameRef} className="scroll-expand-hero__frame">
      <img ref={mediaRef} className="scroll-expand-hero__media" src={src} alt={alt} draggable={false} />
      <div ref={scrimRef} className="scroll-expand-hero__scrim" />
      {children && <div ref={overlayRef} className="scroll-expand-hero__overlay">{children}</div>}
    </div>
    {title && <div ref={titleRef} className="scroll-expand-hero__title">{title}</div>}
    {scrollHint && <div ref={hintRef} className="scroll-expand-hero__hint">{scrollHint}</div>}
  </div>;
}
