'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCounter, useCursorAndMagnets, useGlobalReveal, useStickyProgress } from '@/components/portfolio/hooks'
import { EmphasizeAround, HoverFlip } from '@/components/portfolio/text'
import { HomeBuildExperience } from '@/components/home-build/HomeBuildExperience'
import { HomeBuildHero } from '@/components/home-build/HomeBuildHero'
import { HomeBuildTicker } from '@/components/home-build/HomeBuildTicker'
import { HomeBuildWorkHeading } from '@/components/home-build/HomeBuildWorkHeading'
import { HomeBuildSection } from '@/components/home-build/HomeBuildSection'
import buildStyles from '@/components/home-build/home-build.module.css'
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

const STICKY_LINES = [
  { text: 'I build things.', emph: 'build' },
  { text: 'I ship things.', emph: 'ship' },
  { text: 'I maintain them.', emph: 'maintain' },
]

function Project({ p, i }: { p: (typeof SUNDAY.projects)[number]; i: number }) {
  const flipped = i % 2 === 1
  const href = p.href ?? '#'
  const url = p.urlHref ?? '#'
  const mediaImage = (
    <div
      className='pf-imgph'
      data-build-media
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
      <span className={buildStyles.projectCaption} data-build-text='caption'>{p.ph}</span>
    </div>
  )
  return (
    <HomeBuildSection id={p.id} kind='project'>
      <article data-build-anchor
        className={`project pf-project pf-reveal ${flipped ? 'is-flipped' : ''}`}
        style={{ transitionDelay: `${i * 80}ms` }}>
        <TransitionLink href={href} label={p.name} className='project__media' data-hover='cursor'>
          {mediaImage}
        </TransitionLink>
        <div className='project__body'>
          <div className='project__head' data-build-text='project-meta'>
            <span className='pf-eyebrow'>
              <span className='project__no'>№ {p.no}</span> <span className='project__year'>· {p.year}</span>
            </span>
          </div>
          <h3 className='project__name' data-build-text='project-title'>
            <TransitionLink href={href} label={p.name} className='pf-underline flip-link' data-hover='cursor'>
              <HoverFlip text={p.name} />
            </TransitionLink>
          </h3>
          <p className='project__problem' data-build-text='project-description'>{p.problem}</p>
          <div className='project__foot' data-build-text='project-links'>
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
    </HomeBuildSection>
  )
}

function Work() {
  return (
    <section id='work' className='work'>
      <HomeBuildWorkHeading />
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
              <HomeBuildSection key={l.emph} id={`sticky${i}`} kind='sticky' trigger='sticky' stickyIndex={i}>
                <h2 className='sticky__line' data-build-anchor style={{ opacity, transform: `translateY(${-y}px)` }}>
                  <span data-build-text='statement'><EmphasizeAround text={l.text} emph={l.emph} className='sticky__emph' /></span>
                </h2>
              </HomeBuildSection>
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
    <HomeBuildSection id='stack' kind='stack'>
      <section id='stack' className='stack' data-build-rule data-build-anchor>
        <header className='stack__head pf-reveal' data-build-text='stack-label'>
          <span className='pf-eyebrow'>Tools I reach for</span>
        </header>
        <p className='stack__copy pf-reveal' data-build-text='stack-copy'>
          Six years writing <StackKW tip='Daily driver since 2020'>TypeScript</StackKW>. Web3 wired through{' '}
          <StackKW tip='Wallet connection · since 2023'>Wagmi</StackKW> on{' '}
          <StackKW tip='Mimboku · Punkga.me'>Story Protocol</StackKW> and{' '}
          <StackKW tip='Pyxis Safe · since 2023'>Cosmos</StackKW>.{' '}
          <StackKW tip='In real production code, not demos'>Claude</StackKW> writes alongside me now — production, not
          demos. <StackKW tip='Default deploy target'>Vercel</StackKW> to ship,{' '}
          <StackKW tip='Default styling · since 2022'>Tailwind</StackKW> to paint, the open web to live on.
        </p>
      </section>
    </HomeBuildSection>
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
    <div className='signal pf-reveal' data-build-anchor data-build-box>
      <span className='pf-eyebrow' data-build-text='signal-label'>{label}</span>
      {children}
      {extra}
      <span className='signal__meta' data-build-text='signal-meta'>{meta}</span>
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
    <div className='heatmap' data-build-visual='heatmap' aria-label='GitHub contribution calendar'>
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
      <div className='heatmap__stat' data-build-text='heatmap-stat'>
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
  const incomingCalendar = useRef<Calendar | null>(null)
  const calendarFrozen = useRef(false)
  const [buildScores, setBuildScores] = useState(false)
  const armScores = useCallback(() => setBuildScores(true), [])
  const freezeCalendar = useCallback(() => { calendarFrozen.current = true }, [])
  const releaseCalendar = useCallback(() => {
    calendarFrozen.current = false
    setCalendar(incomingCalendar.current)
  }, [])
  useEffect(() => {
    let cancelled = false
    fetch('/api/contributions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Calendar | null) => {
        if (!cancelled && data && 'weeks' in data) {
          incomingCalendar.current = data
          if (!calendarFrozen.current) setCalendar(data)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return (
    <section className='signals'>
      <HomeBuildSection id='signalsHeading' kind='heading'>
        <header className='signals__head pf-reveal' data-build-anchor data-build-text='signals-label'>
          <span className='pf-eyebrow'>Signals · proof of being alive</span>
        </header>
      </HomeBuildSection>
      <div className='signals__row'>
        <HomeBuildSection id='activity' kind='activity' onStart={freezeCalendar} onComplete={releaseCalendar}>
          <Signal label='Contribution activity' meta={calendar ? 'GitHub · last 12 months' : 'loading…'}>
            {calendar ? (
              <ContributionHeatmap data={calendar} />
            ) : (
              <code className='signal__commit' data-build-text='activity-fallback'>fetching from github…</code>
            )}
          </Signal>
        </HomeBuildSection>
        <HomeBuildSection id='reading' kind='reading'>
          <Signal
            label='Reading'
            meta='J.K. Rowling · 62%'
            extra={
              <span className='signal__bar' data-build-visual>
                <span className='signal__bar-fill' style={{ width: '62%' }} />
              </span>
            }>
            <span className='signal__title' data-build-text='book'>Harry Potter and the Goblet of Fire</span>
          </Signal>
        </HomeBuildSection>
        <HomeBuildSection id='match' kind='match' onArm={armScores} onStart={armScores}>
          <Signal label='Last match' meta='Doubles · Tuesday'>
            <div className='signal__score' data-build-visual>
              <span ref={ar} data-score-value='21'>{buildScores ? 21 : a}</span>
              <span className='signal__sep'>—</span>
              <span ref={br} data-score-value='18'>{buildScores ? 18 : b}</span>
            </div>
          </Signal>
        </HomeBuildSection>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <HomeBuildSection id='contact' kind='contact'>
      <section id='contact' className='contact' data-build-anchor data-build-rule>
        <span className='pf-eyebrow' data-build-text='contact-label'>Let&apos;s talk</span>
        <a
          href={`mailto:${SUNDAY.email}`}
          className='contact__mail pf-magnet'
          data-magnet
          data-magnet-radius='240'
          data-magnet-strength='0.34'
          data-hover='cursor'>
          <span data-build-text='email'>{SUNDAY.email}</span>
          <span className='contact__mail-arrow' data-build-text='mail-arrow'>↗</span>
        </a>
        <div className='contact__socials'>
          {SUNDAY.social.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target='_blank'
              rel='noopener noreferrer'
              className='contact__social pf-underline'
              data-build-text='social'
              data-magnet
              data-magnet-radius='100'
              data-magnet-strength='0.25'>
              <span className='contact__social-name'>{s.name}</span>
              <span className='contact__social-meta'>{s.url}</span>
            </a>
          ))}
        </div>
      </section>
    </HomeBuildSection>
  )
}

function Footer() {
  return (
    <HomeBuildSection id='footer' kind='footer'>
      <footer className='footer' data-build-anchor data-build-rule>
        <div className='footer__row'>
          <span className='pf-eyebrow' data-build-text='copyright'>© Sunday — 2026</span>
          <span className='pf-eyebrow' data-build-text='colophon'>Built with caffeine in {SUNDAY.city}</span>
        </div>
      </footer>
    </HomeBuildSection>
  )
}

export default function Home() {
  useGlobalReveal()
  useCursorAndMagnets()
  return (
    <HomeBuildExperience>
      <main className='shell'>
        <HomeBuildHero />
        <HomeBuildTicker />
        <Work />
        <Sticky />
        <Stack />
        <Signals />
        <Contact />
        <Footer />
      </main>
    </HomeBuildExperience>
  )
}
