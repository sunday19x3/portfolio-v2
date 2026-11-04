import gsap from 'gsap'
import { styleClick } from './style-click'
import { createTypographyPass } from './typography-pass'
import { createLayoutPass } from './layout-pass'

type Box = { left: number; top: number; width: number; height: number }
const padded = (box: Box, amount = 5): Box => ({ left: box.left - amount, top: box.top - amount, width: box.width + amount * 2, height: box.height + amount * 2 })

function measureText(element: HTMLElement) {
  const box = element.getBoundingClientRect()
  const ends: number[] = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let node: Node | null
  while ((node = walker.nextNode())) {
    let offset = 0
    for (const character of Array.from(node.textContent ?? '')) {
      range.setStart(node, offset)
      offset += character.length
      range.setEnd(node, offset)
      ends.push(range.getBoundingClientRect().right)
    }
  }
  return { element, box, ends }
}

export function createWorkHeadingScene(root: HTMLElement, onComplete: () => void) {
  const get = (selector: string) => root.querySelector<HTMLElement>(selector)!
  const context = gsap.context(() => undefined)
  const layout = createLayoutPass(root)
  context.add(layout.prepare)
  const typography = createTypographyPass(get('[data-build-cursor="WorkDesign"]').parentElement!)
  let durationMs = 0
  const header = get('.work__head')
  const title = measureText(get('.work__title'))
  const eyebrow = measureText(get('.pf-eyebrow'))
  const word = get('.work__title em')
  const wordBox = word.getBoundingClientRect()
  const draft = measureText(get('[data-work-draft]'))
  const box = header.getBoundingClientRect()
  const design = get('[data-build-cursor="WorkDesign"]')
  const copy = get('[data-build-cursor="WorkCopy"]')
  const titleFrame = get('[data-build-frame="work-title"]')
  const eyebrowFrame = get('[data-build-frame="work-eyebrow"]')
  const titleCaret = get('[data-work-caret="title"]')
  const eyebrowCaret = get('[data-work-caret="eyebrow"]')
  const divider = get('[data-work-divider]')
  const selection = get('[data-work-selection]')
  const parts = new Map([titleFrame, eyebrowFrame].map(frame => [frame, {
    top: frame.querySelector('[data-edge="top"]')!, bottom: frame.querySelector('[data-edge="bottom"]')!,
    left: frame.querySelector('[data-edge="left"]')!, right: frame.querySelector('[data-edge="right"]')!,
    handle: frame.querySelector('[data-frame-end]')!,
  }]))
  const owned = new Set([title.element, eyebrow.element, word, divider, design, copy])
  const clearOwners = () => {
    typography.cleanup()
    layout.cleanup()
    owned.forEach(element => {
      element.removeAttribute('data-build-owner')
      element.removeAttribute('data-build-phase')
      element.removeAttribute('data-build-task')
      element.removeAttribute('data-build-style-state')
    })
    // Ownership sets and motion tweens both touch opacity; always restore the
    // CSS-hidden cursors, including a Skip in the middle of a typing phase.
    design.style.removeProperty('opacity')
    copy.style.removeProperty('opacity')
  }

  try {
    context.add(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete }).timeScale(0.75)
      gsap.set(header, { borderBottomColor: 'transparent' })
      gsap.set([title.element, eyebrow.element, word], { opacity: 0 })
      gsap.set(word, { attr: { 'data-build-style-state': 'draft' } })
      // The real italic word reserves its final width. A normal-font draft is
      // only paint in the overlay, so applying italic cannot reflow the heading.
      gsap.set(draft.element, { x: wordBox.left, y: title.box.top, scaleX: wordBox.width / draft.box.width, opacity: 0 })
      gsap.set(design, { x: box.left + 8, y: box.top - 24, opacity: 0 })
      gsap.set(copy, { x: title.box.left - 32, y: title.box.top - 38, opacity: 0 })

      const own = (element: HTMLElement, cursor: HTMLElement, task: string, phase: string, at: number) => {
        owned.add(element)
        tl.set(element, { attr: { 'data-build-owner': cursor.dataset.buildCursor!, 'data-build-phase': phase } }, at)
        tl.set(cursor, { opacity: 1, attr: { 'data-build-task': task, 'data-build-phase': phase } }, at)
      }
      const release = (element: HTMLElement, cursor: HTMLElement, at: number) => {
        tl.set(element, { attr: { 'data-build-phase': 'complete' } }, at)
        tl.set(cursor, { opacity: 0, attr: { 'data-build-task': '', 'data-build-phase': 'idle' } }, at)
      }
      const draw = (bounds: Box, cursor: HTMLElement, frame: HTMLElement, at: number) => {
        const edges = parts.get(frame)!
        tl.to(cursor, { x: bounds.left, y: bounds.top, opacity: 1, duration: 0.18 }, at)
        const start = at + 0.18
        tl.set(frame, { x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height, opacity: 1 }, start)
        tl.set([edges.top, edges.bottom], { scaleX: 0, y: 0 }, start)
        tl.set([edges.left, edges.right], { scaleY: 0, x: 0 }, start)
        tl.set(edges.handle, { x: 0, y: 0 }, start)
        tl.to(cursor, { scale: 0.88, duration: 0.06 }, start)
        tl.to(edges.top, { scaleX: 1, duration: 0.26 }, start)
        tl.to(edges.left, { scaleY: 1, duration: 0.26 }, start)
        tl.to(edges.bottom, { scaleX: 1, y: bounds.height, duration: 0.26 }, start)
        tl.to(edges.right, { scaleY: 1, x: bounds.width, duration: 0.26 }, start)
        tl.to(edges.handle, { x: bounds.width, y: bounds.height, duration: 0.26 }, start)
        tl.to(cursor, { x: bounds.left + bounds.width, y: bounds.top + bounds.height, duration: 0.26 }, start)
        tl.to(cursor, { scale: 1, duration: 0.07 }, start + 0.26)
        return start + 0.26
      }
      const type = (text: ReturnType<typeof measureText>, cursor: HTMLElement, caret: HTMLElement, at: number, duration: number, task: string) => {
        own(text.element, cursor, task, 'typing', at)
        const done = typography.type(tl, text.element, cursor, caret, at, duration, {
          onStyled: when => { if (text === title) tl.set(draft.element, { opacity: 1, clipPath: 'none' }, when) },
        })
        release(text.element, cursor, done + 0.08)
        return done + 0.1
      }

      const titleDrawn = draw(padded(title.box), copy, titleFrame, 0.02)
      tl.to(copy, { x: title.box.left + 3, y: title.box.top + title.box.height / 2, duration: 0.15 }, titleDrawn)
      tl.to(copy, { scale: 0.88, duration: 0.06 }, titleDrawn + 0.15)
      tl.to(copy, { x: title.box.left + 24, y: title.box.top - 22, scale: 1, duration: 0.15 }, titleDrawn + 0.21)
      const titleDone = type(title, copy, titleCaret, titleDrawn + 0.36, 1.05, 'work-title')
      tl.to(titleFrame, { opacity: 0, duration: 0.12 }, titleDone)
      tl.to(copy, { y: title.box.top - 42, opacity: 0, duration: 0.2 }, titleDone + 0.12)

      const eyebrowDrawn = draw(padded(eyebrow.box), design, eyebrowFrame, 0.1)
      tl.to(design, { x: eyebrow.box.left + 2, y: eyebrow.box.top + 8, duration: 0.12 }, eyebrowDrawn)
      tl.to(design, { scale: 0.88, duration: 0.06 }, eyebrowDrawn + 0.12)
      tl.to(design, { x: eyebrow.box.left + 16, y: eyebrow.box.top - 28, scale: 1, duration: 0.12 }, eyebrowDrawn + 0.18)
      const eyebrowDone = type(eyebrow, design, eyebrowCaret, eyebrowDrawn + 0.3, 0.52, 'work-eyebrow')
      tl.to(eyebrowFrame, { opacity: 0, duration: 0.12 }, eyebrowDone)
      tl.to(design, { x: box.left, y: box.bottom - 1, duration: 0.18 }, eyebrowDone)
      const lineAt = eyebrowDone + 0.18
      own(divider, design, 'work-divider', 'drawing', lineAt)
      tl.set(divider, { x: box.left, y: box.bottom - 1, width: box.width, scaleX: 0, opacity: 1 }, lineAt)
      tl.to(divider, { scaleX: 1, duration: 0.52, ease: 'none' }, lineAt)
      tl.to(design, { x: box.right, duration: 0.52, ease: 'none' }, lineAt)
      release(divider, design, lineAt + 0.52)
      tl.set(header, { borderBottomColor: 'var(--line)' }, lineAt + 0.52)
      tl.set(divider, { opacity: 0 }, lineAt + 0.52)

      const styleAt = Math.max(titleDone + 0.12, lineAt + 0.52)
      tl.to(design, { x: wordBox.left, y: title.box.top + title.box.height / 2, duration: 0.28 }, styleAt)
      own(word, design, 'work-emphasis', 'styling', styleAt + 0.28)
      tl.set(selection, { x: wordBox.left, y: title.box.top, width: wordBox.width, height: title.box.height, scaleX: 0, opacity: 1 }, styleAt + 0.28)
      tl.to(selection, { scaleX: 1, duration: 0.23, ease: 'none' }, styleAt + 0.28)
      tl.to(design, { x: wordBox.right, duration: 0.23, ease: 'none' }, styleAt + 0.28)
      tl.to(design, { x: wordBox.left + wordBox.width / 2, duration: 0.14 }, styleAt + 0.53)
      const clicked = styleClick(tl, design, styleAt + 0.67)
      tl.set(draft.element, { opacity: 0 }, clicked)
      tl.set(word, { opacity: 1, attr: { 'data-build-style-state': 'applied' } }, clicked)
      tl.to(selection, { opacity: 0, duration: 0.15 }, clicked + 0.18)
      release(word, design, clicked + 0.34)
      tl.to(design, { x: wordBox.right + 20, y: title.box.top - 26, opacity: 0, duration: 0.2 }, clicked + 0.36)
      const layoutDone = layout.play({ timeline: tl, cursor: design, role: 'WorkDesign', at: tl.duration() + 0.05,
        own: (element, _role, task, phase, at) => own(element, design, task, phase, at),
        release: (element, _role, at) => release(element, design, at),
      })
      tl.to(design, { opacity: 0, duration: 0.18 }, layoutDone)
      durationMs = tl.duration() / tl.timeScale() * 1000
    })
  } catch (error) {
    context.revert()
    clearOwners()
    throw error
  }
  return { durationMs, finish: () => { context.revert(); clearOwners() } }
}
