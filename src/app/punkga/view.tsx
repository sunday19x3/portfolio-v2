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
    <section className='dhero'>
      <div className='dhero__crumbs pf-reveal'>
        <span>Sunday</span>
        <span className='dhero__crumbs-sep'>/</span>
        <span>Work</span>
        <span className='dhero__crumbs-sep'>/</span>
        <span className='dhero__crumbs-current'>№ 02 · PUNKGA</span>
      </div>
      <div className='dhero__grid'>
        <div>
          <h1 className='dhero__title pf-reveal'>
            PUNK<em>GA</em>.<em>ME</em>
          </h1>
          <p className='dhero__one-liner pf-reveal'>
            A <em>cyberpunk manga multiverse</em> — readers, artists, and characters share one on-chain world where
            every chapter, mint, and cameo is licensable IP.
          </p>
        </div>
        <dl className='dhero__facts pf-reveal'>
          <div className='dhero__fact'>
            <dt className='dhero__fact-key'>ORG</dt>
            <dd className='dhero__fact-val'>Tentou Labs</dd>
          </div>
          <div className='dhero__fact'>
            <dt className='dhero__fact-key'>Year</dt>
            <dd className='dhero__fact-val'>2024</dd>
          </div>
          <div className='dhero__fact'>
            <dt className='dhero__fact-key'>Role</dt>
            <dd className='dhero__fact-val'>Frontend developer</dd>
          </div>
          <div className='dhero__fact'>
            <dt className='dhero__fact-key'>Timeline</dt>
            <dd className='dhero__fact-val'>Q1–Q4 2024 · ongoing</dd>
          </div>
          <div className='dhero__fact'>
            <dt className='dhero__fact-key'>Live</dt>
            <dd className='dhero__fact-val'>
              <a href='https://punkga.me' target='_blank' rel='noreferrer' data-hover='cursor'>
                punkga.me ↗
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function DCover() {
  return (
    <div className="dcover pf-reveal">
      <div className="pf-imgph" data-label="punkga · manga multiverse">
        <Image
          src="/projects/punkga-banner.png"
          alt="Punkga.me banner"
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
      <DSecHead
        no="01"
        title="The brief"
        meta="Context · what existed before"
      />
      <div className="dprob">
        <p className="dprob__lead pf-reveal">
          Indie manga artists ship for free and{" "}
          <em>lose ownership the moment a chapter goes viral</em> — no shared
          canon, no licensing rails, no way for fans to keep a piece of the
          story they helped grow.
        </p>
        <div className="dprob__detail pf-reveal">
          <p>
            The Vietnamese and SEA indie manga scene is loud, prolific, and
            completely off-chain. Artists post to Facebook, Instagram, and
            Pixiv; fans translate and re-upload; characters get borrowed across
            scenes; and the original creator earns nothing — even when their IP
            powers an entire fandom.
          </p>
          <p>
            Tentou Labs wanted to build a publishing platform that doubled as a
            programmable-IP layer —{" "}
            <strong>
              one place where artists upload chapters, readers earn for showing
              up, and every character is a licensable on-chain asset
            </strong>{" "}
            other creators can remix without losing the paper trail.
          </p>
          <p>
            The job: design and ship the reader app, the artist studio, the
            character-NFT mint, the quest layer that drives daily reading, and
            the contest system used to launch the platform with partners (Aura
            Network, Kaia, Story Protocol).
          </p>
        </div>
      </div>
    </section>
  );
}

function DOutcome() {
  const nums = [
    {
      val: "400",
      unit: "+",
      label: "Indie artists onboarded",
      delta: "across SEA · Vietnam, ID, PH",
      up: true,
    },
    {
      val: "100",
      unit: "+",
      label: "Manga titles published",
      delta: "from one-shots to ongoing series",
      up: true,
    },
    {
      val: "$2K",
      unit: "",
      label: "Kaia Island contest pot",
      delta: "first cross-chain manga contest",
      up: true,
    },
    {
      val: "3",
      unit: "",
      label: "Chains in one product",
      delta: "Aura · Kaia · Story Protocol",
      up: false,
    },
  ];
  return (
    <section id="outcome" className="dsec">
      <DSecHead
        no="02"
        title="What changed"
        meta="Outcome · since launch"
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
    title: "Designed the reader for binge sessions, not browse.",
    body: "Manga lives or dies on read-through rate. Built a vertical reader with prefetched panels, gesture-based chapter jumps, and a resume-anywhere session that survives wallet reconnects — so a reader who quests for 30 minutes a day doesn’t lose their place when the RPC drops.",
  },
  {
    no: "02",
    title: "Built the artist studio as a one-screen pipeline.",
    body: (
      <>
        Upload → arrange panels → tag characters → mint → publish. Wrapped the
        whole pipeline in a single <code>useReducer</code> state machine so a
        creator who has never touched a wallet can ship a chapter in under five
        minutes. Drafts auto-save to the local cache, and tagged characters
        pull straight from the on-chain registry.
      </>
    ),
  },
  {
    no: "03",
    title: "Wired character NFTs to Story Protocol licensing.",
    body: "Every character mint is registered as an IP Asset on Story — license terms (commercial-remix, non-commercial-share, etc.) are picked at mint and enforced when another artist tags that character in a panel. The studio surfaces the licence stack inline so creators see exactly who owns what before they save.",
  },
  {
    no: "04",
    title: "Launched the quest engine + leaderboard.",
    body: "Read-to-earn missions, weekly leaderboards, and seasonal contests sit on one points ledger. Built a thin contest framework that powered the Aura × Kaia ‘Kaia Island’ launch event end-to-end — submissions, voting, prize pool ($2K), and on-chain settlement of winners.",
  },
  {
    no: "05",
    title: "Shipped the multi-chain wallet layer.",
    body: "Punkga reads from Aura, settles IP licences on Story, and hosts contests that touch Kaia. Built a wallet abstraction that detects chain context per action and prompts the user once — so an artist on Aura can mint a Story IP Asset without thinking about which network they’re on.",
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
      ["Tailwind", null],
    ],
  },
  {
    group: "Web3",
    chips: [["Story Protocol", "IP Assets"]],
  },
];

function DStack() {
  return (
    <section id="stack" className="dsec">
      <DSecHead
        no="04"
        title="What it’s built on"
        meta="Stack · web3 · multi-chain"
      />
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

function DCoda() {
  return (
    <section id="coda" className="dcoda">
      <div className="pf-reveal">
        <p className="dcoda__quote">
          400+ artists, 100+ titles, three chains under one reader — and the
          first cross-chain manga contest shipped end-to-end on a four-week
          deadline.
        </p>
        <div className="dcoda__attr">
          — Punkga.me · Aura × Kaia × Story Protocol, 2024
        </div>
      </div>
      <div className="dcoda__cta pf-reveal">
        <span className="pf-eyebrow">Building a creator platform?</span>
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
        href="/pyxis"
        label="Pyxis Safe"
        className="dnext__link pf-reveal"
        data-hover="cursor"
      >
        Pyxis Safe <span className="dnext__link-arrow">↗</span>
      </TransitionLink>
    </section>
  );
}

function DFooter() {
  return (
    <footer className="footer">
      <div className="footer__row">
        <span>© 2026 Sunday · Hanoi / Vietnam</span>
        <span>Built with Next.js, Tailwind &amp; Story Protocol.</span>
      </div>
    </footer>
  );
}

export default function PunkgaPage() {
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
        <DCoda />
        <DNext />
        <DFooter />
      </main>
    </>
  );
}
