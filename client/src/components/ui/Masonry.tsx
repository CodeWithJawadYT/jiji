/* JawyXDevs style: editorial project masonry with cinematic GSAP entrances, restrained hover depth, and accessible live-site links. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import "./Masonry.css";

type MasonryItem = {
  id: string;
  img: string;
  url: string;
  height: number;
  number: string;
  name: string;
  category: string;
};

type MasonryProps = {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "top" | "bottom" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
};

const useMedia = (queries: string[], values: number[], fallback: number) => {
  const get = () => {
    if (typeof window === "undefined") return fallback;
    const index = queries.findIndex(query => window.matchMedia(query).matches);
    return values[index] ?? fallback;
  };
  const [value, setValue] = useState(get);
  useEffect(() => {
    const media = queries.map(query => window.matchMedia(query));
    const handler = () => setValue(get());
    media.forEach(item => item.addEventListener("change", handler));
    return () => media.forEach(item => item.removeEventListener("change", handler));
  }, [queries]);
  return value;
};

const useMeasure = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
};

const preloadImages = async (urls: string[]) => {
  await Promise.all(urls.map(src => new Promise<void>(resolve => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve();
    image.onerror = () => resolve();
  })));
};

export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.96,
  blurToFocus = true,
}: MasonryProps) {
  const columns = useMedia(["(min-width:1200px)", "(min-width:760px)", "(min-width:500px)"], [3, 2, 2], 1);
  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    let active = true;
    preloadImages(items.map(item => item.img)).then(() => active && setImagesReady(true));
    return () => { active = false; };
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return { items: [], height: 0 };
    const heights = new Array(columns).fill(0) as number[];
    const columnWidth = width / columns;
    const next = items.map(item => {
      const column = heights.indexOf(Math.min(...heights));
      const x = columnWidth * column;
      const h = Math.max(190, Math.min(390, item.height * (columnWidth / 360)));
      const y = heights[column];
      heights[column] += h;
      return { ...item, x, y, w: columnWidth, h };
    });
    return { items: next, height: Math.max(...heights, 0) };
  }, [columns, items, width]);

  const getInitial = (item: typeof grid.items[number]) => {
    let direction = animateFrom;
    if (direction === "random") {
      direction = (["top", "bottom", "left", "right"] as const)[Math.floor(Math.random() * 4)];
    }
    if (direction === "top") return { x: item.x, y: -180 };
    if (direction === "left") return { x: -220, y: item.y };
    if (direction === "right") return { x: window.innerWidth + 220, y: item.y };
    if (direction === "center") return { x: width / 2 - item.w / 2, y: grid.height / 2 - item.h / 2 };
    return { x: item.x, y: window.innerHeight + 180 };
  };

  useLayoutEffect(() => {
    if (!imagesReady || !grid.items.length) return;
    const ctx = gsap.context(() => {
      grid.items.forEach((item, index) => {
        const selector = `[data-masonry-key="${item.id}"]`;
        const target = { x: item.x, y: item.y, width: item.w, height: item.h };
        if (!hasMounted.current) {
          const initial = getInitial(item);
          gsap.fromTo(selector, {
            opacity: 0,
            x: initial.x,
            y: initial.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus ? { filter: "blur(12px)" } : {}),
          }, {
            ...target,
            opacity: 1,
            ...(blurToFocus ? { filter: "blur(0px)" } : {}),
            duration: 0.85,
            delay: index * stagger,
            ease: "power3.out",
          });
        } else {
          gsap.to(selector, { ...target, duration, ease, overwrite: "auto" });
        }
      });
    }, containerRef);
    hasMounted.current = true;
    return () => ctx.revert();
  }, [containerRef, duration, ease, grid, imagesReady, stagger, animateFrom, blurToFocus, width]);

  const hover = (id: string, active: boolean) => {
    if (!scaleOnHover) return;
    gsap.to(`[data-masonry-key="${id}"]`, { scale: active ? hoverScale : 1, duration: 0.35, ease: "power2.out", overwrite: "auto" });
  };

  return (
    <div ref={containerRef} className="masonry-list" style={{ height: grid.height || undefined }} aria-label="Selected JawyXDevs projects">
      {grid.items.map(item => (
        <a
          key={item.id}
          data-masonry-key={item.id}
          className="masonry-item"
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => hover(item.id, true)}
          onMouseLeave={() => hover(item.id, false)}
          onFocus={() => hover(item.id, true)}
          onBlur={() => hover(item.id, false)}
          aria-label={`Visit ${item.name}`}
        >
          <span className="masonry-image" style={{ backgroundImage: `url(${item.img})` }} />
          <span className="masonry-shade" />
          <span className="masonry-meta"><b>{item.number}</b><small>{item.category}</small></span>
          <span className="masonry-title">{item.name}<span aria-hidden="true">↗</span></span>
        </a>
      ))}
    </div>
  );
}
