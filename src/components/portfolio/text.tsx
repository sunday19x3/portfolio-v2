"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { SplitText as GsapSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(GsapSplitText);

export function SplitText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const chars = Array.from(text);
  return (
    <span className={`pf-split ${className}`}>
      {chars.map((c, i) => (
        <span
          key={i}
          className="pf-split-char"
          style={{ transitionDelay: `${i * 28}ms` }}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

export function MaskLine({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`pf-mask ${className}`}>
      <span style={{ transitionDelay: `${delay}ms` }}>{text}</span>
    </span>
  );
}

export function HoverFlip({ text }: { text: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const a = aRef.current;
      const b = bRef.current;
      if (!wrap || !a || !b) return;

      const splitA = new GsapSplitText(a, { type: "chars" });
      const splitB = new GsapSplitText(b, { type: "chars" });
      gsap.set(splitA.chars, { yPercent: 0 });
      gsap.set(splitB.chars, { yPercent: 110 });

      const link = wrap.closest("a") ?? wrap.parentElement;
      if (!link) return;

      const enter = () => {
        gsap.killTweensOf([splitA.chars, splitB.chars]);
        gsap.to(splitA.chars, {
          yPercent: -110,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.022,
        });
        gsap.to(splitB.chars, {
          yPercent: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.022,
        });
      };
      const leave = () => {
        gsap.killTweensOf([splitA.chars, splitB.chars]);
        gsap.to(splitA.chars, {
          yPercent: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.018,
        });
        gsap.to(splitB.chars, {
          yPercent: 110,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.018,
        });
      };

      link.addEventListener("mouseenter", enter);
      link.addEventListener("mouseleave", leave);
      return () => {
        link.removeEventListener("mouseenter", enter);
        link.removeEventListener("mouseleave", leave);
        splitA.revert();
        splitB.revert();
      };
    },
    { scope: wrapRef, dependencies: [text] },
  );

  return (
    <span ref={wrapRef} className="flip">
      <span ref={aRef} className="flip__a">
        {text}
      </span>
      <span ref={bRef} className="flip__b" aria-hidden>
        {text}
      </span>
    </span>
  );
}

export function EmphasizeAround({
  text,
  emph,
  className,
}: {
  text: string;
  emph: string;
  className?: string;
}) {
  const parts = text.split(emph);
  return (
    <>
      {parts.map((part, idx) => (
        <Fragment key={idx}>
          {part}
          {idx < parts.length - 1 && <em className={className}>{emph}</em>}
        </Fragment>
      ))}
    </>
  );
}
