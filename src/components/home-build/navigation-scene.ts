import gsap from 'gsap'
import { exitCursor } from './cursor-exit'
import { createTaskCursors } from './task-cursors'
import { createTypographyPass } from './typography-pass'
import { createLayoutPass } from './layout-pass'

export type NavigationTargets = {
  header: HTMLElement
  logo: HTMLElement
  menu: HTMLElement
  clock: HTMLElement
  design: HTMLElement
  copy: HTMLElement
  build: HTMLElement
  region: HTMLElement
  designSelection: HTMLElement
  copySelection: HTMLElement
  buildSelection: HTMLElement
  divider: HTMLElement
}

type Box = { left: number; top: number; width: number; height: number }

export function createNavigationScene(targets: NavigationTargets, onComplete: () => void) {
  const { header, logo, menu, clock, design, copy, build, region, designSelection, copySelection, buildSelection, divider } = targets
  const context = gsap.context(() => undefined)
  // Measure both final gaps before either draft offset is applied.
  const layouts = [createLayoutPass(header, 'navigation'), createLayoutPass(header, 'navigation-contact')]
  layouts.forEach(layout => context.add(layout.prepare))
  const spacingWorkers = createTaskCursors(design.parentElement!)
  const typography = createTypographyPass(design.parentElement!)
  const clockCaret = typography.caret()
  let durationMs = 0
  const owned = new Set<HTMLElement>([menu, clock, design, copy, build])
  const headerBox = header.getBoundingClientRect()
  const logoBox = logo.getBoundingClientRect()
  const menuBox = menu.getBoundingClientRect()
  const clockBox = clock.getBoundingClientRect()
  const logoSvg = logo.querySelector('svg')!
  const logoPath = logoSvg.querySelector('path')!
  const svgBox = logoSvg.getBoundingClientRect()
  const pathLength = logoPath.getTotalLength()
  // Sample the vector once; tracing never reads layout during a frame.
  const trace = Array.from({ length: 41 }, (_, index) => {
    const point = logoPath.getPointAtLength(pathLength * index / 40)
    return { x: svgBox.left + point.x * svgBox.width / 1000, y: svgBox.top + point.y * svgBox.height / 485 }
  })
  const clearLetters = () => {
    typography.cleanup()
    layouts.forEach(layout => layout.cleanup())
    spacingWorkers.cleanup()
    for (const node of owned) {
      node.removeAttribute('data-build-owner'); node.removeAttribute('data-build-phase'); node.removeAttribute('data-build-task')
    }
  }

  try {
    context.add(() => {
      // Slow the entire scene together so cursor tips, frames and typing stay aligned.
      const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete }).timeScale(0.75)
      gsap.set([logo, menu, clock], { opacity: 0 })
      gsap.set(header, { borderBottomColor: 'transparent' })
      gsap.set(divider, { x: 0, y: headerBox.bottom - 1, width: headerBox.width, opacity: 0 })
      gsap.set(design, { x: 88, y: headerBox.bottom + 52, opacity: 0 })
      gsap.set(copy, { x: menuBox.left + 50, y: headerBox.bottom + 70, opacity: 0 })
      gsap.set(build, { x: clockBox.left - 36, y: headerBox.bottom + 66, opacity: 0 })

      // Only the empty frame grows. Finished content always stays at its real position.
      const drawBox = (box: Box, cursor: HTMLElement, frame: HTMLElement, start: number, travel: number, draw: number) => {
        timeline.to(cursor, { x: box.left, y: box.top, opacity: 1, duration: travel }, start)
        timeline.set(frame, { x: box.left, y: box.top, width: 0, height: 0, opacity: 1 }, start + travel)
        timeline.to(cursor, { scale: 0.88, duration: 0.07 }, start + travel)
        timeline.to(frame, { width: box.width, height: box.height, duration: draw }, start + travel)
        timeline.to(cursor, { x: box.left + box.width, y: box.top + box.height, duration: draw }, start + travel)
        timeline.to(cursor, { scale: 1, duration: 0.08 }, start + travel + draw)
        return start + travel + draw
      }
      const padded = (box: Box, padding = 5): Box => ({
        left: box.left - padding, top: box.top - padding,
        width: box.width + padding * 2, height: box.height + padding * 2,
      })

      // 1. Establish the empty navigation region.
      drawBox({ left: 4, top: 4, width: headerBox.width - 8, height: headerBox.height - 8 }, design, region, 0.05, 0.2, 0.55)
      timeline.to(divider, { opacity: 1, duration: 0.15 }, 0.8)
      timeline.to(region, { opacity: 0, duration: 0.2 }, 1.08)

      // 2. Create the logo's frame, then trace and fill the existing vector inside it.
      drawBox(padded(logoBox), design, designSelection, 0.95, 0.22, 0.25)
      gsap.set(logoPath, {
        stroke: 'currentColor', strokeWidth: 24, strokeLinejoin: 'round',
        fillOpacity: 0, strokeDasharray: pathLength, strokeDashoffset: pathLength,
      })
      timeline.set(logo, { opacity: 1 }, 1.46)
      timeline.to(design, { ...trace[0], duration: 0.12 }, 1.46)
      timeline.to(logoPath, { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, 1.58)
      for (let index = 1; index < trace.length; index++) {
        timeline.to(design, { ...trace[index], duration: 0.6 / 40, ease: 'none' }, 1.58 + (index - 1) * 0.6 / 40)
      }
      timeline.to(logoPath, { fillOpacity: 1, strokeOpacity: 0, duration: 0.18 }, 2.18)
      timeline.to(designSelection, { opacity: 0, duration: 0.15 }, 2.4)
      exitCursor(timeline, design, 2.55)

      const own = (element: HTMLElement, cursor: HTMLElement, task: string, phase: string, at: number) => {
        owned.add(element)
        timeline.set(element, { attr: { 'data-build-owner': cursor.dataset.taskCursor ?? cursor.dataset.buildCursor!, 'data-build-phase': phase } }, at)
        timeline.set(cursor, { opacity: 1, attr: { 'data-build-task': task, 'data-build-phase': phase } }, at)
      }
      const release = (element: HTMLElement, cursor: HTMLElement, at: number) => {
        timeline.set(element, { attr: { 'data-build-phase': 'complete' } }, at)
        exitCursor(timeline, cursor, at)
        timeline.set(cursor, { attr: { 'data-build-phase': 'idle', 'data-build-task': '' } }, at)
      }
      const menuDrawn = drawBox(padded(menuBox, 5), copy, copySelection, 1.02, 0.2, 0.24)
      const links = Array.from(menu.querySelectorAll<HTMLElement>('a'))
      gsap.set(links, { opacity: 0 })
      timeline.set(menu, { opacity: 1 }, menuDrawn)
      // Work, Stack and Contact are separate editable fields, typed together.
      const menuEnd = Math.max(...links.map((link, index) => typography.type(
        timeline, link, copy, typography.caret(), menuDrawn + 0.1 + index * 0.035, 0.55,
      )))
      timeline.to(copySelection, { opacity: 0, duration: 0.1 }, menuEnd)
      release(menu, copy, menuEnd)

      const clockDrawn = drawBox(padded(clockBox), build, buildSelection, 1.2, 0.2, 0.24)
      own(clock, build, 'hanoi-clock', 'typing', clockDrawn)
      const clockEnd = typography.type(timeline, clock, build, clockCaret, clockDrawn + 0.1, 0.65)
      timeline.to(buildSelection, { opacity: 0, duration: 0.1 }, clockEnd)
      release(clock, build, clockEnd)
      exitCursor(timeline, build, clockEnd + 0.1)
      const spacingAt = Math.max(menuEnd, clockEnd) + 0.15
      layouts.forEach((layout, index) => {
        const target = links[index + 1]
        const cursor = spacingWorkers.create(index === 0 ? 'adjust Work–Stack gap' : 'adjust Stack–Contact gap', target)
        layout.play({ timeline, cursor, role: cursor.dataset.taskCursor!, at: spacingAt,
          own: (element, _role, _task, phase, at) => {
            const box = element.getBoundingClientRect()
            spacingWorkers.start(timeline, cursor, at, box.left, box.top)
            own(element, cursor, cursor.dataset.buildTask!, phase, at)
          },
          release: (element, _role, at) => {
            timeline.set(element, { attr: { 'data-build-phase': 'complete' } }, at)
            spacingWorkers.end(timeline, cursor, at)
          },
        })
      })
      durationMs = timeline.duration() / timeline.timeScale() * 1000

    })
  } catch (error) {
    context.revert()
    clearLetters()
    throw error
  }

  return { durationMs, finish: () => { context.revert(); clearLetters() } }
}
