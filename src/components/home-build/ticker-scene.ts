import gsap from 'gsap'
import { createTextStylePass } from './text-style-pass'
import { styleClick } from './style-click'
import { createTypographyPass } from './typography-pass'
import { createLayoutPass } from './layout-pass'

type Box = { left: number; top: number; width: number; height: number }
const padded = (box: Box, padding = 4): Box => ({ left: box.left - padding, top: box.top - padding, width: box.width + padding * 2, height: box.height + padding * 2 })

function measureText(element: HTMLElement, visibleRight = Infinity) {
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
      const right = range.getBoundingClientRect().right
      if (right > visibleRight) return { element, box, ends }
      ends.push(right)
    }
  }
  return { element, box, ends }
}

export function createTickerScene(root: HTMLElement, onComplete: () => void) {
  const get = (selector: string) => root.querySelector<HTMLElement>(selector)!
  const context = gsap.context(() => undefined)
  const layout = createLayoutPass(root)
  context.add(layout.prepare)
  const typography = createTypographyPass(get('[data-build-cursor="TickerDesign"]').parentElement!)
  let durationMs = 0
  const section = get('#now')
  const label = get('.ticker__label')
  const labelText = measureText(get('.ticker__label .pf-eyebrow'))
  const rotor = get('.ticker__rotor')
  const row = get('.ticker__row')
  const glyph = row.querySelector<HTMLElement>('.glyph')!
  const pips = get('.ticker__pips')
  const signal = get('.pf-signal')
  const bars = Array.from(signal.children)
  const blue = get('[data-build-cursor="TickerDesign"]')
  const copy = get('[data-build-cursor="TickerCopy"]')
  const regionFrame = get('[data-build-frame="now-region"]')
  const labelFrame = get('[data-build-frame="now-label"]')
  const copyFrame = get('[data-build-frame="now-copy"]')
  const labelCaret = get('[data-now-caret="label"]')
  const copyCaret = get('[data-now-caret="copy"]')
  const selection = get('[data-now-selection]')
  const box = section.getBoundingClientRect()
  const labelBox = label.getBoundingClientRect()
  const rotorBox = rotor.getBoundingClientRect()
  const signalBox = signal.getBoundingClientRect()
  const pipsBox = pips.getBoundingClientRect()
  const body = measureText(row.lastElementChild as HTMLElement, rotorBox.right - 2)
  const accents = Array.from(row.querySelectorAll<HTMLElement>('em, .sha')).map(element => ({ element, box: element.getBoundingClientRect() }))
  const textStyles = createTextStylePass(accents.map(({ element }) => ({ element, kind: 'accent' })), selection.parentElement!)
  const frames = new Map([regionFrame, labelFrame, copyFrame].map(frame => [frame, {
    top: frame.querySelector('[data-edge="top"]')!, bottom: frame.querySelector('[data-edge="bottom"]')!,
    left: frame.querySelector('[data-edge="left"]')!, right: frame.querySelector('[data-edge="right"]')!,
    handle: frame.querySelector('[data-frame-end]')!,
  }]))
  const owned = [blue, copy, labelText.element, body.element, signal, pips, ...accents.map(({ element }) => element)]
  const clearOwners = () => {
    typography.cleanup()
    layout.cleanup()
    textStyles.cleanup()
    owned.forEach(element => {
      element.removeAttribute('data-build-owner')
      element.removeAttribute('data-build-task')
      element.removeAttribute('data-build-phase')
    })
    blue.style.removeProperty('opacity')
    copy.style.removeProperty('opacity')
  }

  try {
    context.add(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete }).timeScale(0.75)
      gsap.set(section, { borderColor: 'transparent', backgroundColor: 'transparent' })
      gsap.set([labelText.element, body.element, glyph, pips, signal], { opacity: 0 })
      gsap.set([labelText.element, body.element], { clipPath: 'inset(0 100% 0 0)' })
      gsap.set(blue, { x: box.left + 24, y: box.top - 24, opacity: 0 })
      gsap.set(copy, { x: rotorBox.left + 64, y: box.bottom + 38, opacity: 0 })
      textStyles.prepare()

      const own = (element: HTMLElement, cursor: HTMLElement, task: string, phase: string, at: number) => {
        owned.push(element)
        timeline.set(element, { attr: { 'data-build-owner': cursor.dataset.buildCursor!, 'data-build-phase': phase } }, at)
        timeline.set(cursor, { opacity: 1, attr: { 'data-build-task': task, 'data-build-phase': phase } }, at)
      }
      const release = (element: HTMLElement, cursor: HTMLElement, at: number) => {
        timeline.set(element, { attr: { 'data-build-phase': 'complete' } }, at)
        timeline.set(cursor, { attr: { 'data-build-task': '', 'data-build-phase': 'idle' } }, at)
      }
      const draw = (bounds: Box, cursor: HTMLElement, frame: HTMLElement, start: number, travel: number, duration: number) => {
        const parts = frames.get(frame)!
        const at = start + travel
        timeline.to(cursor, { x: bounds.left, y: bounds.top, opacity: 1, duration: travel }, start)
        timeline.set(frame, { x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height, opacity: 1 }, at)
        timeline.set([parts.top, parts.bottom], { scaleX: 0, y: 0 }, at)
        timeline.set([parts.left, parts.right], { scaleY: 0, x: 0 }, at)
        timeline.set(parts.handle, { x: 0, y: 0 }, at)
        timeline.to(cursor, { scale: 0.88, duration: 0.06 }, at)
        timeline.to(parts.top, { scaleX: 1, duration }, at)
        timeline.to(parts.left, { scaleY: 1, duration }, at)
        timeline.to(parts.bottom, { scaleX: 1, y: bounds.height, duration }, at)
        timeline.to(parts.right, { scaleY: 1, x: bounds.width, duration }, at)
        timeline.to(parts.handle, { x: bounds.width, y: bounds.height, duration }, at)
        timeline.to(cursor, { x: bounds.left + bounds.width, y: bounds.top + bounds.height, duration }, at)
        timeline.to(cursor, { scale: 1, duration: 0.08 }, at + duration)
        return at + duration
      }
      const type = (field: ReturnType<typeof measureText>, cursor: HTMLElement, caret: HTMLElement, task: string, at: number, duration: number) => {
        own(field.element, cursor, task, 'typing', at)
        const done = typography.type(timeline, field.element, cursor, caret, at, duration)
        release(field.element, cursor, done + 0.08)
        return done + 0.1
      }

      // Create the band first, then populate two independent areas together.
      draw({ left: box.left + 4, top: box.top + 1, width: box.width - 8, height: box.height - 2 }, blue, regionFrame, 0.04, 0.14, 0.34)
      timeline.to(section, { borderColor: 'var(--line)', backgroundColor: 'var(--bg-alt)', duration: 0.16 }, 0.52)
      timeline.to(regionFrame, { opacity: 0, duration: 0.12 }, 0.68)

      const labelDrawn = draw(padded(labelBox), blue, labelFrame, 0.66, 0.22, 0.16)
      timeline.to(blue, { x: labelText.box.left + 1, y: labelText.box.top + labelText.box.height / 2, duration: 0.12 }, labelDrawn)
      timeline.to(blue, { scale: 0.88, duration: 0.06 }, labelDrawn + 0.12)
      timeline.to(blue, { scale: 1, x: labelBox.right + 8, y: box.bottom + 5, duration: 0.12 }, labelDrawn + 0.18)
      const labelDone = type(labelText, blue, labelCaret, 'now-label', labelDrawn + 0.3, 0.2)
      timeline.to(blue, { x: signalBox.left + signalBox.width / 2, y: signalBox.bottom + 7, duration: 0.16 }, labelDone)
      own(signal, blue, 'signal', 'building', labelDone + 0.16)
      timeline.set(signal, { opacity: 1 }, labelDone + 0.16)
      timeline.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.16, stagger: 0.035, immediateRender: false }, labelDone + 0.16)
      release(signal, blue, labelDone + 0.43)
      timeline.to(labelFrame, { opacity: 0, duration: 0.12 }, labelDone + 0.43)
      const indicators = labelDone + 0.46
      timeline.to(blue, { x: pipsBox.left, y: pipsBox.top, duration: 0.42 }, indicators)
      own(pips, blue, 'indicators', 'building', indicators + 0.42)
      timeline.set(pips, { opacity: 1 }, indicators + 0.42)
      timeline.fromTo(Array.from(pips.children), { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.035, immediateRender: false }, indicators + 0.42)
      release(pips, blue, indicators + 0.42 + 0.12 + pips.children.length * 0.035)
      timeline.to(blue, { x: pipsBox.left - 14, y: box.bottom + 24, opacity: 0, duration: 0.2 }, indicators + 0.64 + pips.children.length * 0.035)

      const copyDrawn = draw(padded(rotorBox), copy, copyFrame, 0.54, 0.2, 0.22)
      timeline.to(copy, { x: body.box.left + 1, y: body.box.top + body.box.height / 2, duration: 0.16 }, copyDrawn)
      timeline.to(copy, { scale: 0.88, duration: 0.06 }, copyDrawn + 0.16)
      timeline.to(copy, { x: rotorBox.left + 28, y: box.bottom + 9, scale: 1, duration: 0.16 }, copyDrawn + 0.22)
      timeline.to(glyph, { opacity: 1, duration: 0.12 }, copyDrawn + 0.22)
      const copyDone = type(body, copy, copyCaret, 'now-update', copyDrawn + 0.38, Math.min(1.15, Math.max(0.45, body.ends.length * 0.018)))
      timeline.to(copyFrame, { opacity: 0, duration: 0.12 }, copyDone)
      let styleAt = copyDone + 0.12
      for (const accent of accents) {
        const left = Math.max(rotorBox.left, accent.box.left)
        const right = Math.min(rotorBox.right, accent.box.right)
        if (right <= left) { textStyles.apply(timeline, accent.element, copyDone); continue }
        own(accent.element, copy, 'now-emphasis', 'styling', styleAt)
        timeline.to(copy, { x: left, y: accent.box.top - 6, duration: 0.16 }, styleAt)
        timeline.set(selection, { x: left, y: accent.box.top, width: right - left, height: accent.box.height, opacity: 1, scaleX: 0 }, styleAt + 0.16)
        timeline.to(selection, { scaleX: 1, duration: 0.2, ease: 'none' }, styleAt + 0.16)
        timeline.to(copy, { x: right, duration: 0.2, ease: 'none' }, styleAt + 0.16)
        timeline.to(copy, { x: (left + right) / 2, y: accent.box.top + accent.box.height / 2, duration: 0.12 }, styleAt + 0.36)
        textStyles.apply(timeline, accent.element, styleClick(timeline, copy, styleAt + 0.48))
        timeline.to(selection, { opacity: 0, duration: 0.12 }, styleAt + 0.7)
        release(accent.element, copy, styleAt + 0.9)
        styleAt += 0.92
      }
      timeline.to(copy, { y: box.bottom + 34, opacity: 0, duration: 0.2 }, styleAt)
      const layoutDone = layout.play({ timeline: timeline, cursor: blue, role: 'TickerDesign', at: timeline.duration() + 0.05,
        own: (element, _role, task, phase, at) => own(element, blue, task, phase, at),
        release: (element, _role, at) => release(element, blue, at),
      })
      timeline.to(blue, { opacity: 0, duration: 0.18 }, layoutDone)
      durationMs = timeline.duration() / timeline.timeScale() * 1000
    })
  } catch (error) {
    context.revert()
    clearOwners()
    throw error
  }
  return { durationMs, finish: () => { context.revert(); clearOwners() } }
}
