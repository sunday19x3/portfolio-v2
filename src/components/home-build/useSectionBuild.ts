'use client'

import { useLayoutEffect, type RefObject } from 'react'
import { assignCursorNames } from './BuildPrimitives'
import { trackBuildOverlay } from './track-build-overlay'

type Scene = { finish: () => void; durationMs?: number }
export type SceneFactory = (root: HTMLElement, onComplete: () => void) => Scene
// Client memory survives a return from a detail route, but resets on reload.
// Each section runs once per document load, without a persistent session lock.
const seenOnThisLoad = new Set<string>()

export type BuildTrigger = 'viewport' | 'sticky'
const stateKeyFor = (root: HTMLElement) => root.hasAttribute('data-scene-state') ? 'sceneState' : `${root.dataset.scrollBuild}State`

export function useSectionBuild({ rootRef, id, createScene, trigger = 'viewport', onArm, onStart, onComplete }: {
  rootRef: RefObject<HTMLDivElement | null>
  id: string
  trigger?: BuildTrigger
  createScene: SceneFactory
  onArm?: () => void
  onStart?: () => void
  onComplete?: () => void
}) {
  useLayoutEffect(() => {
    const root = rootRef.current!
    const section = root.querySelector<HTMLElement>('[data-build-anchor]')!
    const stateKey = stateKeyFor(root)
    const desktop = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let scene: Scene | undefined
    let scrollFrame = 0
    let stopTracking: (() => void) | undefined
    let fontsReady = false
    let disposed = false
    const eligible = () => desktop.matches && !motion.matches
    const inView = () => {
      const box = section.getBoundingClientRect()
      const intersects = box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth
      // Sticky statements share the same grid cell. Start each one on its
      // first visible frame, rather than starting the transparent lines too.
      return intersects && (trigger !== 'sticky' || Number(getComputedStyle(section).opacity) > 0)
    }

    const finish = (remember = true) => {
      const wasPending = root.dataset[stateKey] !== 'complete'
      cancelAnimationFrame(scrollFrame)
      scene?.finish()
      scene = undefined
      stopTracking?.()
      stopTracking = undefined
      root.dataset[stateKey] = 'complete'
      root.removeAttribute('data-build-hover-lock')
      if (remember && wasPending) seenOnThisLoad.add(id)
      if (!disposed && wasPending) onComplete?.()
    }
    const start = () => {
      if (disposed || !fontsReady || root.dataset[stateKey] !== 'waiting' || !eligible() || !inView()) return
      onStart?.()
      const reserved = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-build]'))
        .filter(other => other !== root && other.dataset[stateKeyFor(other)] === 'playing')
        .flatMap(other => Array.from(other.querySelectorAll('[data-cursor-name]'), name => name.textContent ?? ''))
      reserved.push(...Array.from(document.querySelectorAll('[data-home-build][data-state="playing"] [data-intro-overlay] [data-cursor-name]'), name => name.textContent ?? ''))
      assignCursorNames(root.querySelectorAll<HTMLElement>('[data-build-cursor]'), reserved)
      root.dataset[stateKey] = 'playing'
      seenOnThisLoad.add(id)
      try {
        scene = createScene(root, () => finish())
        stopTracking = trackBuildOverlay(root.querySelector<HTMLElement>('[data-scene-overlay]')!, section, trigger === 'sticky')
      }
      catch (error) { finish(); console.error(`${id} animation could not start.`, error) }
    }
    // No inset, visibility percentage or scroll-settle delay: any overlap starts
    // the full scene. Its canvas follows subsequent scrolling independently.
    const observer = new IntersectionObserver(start, { threshold: 0 })
    observer.observe(section)
    // Sticky opacity is committed by React after its scroll handler. Observe
    // that commit too, so a newly visible line doesn't need another scroll.
    const visibilityObserver = trigger === 'sticky' ? new MutationObserver(start) : undefined
    visibilityObserver?.observe(section, { attributes: true, attributeFilter: ['style'] })

    const onScroll = () => {
      if (root.dataset[stateKey] !== 'waiting') return
      // Read after React updates the sticky statement's opacity for this scroll.
      // This is a frame sync, not a debounce; continuous scrolling still starts it.
      cancelAnimationFrame(scrollFrame)
      scrollFrame = requestAnimationFrame(start)
    }
    const onEligibilityChange = () => { if (!eligible()) finish() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    desktop.addEventListener('change', onEligibilityChange)
    motion.addEventListener('change', onEligibilityChange)

    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const directHome = entry && new URL(entry.name).pathname === '/' && entry.type !== 'back_forward'
    if (eligible() && directHome && !seenOnThisLoad.has(id)) {
      onArm?.()
      root.dataset[stateKey] = 'waiting'
      root.setAttribute('data-build-hover-lock', '')
    }
    const ready = () => {
      clearTimeout(fontDeadline)
      fontsReady = true
      if (!disposed) start()
    }
    const fontDeadline = setTimeout(ready, 500)
    void document.fonts.ready.then(ready, ready)

    return () => {
      disposed = true
      finish(false)
      clearTimeout(fontDeadline)
      observer.disconnect()
      visibilityObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      desktop.removeEventListener('change', onEligibilityChange)
      motion.removeEventListener('change', onEligibilityChange)
    }
  }, [rootRef, id, createScene, trigger, onArm, onStart, onComplete])
}
