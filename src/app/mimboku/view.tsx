"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/TransitionLink";
import {
  useCursorAndMagnets,
  useGlobalReveal,
} from "@/components/portfolio/hooks";
import { Logo } from "@/components/portfolio/Logo";
import { HanoiClock } from "@/components/portfolio/HanoiClock";

const SECTIONS = [
  { id: "context", label: "Context" },
  { id: "outcome", label: "Outcome" },
  { id: "process", label: "Process" },
  { id: "stack", label: "Stack" },
  // { id: "gallery", label: "Gallery" }, // TODO: re-enable when screens are ready
  { id: "coda", label: "Coda" },
];

function PageRail() {
  const [active, setActive] = useState("context");
  useEffect(() => {
    const onScroll = () => {
      const mid = innerHeight * 0.4;
      let cur = "context";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className="pp-rail" aria-label="Page sections">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`pp-rail__item ${active === s.id ? "is-active" : ""}`}
          data-hover="cursor"
        >
          <span className="pp-rail__tick" />
          <span>{s.label}</span>
        </a>
      ))}
    </nav>
  );
}

function DNav() {
  return (
    <header className="nav">
      <TransitionLink
        href="/"
        label="Sunday"
        className="nav__mark"
        aria-label="Sunday — home"
        data-hover="cursor"
      >
        <Logo height={22} />
      </TransitionLink>
      <TransitionLink
        href="/"
        label="Sunday"
        className="dnav__back"
        data-hover="cursor"
      >
        <span className="dnav__back-arrow">←</span> All work
      </TransitionLink>
      <span className="nav__loc">
        Hanoi · <HanoiClock />
      </span>
    </header>
  );
}

function DHero() {
  return (
    <section className="dhero">
      <div className="dhero__crumbs pf-reveal">
        <span>Sunday</span>
        <span className="dhero__crumbs-sep">/</span>
        <span>Work</span>
        <span className="dhero__crumbs-sep">/</span>
        <span className="dhero__crumbs-current">№ 01 · MIMBOKU</span>
      </div>
      <div className="dhero__grid">
        <div>
          <h1 className="dhero__title pf-reveal">
            MIM<em>BOKU</em>.
          </h1>
          <p className="dhero__one-liner pf-reveal">
            First <em>native liquidity aggregator</em> and top NFT community on
            Story — swap tokens or earn ecosystem rewards from staking, LPs,
            and IP creation.
          </p>
        </div>
        <dl className="dhero__facts pf-reveal">
          <div className="dhero__fact">
            <dt className="dhero__fact-key">ORG</dt>
            <dd className="dhero__fact-val">Tentou Labs</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Year</dt>
            <dd className="dhero__fact-val">2025</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Role</dt>
            <dd className="dhero__fact-val">Frontend developer</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Timeline</dt>
            <dd className="dhero__fact-val">8 weeks → mainnet</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Live</dt>
            <dd className="dhero__fact-val">
              <a
                href="https://mimboku.com"
                target="_blank"
                rel="noreferrer"
                data-hover="cursor"
              >
                mimboku.com ↗
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function DCover() {
  return (
    <div className="dcover pf-reveal">
      <div className="pf-imgph" data-label="mimboku · liquidity aggregator">
        <Image
          src="/projects/mimboku-banner.jpeg"
          alt="Mimboku banner"
          fill
          sizes="(max-width: 1024px) 100vw, 1280px"
          className="pf-imgph__img"
          priority
        />
        <div className="pf-imgph__zoom" />
      </div>
    </div>
  );
}

function DSecHead({
  no,
  title,
  meta,
}: {
  no: string;
  title: string;
  meta?: string;
}) {
  return (
    <header className="dsec__head pf-reveal">
      <span className="dsec__no">№ {no}</span>
      <h2 className="dsec__title">{title}</h2>
      {meta && <span className="dsec__meta">{meta}</span>}
    </header>
  );
}

function DProblem() {
  return (
    <section id="context" className="dsec">
      <DSecHead no="01" title="The brief" meta="Context · what existed before" />
      <div className="dprob">
        <p className="dprob__lead pf-reveal">
          Story shipped a chain for IP, but{" "}
          <em>the on-chain economy didn’t have a front door</em> — no native
          aggregator, fragmented liquidity, and no community ritual to bring
          users back.
        </p>
        <div className="dprob__detail pf-reveal">
          <p>
            Story Protocol launched as the chain for programmable IP — a fresh
            EVM L1 with a thin DeFi layer and a small but loud community.
            Liquidity sat in a handful of pools that didn’t talk to each other,
            and NFT distribution was tied to one-off mint pages with no shared
            identity.
          </p>
          <p>
            Tentou Labs wanted to ship the first native aggregator on Story and
            anchor it with an NFT community that doubled as a loyalty layer —{" "}
            <strong>
              one product surface where swap, stake, mint and rewards lived
              together
            </strong>{" "}
            instead of scattered across five tabs.
          </p>
          <p>
            The job: design and ship the frontend for the aggregator, the
            staking flow, the NFT mint, and the connective tissue (perks,
            missions, leaderboard) — fast enough to land in the first wave of
            Story’s mainnet rollout.
          </p>
        </div>
      </div>
    </section>
  );
}

function DOutcome() {
  const nums = [
    {
      val: "$2M",
      unit: "",
      label: "Total swap volume",
      delta: "first native aggregator on Story",
      up: true,
    },
    {
      val: "2,792",
      unit: "",
      label: "NFTs minted",
      delta: "Mimboku · Great Mimgration",
      up: true,
    },
    {
      val: "1,800",
      unit: "+",
      label: "Unique owners",
      delta: "≈ 64% mint-to-hold ratio",
      up: true,
    },
    {
      val: "4",
      unit: "",
      label: "Products under one roof",
      delta: "swap · stake · mint · world",
      up: false,
    },
  ];
  return (
    <section id="outcome" className="dsec">
      <DSecHead
        no="02"
        title="What changed"
        meta="Outcome · since mainnet launch"
      />
      <div className="dnums pf-reveal">
        {nums.map((n) => (
          <div key={n.label} className="dnum">
            <div className="dnum__val">
              {n.val}
              {n.unit && <span className="dnum__unit">{n.unit}</span>}
            </div>
            <div className="dnum__label">{n.label}</div>
            <div className={`dnum__delta ${n.up ? "dnum__delta--up" : ""}`}>
              {n.delta}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const PROCESS: { no: string; title: string; body: React.ReactNode }[] = [
  {
    no: "01",
    title: "Read the chain before drawing a screen.",
    body: "Spent the first week inside Story’s docs and Wagmi internals — mapped the IP module, the royalty primitives, and what was actually exposed via RPC. The aggregator’s UX hinged on which calls we could batch; the design followed the contract surface, not the other way around.",
  },
  {
    no: "02",
    title: "Built the swap flow as a single state machine.",
    body: (
      <>
        Quote → approve → sign → confirm → settle. Modeled the whole route as
        an explicit state machine in <code>useReducer</code>, so every error
        path (rejected sig, insufficient gas, slippage exceeded, RPC dropout)
        had a named state instead of a dangling toast.
      </>
    ),
  },
  {
    no: "03",
    title: "Designed the NFT mint to feel like a moment, not a form.",
    body: "The Great Mimgration mint had to land like an event — countdown, queue, allowlist tiers, post-mint celebration. Built the mint flow with optimistic UI (claim renders before tx confirmation), reconciling against the contract on settle. 2,792 mints, no stuck states.",
  },
  {
    no: "04",
    title: "Wired the loyalty layer across products.",
    body: "Perks, missions, and the leaderboard share one points ledger — earn from swap volume, NFT holds, or staking. Built a thin client SDK so each product surface (ag, app, world) reads/writes through the same hook, and a holder’s identity carries between them.",
  },
  {
    no: "05",
    title: "Shipped to mainnet, then stayed for the next four releases.",
    body: "Mainnet went live in week 8. Then: a staking dashboard with validator picker, perk redemption, mission streaks, and a Story-native session-key flow that cuts wallet pop-ups by ~60% on repeat actions. Each release scoped to ride a specific community moment.",
  },
];

function DProcess() {
  return (
    <section id="process" className="dsec">
      <DSecHead no="03" title="How it got built" meta="Process · five moves" />
      <ol className="dproc">
        {PROCESS.map((p) => (
          <li key={p.no} className="dproc__item pf-reveal">
            <span className="dproc__no">{p.no}</span>
            <h3 className="dproc__title">{p.title}</h3>
            <p className="dproc__body">{p.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const STACK: { group: string; chips: [string, string | null][] }[] = [
  {
    group: "Frontend",
    chips: [
      ["Next.js", "App Router"],
      ["TypeScript", "strict"],
      ["Tailwind", null],
      ["Framer Motion", "transitions"],
    ],
  },
  {
    group: "Web3",
    chips: [
      ["Story Protocol", "EVM L1"],
      ["Wagmi", "v2"],
      ["Viem", null],
      ["RainbowKit", "wallet UX"],
    ],
  },
  {
    group: "Data & infra",
    chips: [
      ["Vercel", null],
      ["The Graph", "subgraphs"],
      ["Redis", "session keys"],
      ["Cloudflare", "edge"],
    ],
  },
  {
    group: "Observability",
    chips: [
      ["Sentry", null],
      ["Plausible", null],
      ["Tenderly", "tx debugging"],
    ],
  },
];

function DStack() {
  return (
    <section id="stack" className="dsec">
      <DSecHead no="04" title="What it’s built on" meta="Stack · web3 · no exotic picks" />
      <div>
        {STACK.map((g) => (
          <div key={g.group} className="dstack pf-reveal">
            <span className="dstack__group">{g.group}</span>
            <div className="dstack__chips">
              {g.chips.map(([name, note]) => (
                <span key={name} className="dstack__chip" data-hover="cursor">
                  {name}
                  {note && <span className="dstack__chip-note">· {note}</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DGallery() {
  return (
    <section id="gallery" className="dsec">
      <DSecHead no="05" title="Selected screens" meta="Gallery · six views" />
      <div className="dgallery pf-reveal">
        <a
          href="#"
          className="dgallery__item dgallery__item--lg"
          data-hover="cursor"
        >
          <div className="pf-imgph" data-label="aggregator · home">
            <div className="pf-imgph__zoom" />
          </div>
        </a>
        <div className="dgallery__col">
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="swap · quote → confirm">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="staking · validator picker">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
        </div>
      </div>
      <div className="dgallery pf-reveal" style={{ marginTop: 16 }}>
        <div className="dgallery__col">
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="great mimgration · mint">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="missions + perks">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
        </div>
        <a
          href="#"
          className="dgallery__item dgallery__item--lg"
          data-hover="cursor"
        >
          <div className="pf-imgph" data-label="leaderboard · season 01">
            <div className="pf-imgph__zoom" />
          </div>
        </a>
      </div>
    </section>
  );
}

function DCoda() {
  return (
    <section id="coda" className="dcoda">
      <div className="pf-reveal">
        <p className="dcoda__quote">
          $2M in volume, 2,792 mints, 1,800+ holders — and zero swap-flow
          regressions since mainnet.
        </p>
        <div className="dcoda__attr">— Mimboku · Story Protocol mainnet, 2025</div>
      </div>
      <div className="dcoda__cta pf-reveal">
        <span className="pf-eyebrow">Shipping in web3?</span>
        <a
          href="mailto:sunday19x3@gmail.com"
          className="dcoda__cta-link"
          data-hover="cursor"
        >
          sunday19x3@gmail.com <span className="dcoda__cta-arrow">↗</span>
        </a>
      </div>
    </section>
  );
}

function DNext() {
  return (
    <section className="dnext">
      <span className="dnext__label pf-reveal">Next case study →</span>
      <TransitionLink
        href="/punkga"
        label="Punkga.me"
        className="dnext__link pf-reveal"
        data-hover="cursor"
      >
        Punkga.me <span className="dnext__link-arrow">↗</span>
      </TransitionLink>
    </section>
  );
}

function DFooter() {
  return (
    <footer className="footer">
      <div className="footer__row">
        <span>© 2026 Sunday · Hanoi / Vietnam</span>
        <span>
          Built with Next.js, Wagmi &amp; Story Protocol mainnet day one.
        </span>
      </div>
    </footer>
  );
}

export default function MimbokuPage() {
  useGlobalReveal();
  useCursorAndMagnets();
  return (
    <>
      <DNav />
      <PageRail />
      <main className="shell">
        <DHero />
        <DCover />
        <DProblem />
        <DOutcome />
        <DProcess />
        <DStack />
        {/* <DGallery /> TODO: re-enable when screens are ready */}
        <DCoda />
        <DNext />
        <DFooter />
      </main>
    </>
  );
}
