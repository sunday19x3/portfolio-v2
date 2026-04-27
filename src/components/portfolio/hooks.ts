"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useGlobalReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".pf-reveal, .pf-mask, .pf-split");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function useCursorAndMagnets() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = matchMedia("(hover: none)").matches;
    if (reduced || touch) {
      document.body.classList.add("no-cursor");
      return;
    }

    const dot = document.createElement("div");
    dot.className = "pf-cursor-dot";
    const ring = document.createElement("div");
    ring.className = "pf-cursor-ring";
    document.body.append(dot, ring);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx;
    let dy = my;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const magnets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-magnet]"),
    ).map((el) => ({
      el,
      tx: 0,
      ty: 0,
      radius: parseFloat(el.getAttribute("data-magnet-radius") || "120"),
      strength: parseFloat(el.getAttribute("data-magnet-strength") || "0.35"),
    }));

    const tick = () => {
      dx += (mx - dx) * 0.6;
      dy += (my - dy) * 0.6;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

      magnets.forEach((m) => {
        const r = m.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist < m.radius) {
          const k = (1 - dist / m.radius) * m.strength;
          m.tx += ((mx - cx) * k - m.tx) * 0.18;
          m.ty += ((my - cy) * k - m.ty) * 0.18;
        } else {
          m.tx += (0 - m.tx) * 0.18;
          m.ty += (0 - m.ty) * 0.18;
        }
        m.el.style.transform = `translate3d(${m.tx.toFixed(2)}px, ${m.ty.toFixed(2)}px, 0)`;
      });

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const setCursor = (val: string) => {
      if (val) document.body.dataset.cursor = val;
      else document.body.removeAttribute("data-cursor");
    };
    const hoverEls = document.querySelectorAll(
      'a, button, [data-hover="cursor"]',
    );
    const onEnterHover = () => setCursor("hover");
    const onLeaveHover = () => setCursor("");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnterHover);
      el.addEventListener("mouseleave", onLeaveHover);
    });
    const textEls = document.querySelectorAll('[data-hover="text"]');
    const onEnterText = () => setCursor("text");
    const onLeaveText = () => setCursor("");
    textEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnterText);
      el.addEventListener("mouseleave", onLeaveText);
    });

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterHover);
        el.removeEventListener("mouseleave", onLeaveHover);
      });
      textEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterText);
        el.removeEventListener("mouseleave", onLeaveText);
      });
      dot.remove();
      ring.remove();
    };
  }, []);
}

export function useStickyProgress(ref: RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const passed = -r.top;
      setP(Math.max(0, Math.min(1, passed / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);
  return p;
}

export function useCounter(target: number, ms = 1200) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let t0 = 0;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const tick = (t: number) => {
              if (!t0) t0 = t;
              const k = Math.min(1, (t - t0) / ms);
              const eased = 1 - Math.pow(1 - k, 3);
              setV(Math.round(eased * target));
              if (k < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            io.unobserve(el);
          }
        }),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [target, ms]);
  return [v, ref] as const;
}
