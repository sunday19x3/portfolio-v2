'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Logo } from '@/components/portfolio/Logo'
import { HanoiClock } from '@/components/portfolio/HanoiClock'
import { createNavigationScene, type NavigationTargets } from './navigation-scene'
import { createHeroScene, type HeroTargets } from './hero-scene'
import { BuildCursor as ArrowCursor, BuildFrame as HeroFrame, assignCursorNames } from './BuildPrimitives'
import { trackBuildOverlay } from './track-build-overlay'
import styles from './home-build.module.css'

// Reload starts a new build; client-side route returns stay complete.
let introSeenOnThisLoad = false

function BuildText({ text }: { text: string }) {
  return (
    <span className={styles.text} data-build-text>
      <span data-build-source>{text}</span>
      <span className={styles.ink} data-build-ink aria-hidden='true'>
        <span data-build-letters />
        <i className={styles.caret} />
      </span>
    </span>
  )
}

export function HomeBuildExperience({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const target = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!
    const targets: NavigationTargets = {
      header: target('header'), logo: target('[data-build-target="logo"]'),
      menu: target('[data-build-target="menu"]'), clock: target('[data-build-target="clock"]'),
      design: target('[data-build-cursor="Design"]'), copy: target('[data-build-cursor="Copy"]'),
      build: target('[data-build-cursor="Build"]'),
      region: target('[data-build-region]'),
      designSelection: target('[data-build-selection="design"]'),
      copySelection: target('[data-build-selection="copy"]'),
      buildSelection: target('[data-build-selection="build"]'), divider: target('[data-build-divider]'),
    }
    const heroTargets: HeroTargets = {
      hero: target('[data-build-hero]'),
      titleCursor: target('[data-build-cursor="HeroTitle"]'),
      copyCursor: target('[data-build-cursor="HeroCopy"]'),
      topCursor: target('[data-build-cursor="HeroTop"]'),
      bottomCursor: target('[data-build-cursor="HeroBottom"]'),
      titleFrame: target('[data-build-frame="title"]'),
      copyRegion: target('[data-build-frame="region"]'),
      copyFrame: target('[data-build-frame="copy"]'),
      topFrame: target('[data-build-frame="top"]'),
      bottomFrame: target('[data-build-frame="bottom"]'),
      titleCaret: target('[data-hero-caret="title"]'),
      copyCaret: target('[data-hero-caret="copy"]'),
      topCaret: target('[data-hero-caret="top"]'),
      bottomCaret: target('[data-hero-caret="bottom"]'),
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    const scenes: { finish: () => void; durationMs?: number }[] = []
    let disposed = false
    let pending = false
    const trackers: (() => void)[] = []
    let fontDeadline: ReturnType<typeof setTimeout> | undefined

    const finish = () => {
      pending = false
      scenes.splice(0).forEach(scene => scene.finish())
      trackers.splice(0).forEach(stop => stop())
      root.dataset.state = 'complete'
      targets.header.removeAttribute('data-build-hover-lock')
    }

    const play = () => {
      finish()
      if (disposed || motion.matches || !desktop.matches) return
      assignCursorNames(root.querySelectorAll<HTMLElement>('[data-intro-overlay] [data-build-cursor]'))
      introSeenOnThisLoad = true
      root.dataset.state = 'playing'
      targets.header.setAttribute('data-build-hover-lock', '')
      // Both scenes start in the same frame; neither can finish the other early.
      let completed = 0
      const onComplete = () => { if (++completed === 2) finish() }
      try {
        scenes.push(createNavigationScene(targets, onComplete))
        scenes.push(createHeroScene(heroTargets, onComplete))
        trackers.push(trackBuildOverlay(target('[data-nav-overlay]'), targets.header))
        trackers.push(trackBuildOverlay(target('[data-hero-overlay]'), heroTargets.hero))
      } catch (error) { finish(); console.error('Home animation could not start.', error) }
    }
    const onEligibilityChange = () => {
      if (motion.matches || !desktop.matches) finish()
    }
    motion.addEventListener('change', onEligibilityChange)
    desktop.addEventListener('change', onEligibilityChange)

    // A client-side return from a detail page must not play beneath its transition.
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const directHome = entry && new URL(entry.name).pathname === '/' && entry.type !== 'back_forward'
    if (directHome && !introSeenOnThisLoad && !location.hash && window.scrollY < 8 && !motion.matches && desktop.matches) {
      pending = true
      root.dataset.state = 'preparing'
      targets.header.setAttribute('data-build-hover-lock', '')
      const fontsReady = Promise.race([
        document.fonts.ready,
        new Promise<void>(resolve => { fontDeadline = setTimeout(resolve, 500) }),
      ])
      void fontsReady.then(() => {
        clearTimeout(fontDeadline)
        if (!disposed && pending) play()
      }, finish)
    }

    return () => {
      disposed = true
      finish()
      clearTimeout(fontDeadline)
      motion.removeEventListener('change', onEligibilityChange)
      desktop.removeEventListener('change', onEligibilityChange)
    }
  }, [])

  return (
    <div ref={rootRef} className={styles.scope} data-home-build='intro' data-state='complete'>
      <header className='nav'>
        <span className='nav__mark' aria-label='Sunday' data-build-target='logo'>
          <Logo height={22} />
        </span>
        <nav className='nav__items' aria-label='Main navigation' data-build-target='menu'>
          <a href='#work' className='pf-underline' data-magnet data-magnet-radius='80' data-magnet-strength='0.25'><BuildText text='Work' /></a>
          <a href='#stack' className='pf-underline' data-magnet data-magnet-radius='80' data-magnet-strength='0.25'><BuildText text='Stack' /></a>
          <a href='#contact' className='pf-underline' data-magnet data-magnet-radius='80' data-magnet-strength='0.25'><BuildText text='Contact' /></a>
        </nav>
        <span className={`nav__loc ${styles.clock}`} data-build-target='clock'><BuildText text='Hanoi · ' /><span data-build-live><HanoiClock /></span></span>
      </header>
      {children}
      <div className={styles.overlay} aria-hidden='true'>
        <div className={styles.overlayCanvas} data-intro-overlay data-nav-overlay>
          <span className={styles.divider} data-build-divider />
          <span className={`${styles.selection} ${styles.design}`} data-build-region />
          <span className={`${styles.selection} ${styles.design}`} data-build-selection='design' />
          <span className={`${styles.selection} ${styles.copy}`} data-build-selection='copy' />
          <span className={`${styles.selection} ${styles.build}`} data-build-selection='build' />
          <ArrowCursor role='Design' />
          <ArrowCursor role='Copy' />
          <ArrowCursor role='Build' />
        </div>
      </div>
      <div className={styles.overlay} aria-hidden='true'>
        <div className={styles.overlayCanvas} data-intro-overlay data-hero-overlay>
          <HeroFrame name='title' className={styles.heroTitle} />
          <HeroFrame name='region' className={styles.heroCopy} />
          <HeroFrame name='copy' className={styles.heroCopy} />
          <HeroFrame name='top' className={styles.heroTop} />
          <HeroFrame name='bottom' className={styles.heroBottom} />
          <span className={`${styles.heroCaret} ${styles.heroTitle}`} data-hero-caret='title' />
          <span className={`${styles.heroCaret} ${styles.heroCopy}`} data-hero-caret='copy' />
          <span className={`${styles.heroCaret} ${styles.heroTop}`} data-hero-caret='top' />
          <span className={`${styles.heroCaret} ${styles.heroBottom}`} data-hero-caret='bottom' />
          <ArrowCursor role='HeroTitle' />
          <ArrowCursor role='HeroCopy' />
          <ArrowCursor role='HeroTop' />
          <ArrowCursor role='HeroBottom' />
        </div>
      </div>
    </div>
  )
}
