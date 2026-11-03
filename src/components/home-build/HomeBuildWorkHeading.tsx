'use client'

import { useRef } from 'react'
import { BuildCursor, BuildFrame } from './BuildPrimitives'
import { useSectionBuild } from './useSectionBuild'
import { createWorkHeadingScene } from './work-heading-scene'
import styles from './home-build.module.css'

export function HomeBuildWorkHeading() {
  const rootRef = useRef<HTMLDivElement>(null)
  useSectionBuild({ rootRef, id: 'work', createScene: createWorkHeadingScene })

  return (
    <div ref={rootRef} className={styles.workScope} data-scroll-build='work' data-work-state='complete'>
      <header className='work__head pf-reveal' data-build-anchor>
        <span className='pf-eyebrow'>Selected · 2020 — 2026</span>
        <h2 className='work__title'>Four <em>things</em> I built.</h2>
      </header>
      <div className={styles.overlay} aria-hidden='true'>
        <div className={styles.overlayCanvas} data-scene-overlay>
          <BuildFrame name='work-title' className={styles.copy} />
          <BuildFrame name='work-eyebrow' className={styles.design} />
          <span className={`${styles.heroCaret} ${styles.copy}`} data-work-caret='title' />
          <span className={`${styles.heroCaret} ${styles.design}`} data-work-caret='eyebrow' />
          <span className={styles.workDraft} data-work-draft>things</span>
          <span className={styles.workSelection} data-work-selection />
          <span className={styles.divider} data-work-divider />
          <BuildCursor role='WorkDesign' />
          <BuildCursor role='WorkCopy' />
        </div>
      </div>
    </div>
  )
}
