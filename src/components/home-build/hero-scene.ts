import gsap from 'gsap'
import { exitCursor } from './cursor-exit'
import { createTaskCursors } from './task-cursors'
import { styleClick } from './style-click'
import { createTypographyPass } from './typography-pass'
import { createLayoutPass } from './layout-pass'

export type HeroTargets = {
  hero: HTMLElement
  titleCursor: HTMLElement
  copyCursor: HTMLElement
  topCursor: HTMLElement
  bottomCursor: HTMLElement
  titleFrame: HTMLElement
  copyRegion: HTMLElement
  copyFrame: HTMLElement
  topFrame: HTMLElement
  bottomFrame: HTMLElement
  titleCaret: HTMLElement
  copyCaret: HTMLElement
  topCaret: HTMLElement
  bottomCaret: HTMLElement
}

type Box = { left: number; top: number; width: number; height: number }

function padded(box: Box, padding = 5): Box {
  return { left: box.left - padding, top: box.top - padding, width: box.width + padding * 2, height: box.height + padding * 2 }
}

// Read character boundaries once. The original text keeps its layout and remains
// accessible; only its painted portion changes while the caret advances.
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

export function createHeroScene(targets: HeroTargets, onComplete: () => void) {
  const { hero, titleCursor, copyCursor, topCursor, bottomCursor, titleFrame, copyRegion, copyFrame, topFrame, bottomFrame, titleCaret, topCaret, bottomCaret } = targets
  const context = gsap.context(() => undefined)
  const layout = createLayoutPass(hero, 'hero')
  context.add(layout.prepare)
  const typography = createTypographyPass(titleCursor.parentElement!)
  const workers = createTaskCursors(titleCursor.parentElement!)
  const extraFrames = new Set<HTMLElement>()
  let durationMs = 0
  const chars = Array.from(hero.querySelectorAll<HTMLElement>('.pf-split-char'))
  const charBoxes = chars.map(char => char.getBoundingClientRect())
  const first = charBoxes[0]
  const last = charBoxes[charBoxes.length - 1]
  // v2's tight .86 line-height lets the y descender paint below the line box.
  // Include that ink in the temporary frame without changing the real layout.
  const descent = first.height * 0.08
  const titleBox = { left: first.left, top: first.top, width: last.right - first.left, height: first.height + descent }
  const accentBox = { left: last.left, top: last.top, width: last.width, height: last.height + descent }
  const paragraphBox = hero.querySelector('.hero__manifesto')!.getBoundingClientRect()
  const paragraph = hero.querySelector<HTMLElement>('.hero__manifesto')!
  const lines = Array.from(hero.querySelectorAll<HTMLElement>('.pf-mask')).map(measureText)
  const label = (name: string) => measureText(hero.querySelector<HTMLElement>(`[data-hero-text="${name}"]`)!)
  const edition = label('edition')
  const number = label('number')
  const scroll = label('scroll')
  const since = label('since')
  const fields = [edition, number, ...lines, scroll, since]
  const ownershipNodes = [...chars, paragraph, ...fields.map(field => field.element), titleCursor, copyCursor, topCursor, bottomCursor]
  const clearOwnership = () => { workers.cleanup(); extraFrames.forEach(frame => frame.remove()); typography.cleanup(); layout.cleanup(); ownershipNodes.forEach(element => {
    element.removeAttribute('data-build-owner')
    element.removeAttribute('data-build-phase')
    element.removeAttribute('data-build-task')
    element.removeAttribute('data-build-style-state')
  }) }
  const cue = hero.querySelector<HTMLElement>('.hero__cue-line')!
  const cueBox = cue.getBoundingClientRect()
  const frameParts = new Map([titleFrame, copyRegion, copyFrame, topFrame, bottomFrame].map(frame => [frame, {
    top: frame.querySelector('[data-edge="top"]')!,
    right: frame.querySelector('[data-edge="right"]')!,
    bottom: frame.querySelector('[data-edge="bottom"]')!,
    left: frame.querySelector('[data-edge="left"]')!,
    end: frame.querySelector('[data-frame-end]')!,
  }]))

  try {
    context.add(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete }).timeScale(0.75)
      gsap.set(chars, { opacity: 0 })
      gsap.set(chars[chars.length - 1], { color: 'var(--fg)', attr: { 'data-build-style-state': 'draft' } })
      gsap.set(fields.map(field => field.element), { opacity: 0, clipPath: 'inset(0 100% 0 0)' })
      gsap.set(cue, { opacity: 0, scaleX: 0, transformOrigin: 'left center' })
      gsap.set(titleCursor, { x: titleBox.left + 90, y: titleBox.top - 48, opacity: 0 })
      gsap.set(copyCursor, { x: paragraphBox.left + 110, y: paragraphBox.top + 80, opacity: 0 })
      gsap.set(topCursor, { x: edition.box.left + 100, y: edition.box.top + 36, opacity: 0 })
      gsap.set(bottomCursor, { x: cueBox.left + 100, y: cueBox.top - 40, opacity: 0 })

      // One owner per active task. Ownership lasts through typing and cleanup,
      // so a cursor never starts another job while its content is still forming.
      const own = (cursor: HTMLElement, elements: HTMLElement[], task: string, at: number, phase = 'typing') => {
        const owner = cursor.dataset.taskCursor ?? cursor.dataset.buildCursor!
        timeline.set(cursor, { opacity: 1, attr: { 'data-build-task': task, 'data-build-phase': phase } }, at)
        timeline.set(elements, { attr: { 'data-build-owner': owner, 'data-build-phase': phase } }, at)
      }
      const release = (cursor: HTMLElement, elements: HTMLElement[], at: number) => {
        timeline.set(elements, { attr: { 'data-build-phase': 'complete' } }, at)
        exitCursor(timeline, cursor, at)
        timeline.set(cursor, { attr: { 'data-build-task': '', 'data-build-phase': 'idle' } }, at)
      }

      // The four edges grow with transforms. Content and layout never resize.
      const drawBox = (box: Box, cursor: HTMLElement, frame: HTMLElement, start: number, travel = 0.35, draw = 0.3) => {
        const parts = frameParts.get(frame)!
        const begin = start + travel
        timeline.to(cursor, { x: box.left, y: box.top, opacity: 1, duration: travel }, start)
        timeline.set(frame, { x: box.left, y: box.top, width: box.width, height: box.height, opacity: 1 }, begin)
        timeline.set([parts.top, parts.bottom], { scaleX: 0, y: 0 }, begin)
        timeline.set([parts.left, parts.right], { scaleY: 0, x: 0 }, begin)
        timeline.set(parts.end, { x: 0, y: 0 }, begin)
        timeline.to(cursor, { scale: 0.88, duration: 0.07 }, begin)
        timeline.to(parts.top, { scaleX: 1, duration: draw }, begin)
        timeline.to(parts.left, { scaleY: 1, duration: draw }, begin)
        timeline.to(parts.bottom, { scaleX: 1, y: box.height, duration: draw }, begin)
        timeline.to(parts.right, { scaleY: 1, x: box.width, duration: draw }, begin)
        timeline.to(parts.end, { x: box.width, y: box.height, duration: draw }, begin)
        timeline.to(cursor, { x: box.left + box.width, y: box.top + box.height, duration: draw }, begin)
        timeline.to(cursor, { scale: 1, duration: 0.08 }, begin + draw)
        return begin + draw
      }
      const click = (cursor: HTMLElement, x: number, y: number, start: number, travel: number, applyStyle = false) => {
        timeline.to(cursor, { x, y, duration: travel }, start)
        if (applyStyle) return styleClick(timeline, cursor, start + travel)
        timeline.to(cursor, { scale: 0.88, duration: 0.06 }, start + travel)
        timeline.to(cursor, { scale: 1, duration: 0.08 }, start + travel + 0.06)
        return start + travel + 0.14
      }
      const type = (field: ReturnType<typeof measureText>, cursor: HTMLElement, frame: HTMLElement, caret: HTMLElement, start: number, interval: number, travel = 0.35) => {
        const { element, box, ends } = field
        cursor = workers.create(`frame ${element.dataset.heroText}`, element)
        workers.start(timeline, cursor, start, box.left, box.top)
        frame = frame.cloneNode(true) as HTMLElement
        frame.removeAttribute('data-build-frame')
        titleCursor.parentElement!.append(frame)
        extraFrames.add(frame)
        frameParts.set(frame, {
          top: frame.querySelector('[data-edge="top"]')!, right: frame.querySelector('[data-edge="right"]')!,
          bottom: frame.querySelector('[data-edge="bottom"]')!, left: frame.querySelector('[data-edge="left"]')!,
          end: frame.querySelector('[data-frame-end]')!,
        })
        const framed = drawBox(padded(box), cursor, frame, start, travel, 0.18)
        const clicked = click(cursor, box.left + 1, box.top + box.height / 2, framed + 0.05, 0.2)
        // Park just beneath this label, with the name opening inward. Start
        // typing only once the owner is in place, not while it flies elsewhere.
        timeline.to(cursor, { x: box.right, y: cursor === bottomCursor ? box.top - 9 : box.bottom + 9, duration: 0.2 }, clicked)
        const typing = clicked + 0.2
        own(cursor, [element], element.dataset.heroText!, typing)
        const end = typography.type(timeline, element, cursor, caret, typing, ends.length * interval)
        timeline.to(frame, { opacity: 0, duration: 0.15 }, end + 0.1)
        release(cursor, [element], end + 0.25)
        return end + 0.25
      }

      // Title collaborator starts while the navigation region is being drawn.
      const titleFramed = drawBox(padded(titleBox, 6), titleCursor, titleFrame, 0.08, 0.4, 0.72)
      const titleClicked = click(titleCursor, first.left + 2, first.top + first.height / 2, titleFramed + 0.12, 0.5)
      timeline.to(titleCursor, { x: first.left + 12, y: first.top - 9, duration: 0.22 }, titleClicked)
      const titleTyping = titleClicked + 0.22
      own(titleCursor, chars, 'title', titleTyping)
      const titleTyped = typography.type(timeline, hero.querySelector<HTMLElement>('.hero__title')!, titleCursor, titleCaret, titleTyping, 0.7, {
        onStyled: at => timeline.set(chars, { opacity: 1 }, at),
      })
      timeline.to(titleFrame, { opacity: 0, duration: 0.15 }, titleTyped)
      release(titleCursor, chars, titleTyped + 0.15)

      // Select the final letter and apply the existing v2 accent in place.
      own(titleCursor, [chars[chars.length - 1]], 'accent', titleTyped + 0.36, 'styling')
      const selected = drawBox(padded(accentBox, 5), titleCursor, titleFrame, titleTyped + 0.36, 0.55, 0.3)
      const colored = click(titleCursor, last.left + last.width / 2, last.top + last.height / 2, selected + 0.1, 0.22, true)
      timeline.to(chars[chars.length - 1], { color: 'var(--accent)', duration: 0.22 }, colored)
      timeline.set(chars[chars.length - 1], { attr: { 'data-build-style-state': 'applied' } }, colored)
      timeline.to(titleFrame, { opacity: 0, duration: 0.18 }, colored + 0.3)
      release(titleCursor, [chars[chars.length - 1]], colored + 0.48)
      exitCursor(timeline, titleCursor, colored + 0.5)

      // Each introduction line is an independent writing job.
      const regionDrawn = drawBox(padded(paragraphBox, 10), copyCursor, copyRegion, 0.1, 0.28, 0.34)
      const copyFramed = drawBox(padded(paragraphBox), copyCursor, copyFrame, regionDrawn + 0.1, 0.15, 0.24)
      timeline.to(copyRegion, { opacity: 0, duration: 0.16 }, copyFramed)
      const copyClicked = click(copyCursor, lines[0].box.left + 1, lines[0].box.top + lines[0].box.height / 2, copyFramed + 0.07, 0.22)
      timeline.to(copyCursor, { x: paragraphBox.right + 16, y: paragraphBox.top + 12, duration: 0.26 }, copyClicked)
      own(copyCursor, [paragraph], 'intro', copyClicked + 0.26)
      const copyDone = Math.max(...lines.map((line, index) => typography.type(
        timeline, line.element, copyCursor, typography.caret(), copyClicked + 0.26 + index * 0.045, 1.15,
      )))
      timeline.to(copyFrame, { opacity: 0, duration: 0.15 }, copyDone)
      const layoutDone = layout.play({ timeline, cursor: copyCursor, role: 'HeroCopy', at: copyDone + 0.1,
        own: (element, _role, task, phase, at) => own(copyCursor, [element], task, at, phase),
        release: (element, _role, at) => release(copyCursor, [element], at),
      })
      release(copyCursor, [paragraph], layoutDone)
      exitCursor(timeline, copyCursor, layoutDone)

      // Metadata gets two dedicated collaborators instead of waiting for copy.
      type(edition, topCursor, topFrame, topCaret, 0.18, 0.026)
      const topDone = type(number, topCursor, topFrame, topCaret, 0.24, 0.026, 0.35)
      exitCursor(timeline, topCursor, topDone)

      timeline.to(bottomCursor, { x: cueBox.left, y: cueBox.top, opacity: 1, duration: 0.3 }, 0.2)
      timeline.set(cue, { opacity: 1 }, 0.5)
      timeline.to(cue, { scaleX: 1, duration: 0.3 }, 0.5)
      timeline.to(bottomCursor, { x: cueBox.right, y: cueBox.top, duration: 0.3 }, 0.5)
      type(scroll, bottomCursor, bottomFrame, bottomCaret, 0.9, 0.026, 0.18)
      const bottomDone = type(since, bottomCursor, bottomFrame, bottomCaret, 0.95, 0.026, 0.35)
      exitCursor(timeline, bottomCursor, bottomDone)
      durationMs = timeline.duration() / timeline.timeScale() * 1000
    })
  } catch (error) {
    context.revert()
    clearOwnership()
    throw error
  }

  return { durationMs, finish: () => { context.revert(); clearOwnership() } }
}
