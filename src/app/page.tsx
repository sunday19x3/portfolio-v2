'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCounter, useCursorAndMagnets, useGlobalReveal, useStickyProgress } from '@/components/portfolio/hooks'
import { EmphasizeAround, HoverFlip, MaskLine, SplitText } from '@/components/portfolio/text'
import { Logo } from '@/components/portfolio/Logo'
import { HanoiClock } from '@/components/portfolio/HanoiClock'
import { TransitionLink } from '@/components/TransitionLink'

const SUNDAY = {
  email: 'sunday19x3@gmail.com',
  city: 'Hanoi',
  projects: [
    {
      id: 'mimboku',
      no: '01',
      year: '2025',
      name: 'Mimboku',
      problem:
        'First native liquidity aggregator and top NFT community in Story. Swap tokens or receive ecosystem rewards and bonus yield from staking, LPs, and IP creation.',
      stack: ['Next.js', 'Story Protocol', 'Wagmi'],
      url: 'mimboku.com',
      urlHref: 'https://mimboku.com',
      href: '/mimboku',
      ph: 'mimboku · liquidity aggregator',
      image: '/projects/mimboku.jpeg',
      ratio: undefined,
    },
    {
      id: 'punkga',
      no: '02',
      year: '2024',
      name: 'Punkga.me',
      problem: 'First on-chain Manga UGC multiverse. On-chain Manga IP built on Story Protocol.',
      stack: ['Next.js', 'Tailwind'],
      url: 'punkga.me',
      urlHref: 'https://punkga.me/',
      href: '/punkga',
      image: '/projects/punkga.png',
      ratio: undefined,
      ph: 'punkga · manga multiverse',
    },
    {
      id: 'pyxis',
      no: '03',
      year: '2023',
      name: 'Pyxis Safe',
      problem:
        'Multi-signature safe for the Cosmos interchain. Co-owners share custody of digital assets — M-of-N approval required to move funds.',
      stack: ['React', 'Wagmi', 'Cosmos'],
      url: 'pyxis.aura.network',
      urlHref: 'https://pyxis.aura.network/',
      href: '/pyxis',
      image: '/projects/pyxis.png',
      ratio: undefined,
      ph: 'pyxis · multi-sig safe',
    },
    {
      id: 'dichung',
      no: '04',
      year: '2021 — 2022',
      name: 'Dichung',
      problem:
        'On-demand ride-share and delivery platform across 40+ Vietnamese provinces. Connects passengers for shared trips, airport transfers, and cargo — turning empty seats into shared rides.',
      stack: ['React', 'Sass'],
      url: 'dichung.vn',
      urlHref: 'https://dichung.vn/',
      href: '/dichung',
      image: '/projects/dichung.png',
      ratio: undefined,
      ph: 'dichung · ride-share platform',
    },
  ],
  social: [
    { name: 'GitHub', url: 'github.com/sunday19x3', href: 'https://github.com/sunday19x3' },
    { name: 'Twitter', url: 'x.com/sunday19x3', href: 'https://x.com/sunday19x3' },
    { name: 'LinkedIn', url: 'linkedin.com/in/sunday19x3', href: 'https://www.linkedin.com/in/sunday19x3' },
  ],
}

const TICKER_ROWS: { glyph: string; body: React.ReactNode }[] = [
  {
    glyph: '❡',
    body: (
      <>
        reading <em>Harry Potter and the Goblet of Fire</em> — <span style={{ color: 'var(--fg-muted)' }}>62%</span>
      </>
    ),
  },
  {
    glyph: '✦',
    body: (
      <>
        played badminton — won doubles <em>21–18</em> · Tuesday
      </>
    ),
  },
]

type Deployment = { name: string; host: string; createdAt: number }
type LatestCommit = { sha: string; message: string; repo: string; date: string }

function relTime(ms: number) {
  const diff = Date.now() - ms
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

const STICKY_LINES = [
  { text: 'I build things.', emph: 'build' },
  { text: 'I ship things.', emph: 'ship' },
  { text: 'I maintain them.', emph: 'maintain' },
]

function Nav() {
  return (
    <header className='nav'>
      <span className='nav__mark' aria-label='Sunday'>
        <Logo height={22} />
      </span>
      <nav className='nav__items'>
        <a href='#work' className='pf-underline' data-magnet data-magnet-radius='80' data-magnet-strength='0.25'>
          Work
        </a>
        <a href='#stack' className='pf-underline' data-magnet data-magnet-radius='80' data-magnet-strength='0.25'>
          Stack
        </a>
        <a href='#contact' className='pf-underline' data-magnet data-magnet-radius='80' data-magnet-strength='0.25'>
          Contact
        </a>
      </nav>
      <span className='nav__loc'>
        Hanoi · <HanoiClock />
      </span>
    </header>
  )
}

function Hero() {
  return (
    <section className='hero'>
      <div className='hero__top'>
        <span className='pf-eyebrow'>Portfolio · 2026</span>
        <span className='pf-eyebrow'>№ 001 / Sunday</span>
      </div>
      <div className='hero__center'>
        <h1 className='hero__title' data-hover='text'>
          <SplitText text='Sunday' />
        </h1>
        <p className='hero__manifesto'>
          <MaskLine text='Frontend & Web3 developer, based in Hanoi.' delay={500} />
          <br />
          <MaskLine text='Builds production systems, ships side projects monthly,' delay={620} />
          <br />
          <MaskLine text='prefers clean code over clever code.' delay={740} />
        </p>
      </div>
      <div className='hero__bottom'>
        <div className='hero__cue'>
          <span className='hero__cue-line' />
          <span className='pf-eyebrow'>Scroll · 6 sections</span>
        </div>
        <div className='pf-eyebrow'>Developer · since 2020</div>
      </div>
    </section>
  )
}

function Ticker() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [commit, setCommit] = useState<LatestCommit | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/deployments')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.deployments)) setDeployments(data.deployments)
      })
      .catch(() => {})
    fetch('/api/latest-commit')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LatestCommit | null) => {
        if (!cancelled && data && 'sha' in data) setCommit(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const rows = [
    ...(commit
      ? [
          {
            glyph: '↳',
            body: (
              <>
                shipped{' '}
                <code>
                  <span className='sha'>{commit.sha.slice(0, 4)}···</span> {commit.message}
                </code>{' '}
                <em>· {relTime(+new Date(commit.date))}</em>
              </>
            ),
          },
        ]
      : []),
    ...TICKER_ROWS,
    ...deployments.map((d) => ({
      glyph: '▲',
      body: (
        <>
          deployed <em>{d.host}</em> — <span style={{ color: 'var(--fg-muted)' }}>{relTime(d.createdAt)}</span>
        </>
      ),
    })),
  ]

  const [i, setI] = useState(0)
  useEffect(() => {
    if (rows.length === 0) return
    const id = setInterval(() => setI((v) => (v + 1) % rows.length), 3600)
    return () => clearInterval(id)
  }, [rows.length])
  const trackRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateY(${-i * 30}px)`
    }
  }, [i])
  return (
    <section className='ticker' id='now' aria-label='Now'>
      <div className='ticker__inner'>
        <span className='ticker__label'>
          <span className='pf-signal' aria-hidden>
            <span className='pf-signal__bar' />
            <span className='pf-signal__bar' />
            <span className='pf-signal__bar' />
            <span className='pf-signal__bar' />
          </span>
          <span className='pf-eyebrow'>Now</span>
        </span>
        <div className='ticker__rotor'>
          <div className='ticker__rotor-track' ref={trackRef}>
            {rows.map((r, idx) => (
              <div className='ticker__row' key={idx}>
                <span className='glyph' aria-hidden>
                  {r.glyph}
                </span>
                <span>{r.body}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='ticker__pips' aria-hidden>
          {rows.map((_, idx) => (
            <span key={idx} className={`ticker__pip ${idx === i ? 'is-on' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Project({ p, i }: { p: (typeof SUNDAY.projects)[number]; i: number }) {
  const flipped = i % 2 === 1
  const href = p.href ?? '#'
  const url = p.urlHref ?? '#'
  const mediaImage = (
    <div
      className='pf-imgph'
      data-label={p.ph}
      style={{ '--ratio': p.ratio ?? (flipped ? '5 / 4' : '4 / 3') } as React.CSSProperties}>
      {p.image ? (
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes='(max-width: 1024px) 100vw, 50vw'
          className='pf-imgph__img'
          priority={i === 0}
        />
      ) : (
        <div className='pf-imgph__zoom' />
      )}
    </div>
  )
  return (
    <article
      className={`project pf-project pf-reveal ${flipped ? 'is-flipped' : ''}`}
      style={{ transitionDelay: `${i * 80}ms` }}>
      <TransitionLink href={href} label={p.name} className='project__media' data-hover='cursor'>
        {mediaImage}
      </TransitionLink>
      <div className='project__body'>
        <div className='project__head'>
          <span className='pf-eyebrow'>
            <span className='project__no'>№ {p.no}</span> <span className='project__year'>· {p.year}</span>
          </span>
        </div>
        <h3 className='project__name'>
          <TransitionLink href={href} label={p.name} className='pf-underline flip-link' data-hover='cursor'>
            <HoverFlip text={p.name} />
          </TransitionLink>
        </h3>
        <p className='project__problem'>{p.problem}</p>
        <div className='project__foot'>
          <div className='pf-tags'>
            {p.stack.map((t) => (
              <span key={t} className='pf-tag'>
                {t}
              </span>
            ))}
          </div>
          <TransitionLink href={url} label={p.name} className='project__link pf-underline'>
            {p.url} ↗
          </TransitionLink>
        </div>
      </div>
    </article>
  )
}

function Work() {
  return (
    <section id='work' className='work'>
      <header className='work__head pf-reveal'>
        <span className='pf-eyebrow'>Selected · 2020 — 2026</span>
        <h2 className='work__title'>
          Four <em>things</em> I built.
        </h2>
      </header>
      <div className='work__list'>
        {SUNDAY.projects.map((p, i) => (
          <Project key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  )
}

function Sticky() {
  const ref = useRef<HTMLElement>(null)
  const p = useStickyProgress(ref)
  return (
    <section ref={ref} className='sticky'>
      <div className='sticky__viewport'>
        <div className='sticky__stack'>
          {STICKY_LINES.map((l, i) => {
            const seg = 1 / STICKY_LINES.length
            const center = seg * (i + 0.5)
            const dist = Math.abs(p - center)
            const opacity = Math.max(0, 1 - dist / (seg * 0.85))
            const y = (p - center) * 80
            return (
              <h2 key={i} className='sticky__line' style={{ opacity, transform: `translateY(${-y}px)` }}>
                <EmphasizeAround text={l.text} emph={l.emph} className='sticky__emph' />
              </h2>
            )
          })}
        </div>
        <div className='sticky__rail'>
          {STICKY_LINES.map((_, i) => (
            <span key={i} className={`sticky__tick ${p >= i / STICKY_LINES.length ? 'is-on' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StackKW({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className='stack__kw'
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      data-hover='cursor'>
      <span className='stack__kw-text'>{children}</span>
      <span className={`stack__tip ${open ? 'is-open' : ''}`}>{tip}</span>
    </span>
  )
}

function Stack() {
  return (
    <section id='stack' className='stack'>
      <header className='stack__head pf-reveal'>
        <span className='pf-eyebrow'>Tools I reach for</span>
      </header>
      <p className='stack__copy pf-reveal'>
        Six years writing <StackKW tip='Daily driver since 2020'>TypeScript</StackKW>. Web3 wired through{' '}
        <StackKW tip='Wallet connection · since 2023'>Wagmi</StackKW> on{' '}
        <StackKW tip='Mimboku · Punkga.me'>Story Protocol</StackKW> and{' '}
        <StackKW tip='Pyxis Safe · since 2023'>Cosmos</StackKW>.{' '}
        <StackKW tip='In real production code, not demos'>Claude</StackKW> writes alongside me now — production, not
        demos. <StackKW tip='Default deploy target'>Vercel</StackKW> to ship,{' '}
        <StackKW tip='Default styling · since 2022'>Tailwind</StackKW> to paint, the open web to live on.
      </p>
    </section>
  )
}

function Signal({
  label,
  meta,
  children,
  extra,
}: {
  label: string
  meta: string
  children: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <div className='signal pf-reveal'>
      <span className='pf-eyebrow'>{label}</span>
      {children}
      {extra}
      <span className='signal__meta'>{meta}</span>
    </div>
  )
}

type CalendarDay = {
  date: string
  count: number
  level: number
  weekday: number
}

type Calendar = {
  total: number
  weeks: CalendarDay[][]
}

function computeStreaks(weeks: CalendarDay[][]) {
  const days = weeks.flat().sort((a, b) => a.date.localeCompare(b.date))
  let longest = 0
  let run = 0
  for (const d of days) {
    if (d.count > 0) {
      run += 1
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }
  let current = 0
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].count > 0) current += 1
    else if (i === days.length - 1) continue
    else break
  }
  return { longest, current }
}

function ContributionHeatmap({ data }: { data: Calendar }) {
  const { longest, current } = computeStreaks(data.weeks)
  return (
    <div className='heatmap' aria-label='GitHub contribution calendar'>
      <div className='heatmap__chart'>
        <div className='heatmap__grid'>
          {data.weeks.map((week, wi) => (
            <div key={wi} className='heatmap__col'>
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week.find((d) => d.weekday === di)
                if (!day) return <span key={di} className='heatmap__cell heatmap__cell--empty' />
                return (
                  <span
                    key={di}
                    className='heatmap__cell'
                    data-level={day.level}
                    title={`${day.date} · ${day.count} contribution${day.count === 1 ? '' : 's'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className='heatmap__legend'>
          <span>Less</span>
          <span className='heatmap__cell' data-level={0} />
          <span className='heatmap__cell' data-level={1} />
          <span className='heatmap__cell' data-level={2} />
          <span className='heatmap__cell' data-level={3} />
          <span className='heatmap__cell' data-level={4} />
          <span>More</span>
        </div>
      </div>
      <div className='heatmap__stat'>
        <span className='heatmap__stat-number'>{data.total.toLocaleString()}</span>
        <span className='heatmap__stat-label'>total contributions</span>
        <span className='heatmap__stat-sub'>
          current · {current}d &nbsp;·&nbsp; longest · {longest}d
        </span>
      </div>
    </div>
  )
}

function Signals() {
  const [a, ar] = useCounter(21, 1100)
  const [b, br] = useCounter(18, 1300)
  const [calendar, setCalendar] = useState<Calendar | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/contributions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Calendar | null) => {
        if (!cancelled && data && 'weeks' in data) setCalendar(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return (
    <section className='signals'>
      <header className='signals__head pf-reveal'>
        <span className='pf-eyebrow'>Signals · proof of being alive</span>
      </header>
      <div className='signals__row'>
        <Signal label='Contribution activity' meta={calendar ? 'GitHub · last 12 months' : 'loading…'}>
          {calendar ? (
            <ContributionHeatmap data={calendar} />
          ) : (
            <code className='signal__commit'>fetching from github…</code>
          )}
        </Signal>
        <Signal
          label='Reading'
          meta='J.K. Rowling · 62%'
          extra={
            <span className='signal__bar'>
              <span className='signal__bar-fill' style={{ width: '62%' }} />
            </span>
          }>
          <span className='signal__title'>Harry Potter and the Goblet of Fire</span>
        </Signal>
        <Signal label='Last match' meta='Doubles · Tuesday'>
          <div className='signal__score'>
            <span ref={ar}>{a}</span>
            <span className='signal__sep'>—</span>
            <span ref={br}>{b}</span>
          </div>
        </Signal>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id='contact' className='contact'>
      <span className='pf-eyebrow'>Let&apos;s talk</span>
      <a
        href={`mailto:${SUNDAY.email}`}
        className='contact__mail pf-magnet'
        data-magnet
        data-magnet-radius='240'
        data-magnet-strength='0.34'
        data-hover='cursor'>
        {SUNDAY.email}
        <span className='contact__mail-arrow'>↗</span>
      </a>
      <div className='contact__socials'>
        {SUNDAY.social.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target='_blank'
            rel='noopener noreferrer'
            className='contact__social pf-underline'
            data-magnet
            data-magnet-radius='100'
            data-magnet-strength='0.25'>
            <span className='contact__social-name'>{s.name}</span>
            <span className='contact__social-meta'>{s.url}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className='footer'>
      <div className='footer__row'>
        <span className='pf-eyebrow'>© Sunday — 2026</span>
        <span className='pf-eyebrow'>Built with caffeine in {SUNDAY.city}</span>
      </div>
    </footer>
  )
}

export default function Home() {
  useGlobalReveal()
  useCursorAndMagnets()
  return (
    <>
      <Nav />
      <main className='shell'>
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
  )
}
