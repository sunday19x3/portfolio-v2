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
    <section className="dhero">
      <div className="dhero__crumbs pf-reveal">
        <span>Sunday</span>
        <span className="dhero__crumbs-sep">/</span>
        <span>Work</span>
        <span className="dhero__crumbs-sep">/</span>
        <span className="dhero__crumbs-current">№ 03 · PYXIS SAFE</span>
      </div>
      <div className="dhero__grid">
        <div>
          <h1 className="dhero__title pf-reveal">
            PYXIS<em>.</em>
          </h1>
          <p className="dhero__one-liner pf-reveal">
            <em>Multi-signature safe for the Cosmos interchain</em> — co-owners
            share custody of digital assets, M-of-N approval required to move
            funds.
          </p>
        </div>
        <dl className="dhero__facts pf-reveal">
          <div className="dhero__fact">
            <dt className="dhero__fact-key">ORG</dt>
            <dd className="dhero__fact-val">Aura Network</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Year</dt>
            <dd className="dhero__fact-val">2023</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Role</dt>
            <dd className="dhero__fact-val">Frontend developer</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Timeline</dt>
            <dd className="dhero__fact-val">v1 mainnet → EVMOS</dd>
          </div>
          <div className="dhero__fact">
            <dt className="dhero__fact-key">Live</dt>
            <dd className="dhero__fact-val">
              <a
                href="https://pyxis.aura.network"
                target="_blank"
                rel="noreferrer"
                data-hover="cursor"
              >
                pyxis.aura.network ↗
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
      <div className="pf-imgph" data-label="pyxis · multi-sig safe">
        <Image
          src="/projects/pyxis-banner.png"
          alt="Pyxis Safe banner"
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
          The Cosmos interchain had wallets and chains, but{" "}
          <em>nothing that let a team share custody of a treasury</em> — no
          Gnosis Safe equivalent, no shared transaction history, no proposal
          flow that worked across IBC chains.
        </p>
        <div className="dprob__detail pf-reveal">
          <p>
            DAOs and protocol teams on Cosmos were running treasuries out of
            single-signer wallets or multisig modules buried in the SDK with
            no UI. Funds moved via raw CLI commands, every approval was a
            screenshot in a Telegram thread, and rotating a co-owner meant
            redeploying.
          </p>
          <p>
            Aura Network wanted{" "}
            <strong>
              a Cosmos-native Safe — Gnosis-grade UX, but built for IBC
              accounts, CosmWasm contracts, and any chain that speaks the
              standard SDK
            </strong>
            . One product surface to create a safe, propose a transaction,
            collect signatures, and execute on-chain.
          </p>
          <p>
            The job: design and ship the frontend for the safe creation flow,
            transaction proposal and queue, signature collection, asset and
            history views, and a wallet layer that handed off signing to Keplr
            and Coin98 without ever touching a private key.
          </p>
        </div>
      </div>
    </section>
  );
}

function DOutcome() {
  const nums = [
    {
      val: "5",
      unit: "+",
      label: "Cosmos chains supported",
      delta: "Aura, Cosmos Hub, Evmos, IBC-enabled",
      up: true,
    },
    {
      val: "M-of-N",
      unit: "",
      label: "Threshold approvals",
      delta: "co-owners pick the rule on creation",
      up: false,
    },
    {
      val: "0",
      unit: "",
      label: "Private keys touched",
      delta: "all signing handed to user wallet",
      up: true,
    },
    {
      val: "2",
      unit: "",
      label: "Wallets out of the box",
      delta: "Keplr · Coin98",
      up: false,
    },
  ];
  return (
    <section id="outcome" className="dsec">
      <DSecHead
        no="02"
        title="What changed"
        meta="Outcome · since mainnet"
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
    title: "Mapped the Cosmos multisig primitive before the UI.",
    body: "Cosmos has multisig at the SDK level but no shared UX layer. Spent the first sprint inside the auth and bank modules, mapping how threshold accounts get derived, how partial signatures get aggregated, and what the wallet boundary actually was. The proposal flow followed that primitive — not a Gnosis port.",
  },
  {
    no: "02",
    title: "Built the proposal queue as a deterministic state machine.",
    body: (
      <>
        Create → propose → collect signatures → broadcast → confirm. Each
        proposal lives in an explicit state with named transitions, so a
        co-owner who reloads mid-collection sees the same queue, the same
        signers, and the same tx hash — no orphaned drafts.
      </>
    ),
  },
  {
    no: "03",
    title: "Treated the wallet boundary as sacred.",
    body: "Pyxis never sees a private key. Built the signing layer so every transaction is encoded in the app, handed off to Keplr or Coin98 for signing, and only the signed payload comes back. Aggregation happens server-side over signed objects, never raw secrets — the audit story stays simple.",
  },
  {
    no: "04",
    title: "Shipped the assets + history view as one ledger.",
    body: "Co-owners want to know two things on landing: what's in the safe, and what moved. Built a unified ledger that joins balances, IBC denoms, in-flight proposals, and confirmed history in a single read — so opening a safe answers both questions in one scroll.",
  },
  {
    no: "05",
    title: "Extended to EVMOS without forking the codebase.",
    body: "After the Cosmos SDK launch, the next chain was EVMOS — same SDK, different account model. Generalised the chain abstraction so adding a new chain is config + a sign-bytes adapter, not a fork. EVMOS shipped behind the same proposal queue, same UI, same audit surface.",
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
      ["TypeScript", "strict"],
      ["Sass", null],
    ],
  },
  {
    group: "Cosmos",
    chips: [
      ["CosmJS", null],
      ["CosmWasm", null],
      ["Keplr", "wallet"],
      ["Coin98", "wallet"],
    ],
  },
];

function DStack() {
  return (
    <section id="stack" className="dsec">
      <DSecHead
        no="04"
        title="What it’s built on"
        meta="Stack · cosmos · multi-chain"
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
          Cosmos-native multisig with Gnosis-grade UX — five chains, two
          wallets, zero private keys ever held.
        </p>
        <div className="dcoda__attr">— Pyxis Safe · Aura Network, 2023</div>
      </div>
      <div className="dcoda__cta pf-reveal">
        <span className="pf-eyebrow">Treasury or DAO tooling?</span>
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
        href="/dichung"
        label="Dichung"
        className="dnext__link pf-reveal"
        data-hover="cursor"
      >
        Dichung <span className="dnext__link-arrow">↗</span>
      </TransitionLink>
    </section>
  );
}

function DFooter() {
  return (
    <footer className="footer">
      <div className="footer__row">
        <span>© 2026 Sunday · Hanoi / Vietnam</span>
        <span>Built with React, CosmJS &amp; the Cosmos SDK.</span>
      </div>
    </footer>
  );
}

export default function PyxisPage() {
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
