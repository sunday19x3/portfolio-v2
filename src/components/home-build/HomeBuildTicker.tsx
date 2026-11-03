'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BuildCursor, BuildFrame } from './BuildPrimitives'
import { useTickerBuild } from './useTickerBuild'
import styles from './home-build.module.css'

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
type TickerData = { deployments: Deployment[]; commit: LatestCommit | null }
const EMPTY_DATA: TickerData = { deployments: [], commit: null }

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

export function HomeBuildTicker() {
  const rootRef = useRef<HTMLDivElement>(null)
  const incoming = useRef<TickerData>(EMPTY_DATA)
  const frozen = useRef(false)
  const [data, setData] = useState(EMPTY_DATA)
  const { deployments, commit } = data
  const [i, setI] = useState(0)
  const [rotationReady, setRotationReady] = useState(true)
  const arm = useCallback(() => { setRotationReady(false) }, [])
  const start = useCallback(() => {
    frozen.current = true
    setRotationReady(false)
    setI(0)
  }, [])
  const complete = useCallback(() => {
    frozen.current = false
    setData(incoming.current)
    setRotationReady(true)
  }, [])
  useTickerBuild({ rootRef, onArm: arm, onStart: start, onComplete: complete })

  // Fetch normally from mount; freeze only the rendered snapshot during typing.
  // Slow or unavailable APIs never hold up the scene or require invented data.
  useEffect(() => {
    let cancelled = false
    const publish = () => { if (!frozen.current) setData(incoming.current) }
    fetch('/api/deployments')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && Array.isArray(data?.deployments)) {
          incoming.current = { ...incoming.current, deployments: data.deployments }
          publish()
        }
      }).catch(() => {})
    fetch('/api/latest-commit')
      .then(r => r.ok ? r.json() : null)
      .then((commit: LatestCommit | null) => {
        if (!cancelled && commit && 'sha' in commit) {
          incoming.current = { ...incoming.current, commit }
          publish()
        }
      }).catch(() => {})
    return () => { cancelled = true }
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

  useEffect(() => {
    if (!rotationReady || rows.length === 0) return
    const id = setInterval(() => setI((v) => (v + 1) % rows.length), 3600)
    return () => clearInterval(id)
  }, [rows.length, rotationReady])
  return (
    <div ref={rootRef} className={styles.tickerScope} data-scroll-build='now' data-now-state='complete'>
      <section className='ticker' id='now' data-build-anchor aria-label='Now'>
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
            <div className='ticker__rotor-track' style={{ transform: `translateY(${-i * 30}px)` }}>
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
      <div className={styles.overlay} aria-hidden='true'>
        <div className={styles.overlayCanvas} data-scene-overlay>
          <BuildFrame name='now-region' className={styles.design} />
          <BuildFrame name='now-label' className={styles.design} />
          <BuildFrame name='now-copy' className={styles.copy} />
          <span className={`${styles.heroCaret} ${styles.design}`} data-now-caret='label' />
          <span className={`${styles.heroCaret} ${styles.copy}`} data-now-caret='copy' />
          <span className={styles.workSelection} data-now-selection />
          <BuildCursor role='TickerDesign' />
          <BuildCursor role='TickerCopy' />
        </div>
      </div>
    </div>
  )
}
