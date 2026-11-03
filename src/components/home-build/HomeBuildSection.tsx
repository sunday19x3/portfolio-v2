'use client'

import { Fragment, useRef, type ReactNode } from 'react'
import { BuildCursor, BuildFrame } from './BuildPrimitives'
import { SCENE_ROLES, SECTION_SCENES, type SectionKind } from './section-scenes'
import { useSectionBuild, type BuildTrigger } from './useSectionBuild'
import styles from './home-build.module.css'

const ROLE_COLORS = { SceneDesign: styles.design, SceneCopy: styles.copy, SceneBuild: styles.build, SceneDetail: styles.heroTitle }
export function HomeBuildSection({ id, kind, trigger = 'viewport', stickyIndex, onArm, onStart, onComplete, children }: {
  id: string
  kind: SectionKind
  trigger?: BuildTrigger
  stickyIndex?: number
  onArm?: () => void
  onStart?: () => void
  onComplete?: () => void
  children: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  useSectionBuild({ rootRef, id, trigger, createScene: SECTION_SCENES[kind], onArm, onStart, onComplete })
  return (
    <div ref={rootRef} className={styles.sectionScope} data-scroll-build={id} data-scene-state='complete' data-scene-kind={kind} data-build-trigger={trigger} data-sticky-index={stickyIndex}>
      {children}
      <div className={`${styles.overlay} ${styles.sceneOverlay}`} aria-hidden='true'>
        <div className={styles.overlayCanvas} data-scene-overlay>
          {SCENE_ROLES[kind].map(role => (
            <Fragment key={role}>
              <BuildFrame name={role} className={ROLE_COLORS[role]} />
              <span className={`${styles.heroCaret} ${ROLE_COLORS[role]}`} data-scene-caret={role} />
              <span className={styles.divider} data-scene-rule={role} />
              <span className={styles.workSelection} data-scene-selection={role} />
              <BuildCursor role={role} />
            </Fragment>
          ))}
          {kind === 'project' && <>
            <span className={styles.generationTiles} data-generation-tiles>{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</span>
            <span className={styles.generationStatus} data-generation-status>Generating image <span data-generation-progress>0</span>%</span>
          </>}
        </div>
      </div>
    </div>
  )
}
