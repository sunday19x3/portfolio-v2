"use client";

import { useEffect, useState } from "react";

export function HanoiClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const ms = 60_000 - (Date.now() % 60_000);
    const startup = setTimeout(() => {
      tick();
      const id = setInterval(tick, 60_000);
      cleanup = () => clearInterval(id);
    }, ms);
    let cleanup = () => clearTimeout(startup);
    return () => cleanup();
  }, []);
  return <span suppressHydrationWarning>{time || "—:—"}</span>;
}
