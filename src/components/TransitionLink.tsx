"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useTransition } from "./TransitionProvider";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  label?: string;
};

export function TransitionLink({
  href,
  onClick,
  label,
  children,
  ...props
}: Props) {
  const { navigate } = useTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    console.log("[TL] click", href);
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;
    e.preventDefault();
    navigate({ href, label });
    console.log("[TL] navigate called");
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
