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
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
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
        <span className="dhero__crumbs-current">№ 04 · DICHUNG</span>
      </div>
      <div className="dhero__grid">
        <div>
          <h1 className="dhero__title pf-reveal">
            DI<em>CHUNG</em>.
          </h1>
          <p className="dhero__one-liner pf-reveal">
            <em>On-demand ride-share and delivery</em> across 40+ Vietnamese
            provinces — airport transfers, shared trips, self-drive rentals,
            and express cargo, all in one app.
          </p>
        </div>
        <dl className="dhero__facts pf-reveal">
          <div className="dhero__fact">
            <dt className="dhero__fact-key">ORG</dt>
            <dd className="dhero__fact-val">Dichung JSC</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Year</dt>
            <dd className="dhero__fact-val">2021 — 2022</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Role</dt>
            <dd className="dhero__fact-val">Frontend developer</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Timeline</dt>
            <dd className="dhero__fact-val">2 years · 5 product lines</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Live</dt>
            <dd className="dhero__fact-val">
              <a
                href="https://dichung.vn"
                target="_blank"
                rel="noreferrer"
                data-hover="cursor"
              >
                dichung.vn ↗
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
      <div className="pf-imgph" data-label="dichung · ride-share platform">
        <Image
          src="/projects/dichung-banner.png"
          alt="Dichung banner"
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
          Long-distance trips between Vietnamese provinces ran on{" "}
          <em>empty seats and Facebook posts</em> — drivers ferried passengers
          one-way, came back empty, and matched riders by hand in scattered
          group chats.
        </p>
        <div className="dprob__detail pf-reveal">
          <p>
            Inter-province travel in Vietnam is huge — Hanoi to Hai Phong, HCMC
            to Vung Tau, the airport runs at 4am — but the matching layer was
            entirely manual. Drivers posted “còn 2 chỗ Hà Nội — Lào Cai” to
            Zalo groups; passengers replied with phone numbers; payments
            settled in cash.
          </p>
          <p>
            Dichung wanted{" "}
            <strong>
              one app where a passenger could search a route, see live capacity
              from real drivers, and book a shared seat or a private car in
              under a minute
            </strong>{" "}
            — and where a driver’s empty return leg became a second paid trip
            instead of fuel burn.
          </p>
          <p>
            The job: design and ship the customer-facing web app for five
            product lines — shared rides, airport transfer, express courier,
            self-drive rental, and tour packages — across 40+ provinces, on a
            stack a small team could keep deploying weekly.
          </p>
        </div>
      </div>
    </section>
  );
}

function DOutcome() {
  const nums = [
    {
      val: "40",
      unit: "+",
      label: "Provinces covered",
      delta: "nationwide route graph",
      up: true,
    },
    {
      val: "5",
      unit: "",
      label: "Product lines · one app",
      delta: "ride · airport · cargo · rental · tour",
      up: false,
    },
    {
      val: "1",
      unit: "min",
      label: "Search → booked",
      delta: "from manual chat to one-tap",
      up: true,
    },
    {
      val: "2",
      unit: "yr",
      label: "Shipping cadence",
      delta: "weekly releases, small team",
      up: false,
    },
  ];
  return (
    <section id="outcome" className="dsec">
      <DSecHead
        no="02"
        title="What changed"
        meta="Outcome · two years on"
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
    title: "Built the route search before anything else.",
    body: "The product lives or dies on whether a passenger types ‘Hà Nội — Lào Cai’ and gets real seats back fast. Spent the first weeks tuning the autosuggest, the shared/private split, and the time-window picker so the search felt instant on a 3G connection from a tablet in a coffee shop.",
  },
  {
    no: "02",
    title: "Treated each product line as a config, not a fork.",
    body: (
      <>
        Shared rides, airport transfer, courier, rental, and tour all share the
        same booking primitives — pickup, dropoff, time, capacity, price.
        Modelled them as one form engine driven by config, so adding a new
        line meant a JSON entry plus a copy file, not a new page tree.
      </>
    ),
  },
  {
    no: "03",
    title: "Made the booking flow survive a flaky network.",
    body: "Passengers book on the move — buses, taxis, weak hotel WiFi. Built every step (quote, lock seat, pay, confirm) as resumable: refresh mid-payment and the queue picks up with the same lock. Optimistic UI for confirmations, server reconciliation on retry. Zero double-bookings.",
  },
  {
    no: "04",
    title: "Wired the driver and dispatch tooling to the same spine.",
    body: "Same React codebase, different routes — one bundle for passengers, one for drivers, one for dispatch. Shared the same auth, same booking state, same SSE stream. Dispatch ops staff could see exactly what a passenger saw, which killed an entire class of ‘I booked it but they say no’ tickets.",
  },
  {
    no: "05",
    title: "Shipped weekly for two years.",
    body: "Small team, no staging drama. Built a release rhythm with feature flags, gradual rollouts by province, and on-call rotation tied to booking-volume windows (4am airport spikes, Friday-evening intercity surges). Every release rode a real demand peak, not a calendar.",
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
      ["React", null],
      ["Sass", null],
    ],
  },
];

function DStack() {
  return (
    <section id="stack" className="dsec">
      <DSecHead
        no="04"
        title="What it’s built on"
        meta="Stack · web · mobile-first"
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
          Five product lines, 40+ provinces, weekly releases for two years —
          and an empty return leg turned into a second paid trip.
        </p>
        <div className="dcoda__attr">— Dichung · 2021–2022</div>
      </div>
      <div className="dcoda__cta pf-reveal">
        <span className="pf-eyebrow">Marketplace or ops product?</span>
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
        <span>Built with React &amp; Sass — small team, weekly releases.</span>
      </div>
    </footer>
  );
}

export default function DichungPage() {
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
