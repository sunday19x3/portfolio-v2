import gsap from 'gsap'
import type { SceneRole } from './section-scene-tools'
import { styleClick } from './style-click'

type Actor = { role: SceneRole; cursor: HTMLElement; frame: HTMLElement; selection: HTMLElement }
type CloneOptions = {
  timeline: gsap.core.Timeline
  overlay: HTMLElement
  source: HTMLElement
  targets: HTMLElement[]
  actors: Actor[]
  at: number
  register: (element: HTMLElement) => void
  own: (element: HTMLElement, role: SceneRole, task: string, phase: string, at: number) => void
  release: (element: HTMLElement, role: SceneRole, at: number) => void
  write: (element: HTMLElement, role: SceneRole, at: number, duration: number, closeFrame: boolean, inheritFrom: HTMLElement) => number
}

function textBox(element: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect()
}

// This is an explicit duplicate gesture, requested for the social columns only.
// Copies are inert paint in the overlay. The real anchors keep their original
// labels, hrefs and layout throughout the demonstration.
export function buildSocialClones({ timeline: tl, overlay, source, targets, actors, at, register, own, release, write }: CloneOptions) {
  const sourceBox = source.getBoundingClientRect()
  const destinations = targets.map(target => target.getBoundingClientRect())

  const copies = targets.map((target, index) => {
    const actor = actors[index]
    const box = destinations[index]
    const copy = document.createElement('div')
    copy.className = 'contact__social'
    copy.dataset.socialClone = String(index + 2)
    copy.setAttribute('aria-hidden', 'true')
    Object.assign(copy.style, {
      position: 'absolute', left: '0px', top: '0px', opacity: '0',
      width: `${sourceBox.width}px`, height: `${sourceBox.height}px`,
      textAlign: 'center', pointerEvents: 'none', boxSizing: 'border-box',
    })
    for (const selector of ['.contact__social-name', '.contact__social-meta']) {
      const original = source.querySelector<HTMLElement>(selector)!
      const line = document.createElement('span')
      line.className = original.className
      line.textContent = original.textContent
      copy.append(line)
    }
    overlay.append(copy)
    register(copy)
    const lines = Array.from(copy.children) as HTMLElement[]
    // Measure at (0, 0) before moving the paint, then translate those text
    // rectangles with the copy. Different final column widths stay reserved.
    const lineBoxes = lines.map(textBox)
    const fields = [target.querySelector<HTMLElement>('.contact__social-name')!, target.querySelector<HTMLElement>('.contact__social-meta')!]
    const left = box.left + (box.width - sourceBox.width) / 2
    const top = box.top
    gsap.set(fields, { opacity: 0 })
    gsap.set(copy, { x: sourceBox.left, y: sourceBox.top })

    const start = at + index * 0.28
    const pickup = start + 0.18
    const drag = pickup + 0.12
    const duration = index === 0 ? 0.66 : 0.82
    const landed = drag + duration
    const grip = { x: sourceBox.right - 8, y: sourceBox.top + 8 }
    const dx = left - sourceBox.left
    const dy = top - sourceBox.top
    const { cursor, frame, role } = actor
    own(copy, role, `clone-social-${index + 2}`, 'cloning', start)
    tl.set(cursor, { attr: { 'data-dock': 'above' } }, start)
    tl.to(cursor, { ...grip, duration: 0.18 }, start)
    tl.set(copy, { opacity: 1, attr: { 'data-clone-state': 'dragging' } }, pickup)
    tl.set(frame, { x: sourceBox.left - 4, y: sourceBox.top - 4, width: sourceBox.width + 8, height: sourceBox.height + 8, opacity: 1 }, pickup)
    tl.set(frame.querySelectorAll('[data-edge="top"], [data-edge="bottom"]'), { scaleX: 1 }, pickup)
    tl.set(frame.querySelectorAll('[data-edge="left"], [data-edge="right"]'), { scaleY: 1 }, pickup)
    tl.set(frame.querySelector('[data-edge="bottom"]'), { y: sourceBox.height + 8 }, pickup)
    tl.set(frame.querySelector('[data-edge="right"]'), { x: sourceBox.width + 8 }, pickup)
    tl.set(frame.querySelector('[data-frame-end]'), { x: sourceBox.width + 8, y: sourceBox.height + 8 }, pickup)
    tl.to(cursor, { scale: 0.84, duration: 0.08 }, pickup)
    const ring = cursor.querySelector('[data-cursor-click]')!
    tl.set(ring, { scale: 0.5, opacity: 0.8 }, pickup)
    tl.to(ring, { scale: 1.6, opacity: 0, duration: 0.28 }, pickup + 0.06)
    // The cursor and duplicate share exactly the same translation and easing.
    tl.to(copy, { x: left, y: top, duration }, drag)
    tl.to(frame, { x: left - 4, y: top - 4, duration }, drag)
    tl.to(cursor, { x: grip.x + dx, y: grip.y + dy, duration }, drag)
    tl.to(cursor, { scale: 1, duration: 0.1 }, landed)
    tl.set(copy, { attr: { 'data-clone-state': 'ready' } }, landed)
    release(copy, role, landed + 0.12)
    return { target, copy, lines, lineBoxes, fields, left, top, box, actor, landed }
  })

  // Both columns first visibly contain GitHub. Only after both drops do their
  // owners select/delete each copied line and type its replacement in place.
  const editAt = Math.max(...copies.map(copy => copy.landed)) + 0.3
  let finished = editAt
  for (const [index, clone] of copies.entries()) {
    const { actor: { cursor, frame, selection, role }, fields, lines, lineBoxes, target, copy, box, left, top } = clone
    let next = editAt + index * 0.08
    fields.forEach((field, lineIndex) => {
      const previous = lines[lineIndex]
      const old = lineBoxes[lineIndex]
      const x = left + old.left
      const y = top + old.top
      const start = next
      own(field, role, lineIndex === 0 ? 'replace-social-name' : 'replace-social-url', 'selecting', start)
      tl.set(copy, { attr: { 'data-clone-state': 'editing' } }, start)
      tl.to(cursor, { x, y: y + old.height / 2, duration: 0.12 }, start)
      tl.set(selection, { x, y, width: old.width, height: old.height, scaleX: 0, opacity: 1 }, start + 0.12)
      tl.to(selection, { scaleX: 1, duration: 0.16, ease: 'none' }, start + 0.12)
      tl.to(cursor, { x: x + old.width, duration: 0.16, ease: 'none' }, start + 0.12)
      tl.to(cursor, { x: x + old.width / 2, duration: 0.1 }, start + 0.28)
      const cleared = styleClick(tl, cursor, start + 0.38)
      tl.set([previous, selection], { opacity: 0 }, cleared)
      tl.set(target, { opacity: 1 }, cleared)
      if (lineIndex === 1) {
        // Once the copied URL is cleared, fit the selection to the new URL's
        // reserved width. This changes only the overlay, never the real grid.
        tl.set(frame, { x: box.left - 4, width: box.width + 8 }, cleared)
        tl.set(frame.querySelector('[data-edge="right"]'), { x: box.width + 8 }, cleared)
        tl.set(frame.querySelector('[data-frame-end]'), { x: box.width + 8 }, cleared)
      }
      const parkX = Math.min(innerWidth - 90, box.right + 8)
      tl.to(cursor, { x: parkX, y: box.top - 16, duration: 0.12 }, cleared)
      next = write(field, role, cleared + 0.12, lineIndex === 0 ? 0.28 : 0.48, false, source.querySelector<HTMLElement>(lineIndex === 0 ? '.contact__social-name' : '.contact__social-meta')!) + 0.06
    })
    tl.set(copy, { opacity: 0, attr: { 'data-clone-state': 'complete' } }, next)
    tl.to(frame, { opacity: 0, duration: 0.12 }, next)
    release(copy, role, next + 0.12)
    finished = Math.max(finished, next + 0.14)
  }
  return finished
}
