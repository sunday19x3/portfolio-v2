"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  useCounter,
  useCursorAndMagnets,
  useGlobalReveal,
  useStickyProgress,
} from "@/components/portfolio/hooks";
import {
  EmphasizeAround,
  HoverFlip,
  MaskLine,
  SplitText,
} from "@/components/portfolio/text";
import { Logo } from "@/components/portfolio/Logo";

const SUNDAY = {
  email: "sunday19x3@gmail.com",
  city: "Hanoi",
  projects: [
    {
      id: "mimboku",
      no: "01",
      year: "2025",
      name: "Mimboku",
      problem:
        "First native liquidity aggregator and top NFT community in Story. Swap tokens or receive ecosystem rewards and bonus yield from staking, LPs, and IP creation.",
      stack: ["Next.js", "Story Protocol", "Wagmi"],
      url: "mimboku.com",
      href: "https://mimboku.com/",
      ph: "mimboku · liquidity aggregator",
      image: "/projects/mimboku.png",
      ratio: undefined,
    },
    {
      id: "punkga",
      no: "02",
      year: "2024",
      name: "Punkga.me",
      problem:
        "First on-chain Manga UGC multiverse. On-chain Manga IP built on Story Protocol.",
      stack: ["Next.js", "Tailwind"],
      url: "punkga.me",
      href: "https://punkga.me/",
      image: "/projects/punkga.png",
      ratio: undefined,
      ph: "punkga · manga multiverse",
    },
    {
      id: "pyxis",
      no: "03",
      year: "2023",
      name: "Pyxis Safe",
      problem:
        "Multi-signature safe for the Cosmos interchain. Co-owners share custody of digital assets — M-of-N approval required to move funds.",
      stack: ["React", "Wagmi", "Cosmos"],
      url: "pyxis.aura.network",
      href: "https://pyxis.aura.network/",
      image: "/projects/pyxis.png",
      ratio: undefined,
      ph: "pyxis · multi-sig safe",
    },
    {
      id: "dichung",
      no: "04",
      year: "2021 — 2022",
      name: "Dichung",
      problem:
        "On-demand ride-share and delivery platform across 40+ Vietnamese provinces. Connects passengers for shared trips, airport transfers, and cargo — turning empty seats into shared rides.",
      stack: ["React", "Sass"],
      url: "dichung.vn",
      href: "https://dichung.vn/",
      image: "/projects/dichung.png",
      ratio: undefined,
      ph: "dichung · ride-share platform",
    },
  ],
  social: [
    { name: "GitHub", url: "github.com/sunday19x3", href: "https://github.com/sunday19x3" },
    { name: "Twitter", url: "x.com/sunday19x3", href: "https://x.com/sunday19x3" },
    { name: "LinkedIn", url: "linkedin.com/in/sunday19x3", href: "https://www.linkedin.com/in/sunday19x3" },
  ],
};

const TICKER_ROWS: { glyph: string; body: React.ReactNode }[] = [
  {
    glyph: "↳",
    body: (
      <>
        shipped{" "}
        <code>
          <span className="sha">a47f2c1</span> feat(inventory): reconcile
          livestream order race
        </code>{" "}
        <em>· 47m ago</em>
      </>
    ),
  },
  {
    glyph: "♪",
    body: (
      <>
        listening to <em>Khruangbin</em> —{" "}
        <span style={{ color: "var(--fg-muted)" }}>Mordechai</span> · loop #4
      </>
    ),
  },
  {
    glyph: "❡",
    body: (
      <>
        reading <em>A Philosophy of Software Design</em> —{" "}
        <span style={{ color: "var(--fg-muted)" }}>62%</span>
      </>
    ),
  },
  {
    glyph: "▲",
    body: (
      <>
        deployed <em>oh-kids.vn</em> —{" "}
        <span style={{ color: "var(--fg-muted)" }}>build #1284 · 2h ago</span>
      </>
    ),
  },
  {
    glyph: "✦",
    body: (
      <>
        played badminton — won doubles <em>21–18</em> · Tuesday
      </>
    ),
  },
];

const STICKY_LINES = [
  { text: "I build things.", emph: "build" },
  { text: "I ship things.", emph: "ship" },
  { text: "I maintain them.", emph: "maintain" },
];

function HanoiClock() {
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
  return (
    <span suppressHydrationWarning>
      {time || "—:—"}
    </span>
  );
}

function Nav() {
  return (
    <header className="nav">
      <span className="nav__mark" aria-label="Sunday">
        <Logo height={22} />
      </span>
      <nav className="nav__items">
        <a
          href="#work"
          className="pf-underline"
          data-magnet
          data-magnet-radius="80"
          data-magnet-strength="0.25"
        >
          Work
        </a>
        <a
          href="#stack"
          className="pf-underline"
          data-magnet
          data-magnet-radius="80"
          data-magnet-strength="0.25"
        >
          Stack
        </a>
        <a
          href="#contact"
          className="pf-underline"
          data-magnet
          data-magnet-radius="80"
          data-magnet-strength="0.25"
        >
          Contact
        </a>
      </nav>
      <span className="nav__loc">Hanoi · <HanoiClock /></span>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero__top">
        <span className="pf-eyebrow">Portfolio · 2026</span>
        <span className="pf-eyebrow">№ 001 / Sunday</span>
      </div>
      <div className="hero__center">
        <h1 className="hero__title" data-hover="text">
          <SplitText text="Sunday" />
        </h1>
        <p className="hero__manifesto">
          <MaskLine
            text="Frontend & Web3 developer, based in Hanoi."
            delay={500}
          />
          <br />
          <MaskLine
            text="Builds production systems, ships side projects monthly,"
            delay={620}
          />
          <br />
          <MaskLine text="prefers clean code over clever code." delay={740} />
        </p>
      </div>
      <div className="hero__bottom">
        <div className="hero__cue">
          <span className="hero__cue-line" />
          <span className="pf-eyebrow">Scroll · 6 sections</span>
        </div>
        <div className="pf-eyebrow">Developer · since 2020</div>
      </div>
    </section>
  );
}

function Ticker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setI((v) => (v + 1) % TICKER_ROWS.length),
      3600,
    );
    return () => clearInterval(id);
  }, []);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateY(${-i * 30}px)`;
    }
  }, [i]);
  return (
    <section className="ticker" id="now" aria-label="Now">
      <div className="ticker__inner">
        <span className="ticker__label">
          <span className="pf-signal" aria-hidden>
            <span className="pf-signal__bar" />
            <span className="pf-signal__bar" />
            <span className="pf-signal__bar" />
            <span className="pf-signal__bar" />
          </span>
          <span className="pf-eyebrow">Now</span>
        </span>
        <div className="ticker__rotor">
          <div className="ticker__rotor-track" ref={trackRef}>
            {TICKER_ROWS.map((r, idx) => (
              <div className="ticker__row" key={idx}>
                <span className="glyph" aria-hidden>
                  {r.glyph}
                </span>
                <span>{r.body}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ticker__pips" aria-hidden>
          {TICKER_ROWS.map((_, idx) => (
            <span
              key={idx}
              className={`ticker__pip ${idx === i ? "is-on" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Project({
  p,
  i,
}: {
  p: (typeof SUNDAY.projects)[number];
  i: number;
}) {
  const flipped = i % 2 === 1;
  const href = p.href ?? "#";
  const external = !!p.href;
  const target = external ? "_blank" : undefined;
  const rel = external ? "noopener noreferrer" : undefined;
  return (
    <article
      className={`project pf-project pf-reveal ${flipped ? "is-flipped" : ""}`}
      style={{ transitionDelay: `${i * 80}ms` }}
    >
      <a
        href={href}
        target={target}
        rel={rel}
        className="project__media"
        data-hover="cursor"
      >
        <div
          className="pf-imgph"
          data-label={p.ph}
          style={{ "--ratio": p.ratio ?? (flipped ? "5 / 4" : "4 / 3") } as React.CSSProperties}
        >
          {p.image ? (
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="pf-imgph__img"
              priority={i === 0}
            />
          ) : (
            <div className="pf-imgph__zoom" />
          )}
        </div>
      </a>
      <div className="project__body">
        <div className="project__head">
          <span className="pf-eyebrow">
            <span className="project__no">№ {p.no}</span>{" "}
            <span className="project__year">· {p.year}</span>
          </span>
        </div>
        <h3 className="project__name">
          <a
            href={href}
            target={target}
            rel={rel}
            className="pf-underline flip-link"
            data-hover="cursor"
          >
            <HoverFlip text={p.name} />
          </a>
        </h3>
        <p className="project__problem">{p.problem}</p>
        <div className="project__foot">
          <div className="pf-tags">
            {p.stack.map((t) => (
              <span key={t} className="pf-tag">
                {t}
              </span>
            ))}
          </div>
          <a
            href={href}
            target={target}
            rel={rel}
            className="project__link pf-underline"
          >
            {p.url} ↗
          </a>
        </div>
      </div>
    </article>
  );
}

function Work() {
  return (
    <section id="work" className="work">
      <header className="work__head pf-reveal">
        <span className="pf-eyebrow">Selected · 2020 — 2026</span>
        <h2 className="work__title">
          Four <em>things</em> I built.
        </h2>
      </header>
      <div className="work__list">
        {SUNDAY.projects.map((p, i) => (
          <Project key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}

function Sticky() {
  const ref = useRef<HTMLElement>(null);
  const p = useStickyProgress(ref);
  return (
    <section ref={ref} className="sticky">
      <div className="sticky__viewport">
        <div className="sticky__stack">
          {STICKY_LINES.map((l, i) => {
            const seg = 1 / STICKY_LINES.length;
            const center = seg * (i + 0.5);
            const dist = Math.abs(p - center);
            const opacity = Math.max(0, 1 - dist / (seg * 0.85));
            const y = (p - center) * 80;
            return (
              <h2
                key={i}
                className="sticky__line"
                style={{ opacity, transform: `translateY(${-y}px)` }}
              >
                <EmphasizeAround
                  text={l.text}
                  emph={l.emph}
                  className="sticky__emph"
                />
              </h2>
            );
          })}
        </div>
        <div className="sticky__rail">
          {STICKY_LINES.map((_, i) => (
            <span
              key={i}
              className={`sticky__tick ${
                p >= i / STICKY_LINES.length ? "is-on" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StackKW({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="stack__kw"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      data-hover="cursor"
    >
      <span className="stack__kw-text">{children}</span>
      <span className={`stack__tip ${open ? "is-open" : ""}`}>{tip}</span>
    </span>
  );
}

function Stack() {
  return (
    <section id="stack" className="stack">
      <header className="stack__head pf-reveal">
        <span className="pf-eyebrow">Tools I reach for</span>
      </header>
      <p className="stack__copy pf-reveal">
        Six years writing{" "}
        <StackKW tip="Daily driver since 2020">TypeScript</StackKW>. Web3
        wired through{" "}
        <StackKW tip="Wallet connection · since 2023">Wagmi</StackKW> on{" "}
        <StackKW tip="Mimboku · Punkga.me">Story Protocol</StackKW> and{" "}
        <StackKW tip="Pyxis Safe · since 2023">Cosmos</StackKW>.{" "}
        <StackKW tip="In real production code, not demos">Claude</StackKW>{" "}
        writes alongside me now — production, not demos.{" "}
        <StackKW tip="Default deploy target">Vercel</StackKW> to ship,{" "}
        <StackKW tip="Default styling · since 2022">Tailwind</StackKW> to
        paint, the open web to live on.
      </p>
    </section>
  );
}

function Signal({
  label,
  meta,
  children,
  extra,
}: {
  label: string;
  meta: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="signal pf-reveal">
      <span className="pf-eyebrow">{label}</span>
      {children}
      {extra}
      <span className="signal__meta">{meta}</span>
    </div>
  );
}

function Signals() {
  const [a, ar] = useCounter(21, 1100);
  const [b, br] = useCounter(18, 1300);
  return (
    <section className="signals">
      <header className="signals__head pf-reveal">
        <span className="pf-eyebrow">Signals · proof of being alive</span>
      </header>
      <div className="signals__row">
        <Signal label="Latest commit" meta="@sunday/oh-kids · 47m ago">
          <code className="signal__commit">
            <span className="signal__sha">a47f2c1</span>{" "}
            feat(inventory): reconcile livestream order race
          </code>
        </Signal>
        <Signal
          label="Reading"
          meta="John Ousterhout · 62%"
          extra={
            <span className="signal__bar">
              <span
                className="signal__bar-fill"
                style={{ width: "62%" }}
              />
            </span>
          }
        >
          <span className="signal__title">
            A Philosophy of Software Design
          </span>
        </Signal>
        <Signal label="Last match" meta="Doubles · Tuesday">
          <div className="signal__score">
            <span ref={ar}>{a}</span>
            <span className="signal__sep">—</span>
            <span ref={br}>{b}</span>
          </div>
        </Signal>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact">
      <span className="pf-eyebrow">Let&apos;s talk</span>
      <a
        href={`mailto:${SUNDAY.email}`}
        className="contact__mail pf-magnet"
        data-magnet
        data-magnet-radius="240"
        data-magnet-strength="0.34"
        data-hover="cursor"
      >
        {SUNDAY.email}
        <span className="contact__mail-arrow">↗</span>
      </a>
      <div className="contact__socials">
        {SUNDAY.social.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__social pf-underline"
            data-magnet
            data-magnet-radius="100"
            data-magnet-strength="0.25"
          >
            <span className="contact__social-name">{s.name}</span>
            <span className="contact__social-meta">{s.url}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__row">
        <span className="pf-eyebrow">© Sunday — 2026</span>
        <span className="pf-eyebrow">
          Built with caffeine in {SUNDAY.city}
        </span>
      </div>
    </footer>
  );
}

export default function Home() {
  useGlobalReveal();
  useCursorAndMagnets();
  return (
    <>
      <Nav />
      <main className="shell">
        <Hero />
        <Ticker />
        <Work />
        <Sticky />
        <Stack />
        <Signals />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
