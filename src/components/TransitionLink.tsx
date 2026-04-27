"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useTransition } from "./TransitionProvider";

type Props = ComponentProps<typeof Link> & {
  label?: string;
};

export function TransitionLink({ href, onClick, label, ...props }: Props) {
  const { navigate } = useTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (typeof href !== "string") return;
    e.preventDefault();
    navigate({ href, label });
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
