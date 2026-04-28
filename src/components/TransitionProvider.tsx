"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText);

type NavigatePayload = { href: string; label?: string };
type TransitionContextValue = {
  navigate: (payload: NavigatePayload) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside TransitionProvider");
  return ctx;
}

const STRIPES = 6;
const COVER_DUR = 0.95;
const REVEAL_DUR = 0.95;
const STAGGER = 0.06;
const HOLD_S = 1.1;
const EASE = "expo.inOut";
const CURVE = "50% 70px";
const FLAT = "0px 0px";
const CHAR_STAGGER = 0.04;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const stripesRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const pendingRef = useRef<{ href: string; label: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useGSAP(() => {
    const stripes = stripesRef.current?.children;
    if (stripes) {
      gsap.set(stripes, {
        yPercent: 100,
        borderTopLeftRadius: CURVE,
        borderTopRightRadius: CURVE,
        borderBottomLeftRadius: FLAT,
        borderBottomRightRadius: FLAT,
      });
    }
    gsap.set(stripesRef.current, { autoAlpha: 1 });
    gsap.set(labelRef.current, { autoAlpha: 0 });
  }, []);

  const navigate = useCallback(
    ({ href, label }: NavigatePayload) => {
      if (isAnimating || href === pathname) return;
      const stripes = stripesRef.current?.children;
      const labelInner = labelTextRef.current;
      if (!stripes || !labelInner) return;

      setIsAnimating(true);
      const resolvedLabel = label ?? hrefToLabel(href);
      pendingRef.current = { href, label: resolvedLabel };

      // Set label text directly (skip React render — needed before SplitText runs).
      labelInner.textContent = resolvedLabel;
      splitRef.current?.revert();
      const split = new SplitText(labelInner, {
        type: "chars",
        mask: "lines",
      });
      splitRef.current = split;
      gsap.set(labelRef.current, { autoAlpha: 1 });
      gsap.set(split.chars, { yPercent: 110, autoAlpha: 0 });

      const tl = gsap.timeline();
      tl.to(stripes, {
        yPercent: 0,
        borderTopLeftRadius: FLAT,
        borderTopRightRadius: FLAT,
        duration: COVER_DUR,
        ease: EASE,
        stagger: STAGGER,
      });
      tl.to(
        split.chars,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power4.out",
          stagger: CHAR_STAGGER,
        },
        "-=0.55",
      );
      tl.call(() => router.push(href));
    },
    [isAnimating, pathname, router],
  );

  useEffect(() => {
    if (!pendingRef.current) return;
    if (pendingRef.current.href !== pathname) return;
    pendingRef.current = null;

    const stripes = stripesRef.current?.children;
    if (!stripes) return;
    const chars = splitRef.current?.chars ?? [];

    const tl = gsap.timeline({
      onComplete: () => {
        splitRef.current?.revert();
        splitRef.current = null;
        gsap.set(labelRef.current, { autoAlpha: 0 });
        setIsAnimating(false);
      },
    });
    tl.to({}, { duration: HOLD_S });
    tl.to(chars, {
      yPercent: -110,
      autoAlpha: 0,
      duration: 0.5,
      ease: "power4.in",
      stagger: CHAR_STAGGER,
    });
    tl.to(
      stripes,
      {
        yPercent: -100,
        borderBottomLeftRadius: CURVE,
        borderBottomRightRadius: CURVE,
        duration: REVEAL_DUR,
        ease: EASE,
        stagger: STAGGER,
      },
      "-=0.3",
    );
    tl.set(stripes, {
      yPercent: 100,
      borderTopLeftRadius: CURVE,
      borderTopRightRadius: CURVE,
      borderBottomLeftRadius: FLAT,
      borderBottomRightRadius: FLAT,
    });
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}

      <div
        className="pointer-events-none fixed inset-0 z-[9998] flex"
        style={{ visibility: "hidden", opacity: 0 }}
        aria-hidden
        ref={stripesRef}
      >
        {Array.from({ length: STRIPES }).map((_, i) => (
          <div
            key={i}
            className="h-full flex-1"
            style={{
              background: "var(--accent)",
              borderTopLeftRadius: CURVE,
              borderTopRightRadius: CURVE,
            }}
          />
        ))}
      </div>

      <div
        ref={labelRef}
        className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ visibility: "hidden", opacity: 0 }}
        aria-hidden
      >
        <span
          ref={labelTextRef}
          className="select-none text-center text-6xl tracking-tight text-6xl sm:text-8xl md:text-[10rem]"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--bg)",
            letterSpacing: "-0.035em",
            lineHeight: 1,
            fontWeight: 600,
          }}
        />
      </div>
    </TransitionContext.Provider>
  );
}

function hrefToLabel(href: string): string {
  if (href === "/") return "Home";
  return href
    .replace(/^\//, "")
    .split("/")
    .pop()!
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
