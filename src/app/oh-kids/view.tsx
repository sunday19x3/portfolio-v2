"use client";

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
  { id: "problem", label: "Problem" },
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
      <span className="nav__loc">Hanoi · <HanoiClock /></span>
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
        <span className="dhero__crumbs-current">DRAFT · OH KIDS</span>
      </div>
      <div className="dhero__grid">
        <div>
          <h1 className="dhero__title pf-reveal">
            OH <em>KIDS</em>.
          </h1>
          <p className="dhero__one-liner pf-reveal">
            A baby-clothing brand on TikTok Shop with{" "}
            <em>inventory that doesn’t lie</em> when 40 livestream orders land
            at once.
          </p>
        </div>
        <dl className="dhero__facts pf-reveal">
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Client</dt>
            <dd className="dhero__fact-val">OH KIDS · Danang</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Year</dt>
            <dd className="dhero__fact-val">2026</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Role</dt>
            <dd className="dhero__fact-val">Solo — design, build, ops</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Timeline</dt>
            <dd className="dhero__fact-val">
              7 weeks → live · still maintaining
            </dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Live</dt>
            <dd className="dhero__fact-val">
              <a href="#" data-hover="cursor">
                ohkids.vn ↗
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
      <div className="pf-imgph" data-label="oh kids · storefront cover">
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
          They sold on a TikTok livestream every Friday. Their inventory was a{" "}
          <em>shared Google Sheet</em>. Two people typed orders by hand — and
          oversold by 30% on a good night.
        </p>
        <div className="dprob__detail pf-reveal">
          <p>
            OH KIDS makes Vietnamese-made baby clothing — small batches, ten
            SKUs, sold mostly through TikTok Shop livestreams. The founder ran
            the stream; her sister managed orders in DMs and a spreadsheet.
          </p>
          <p>
            Friday-night peaks pushed forty orders through in ninety minutes.
            The sheet couldn’t keep up.{" "}
            <strong>Stock counts were always wrong by morning</strong>, refunds
            piled up, and customers learned not to trust the “in stock” label.
          </p>
          <p>
            The job: a real storefront wired into TikTok Shop, with a single
            source of truth for inventory that updates the moment a livestream
            order lands.
          </p>
        </div>
      </div>
    </section>
  );
}

function DOutcome() {
  const nums = [
    {
      val: "0",
      unit: "",
      label: "Oversells since launch",
      delta: "↓ from ~12/week",
      up: true,
    },
    {
      val: "40",
      unit: "/min",
      label: "Peak orders sustained",
      delta: "Friday livestream",
      up: false,
    },
    {
      val: "1.4",
      unit: "s",
      label: "Stock sync · livestream → site",
      delta: "p95 latency",
      up: false,
    },
    {
      val: "+38",
      unit: "%",
      label: "Repeat-buyer rate",
      delta: "vs DM-only month",
      up: true,
    },
  ];
  return (
    <section id="outcome" className="dsec">
      <DSecHead no="02" title="What changed" meta="Outcome · 90 days post-launch" />
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
    title: "Sat in on a livestream. Took notes for two hours.",
    body: "Watched the founder run a stream end-to-end. Noticed the sister tabbed between five Chrome windows; each oversell came from a 90-second gap between order pop and sheet update.",
  },
  {
    no: "02",
    title: "Designed around one source of truth.",
    body: (
      <>
        Inventory lives in <code>stock</code> — a single Postgres table on
        Supabase. TikTok Shop webhooks, the Next.js storefront, and the
        in-house ops dashboard all read and write through one stored procedure
        (<code>reserve_stock</code>) that takes a row-level lock.
      </>
    ),
  },
  {
    no: "03",
    title: "Picked Vercel + Supabase, said no to a CMS.",
    body: (
      <>
        Ten SKUs don’t need a CMS. Products live in a typed{" "}
        <code>products.ts</code> file, deployed via Git. The founder asked for
        one — I showed her a five-line PR. She agreed.
      </>
    ),
  },
  {
    no: "04",
    title: "Built the ops dashboard before the storefront.",
    body: "The dashboard had to work first; the storefront could wait a week. By day 12, they were running Friday livestreams off the new system with the old sheet as a paper backup.",
  },
  {
    no: "05",
    title: "Shipped, then stayed for the next four releases.",
    body: "Launch was week 7. Then: VN/EN toggle, a returns flow, a “livestream mode” banner, and a Stripe → MoMo failover. Each release scheduled around their Friday stream so the team could test live.",
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
      ["Next.js 14", "App Router"],
      ["TypeScript", "strict"],
      ["Tailwind", null],
      ["Radix", "primitives"],
    ],
  },
  {
    group: "Data & infra",
    chips: [
      ["Supabase", "Postgres + RLS"],
      ["Vercel", null],
      ["Cloudflare R2", "media"],
      ["Stripe", null],
      ["MoMo", "VN payments"],
    ],
  },
  {
    group: "TikTok Shop",
    chips: [
      ["Shop API v202309", null],
      ["Webhooks", "stock + orders"],
      ["OAuth", "merchant flow"],
    ],
  },
  {
    group: "Observability",
    chips: [
      ["Sentry", null],
      ["Plausible", null],
      ["BetterStack", "uptime"],
    ],
  },
];

function DStack() {
  return (
    <section id="stack" className="dsec">
      <DSecHead no="04" title="What it’s built on" meta="Stack · no surprises" />
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
          <div className="pf-imgph" data-label="storefront · home">
            <div className="pf-imgph__zoom" />
          </div>
        </a>
        <div className="dgallery__col">
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="product detail">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="ops dashboard · stock">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
        </div>
      </div>
      <div className="dgallery pf-reveal" style={{ marginTop: 16 }}>
        <div className="dgallery__col">
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="livestream mode">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
          <a href="#" className="dgallery__item" data-hover="cursor">
            <div className="pf-imgph" data-label="checkout · MoMo">
              <div className="pf-imgph__zoom" />
            </div>
          </a>
        </div>
        <a
          href="#"
          className="dgallery__item dgallery__item--lg"
          data-hover="cursor"
        >
          <div className="pf-imgph" data-label="returns flow · VN/EN">
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
          We haven’t had to argue with a customer about stock since February.
        </p>
        <div className="dcoda__attr">— Linh, founder · OH KIDS</div>
      </div>
      <div className="dcoda__cta pf-reveal">
        <span className="pf-eyebrow">Have a similar mess?</span>
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
      <span className="dnext__label pf-reveal">Back to →</span>
      <TransitionLink
        href="/"
        label="Sunday"
        className="dnext__link pf-reveal"
        data-hover="cursor"
      >
        All work <span className="dnext__link-arrow">↗</span>
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
          Built with Next.js, Supabase &amp; a lot of Friday-night livestreams.
        </span>
      </div>
    </footer>
  );
}

export default function OhKidsPage() {
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
