import gsap from 'gsap'
import { exitCursor } from './cursor-exit'
import { createTaskCursors } from './task-cursors'
import { sectionTextStyles } from './text-style-pass'
import { styleClick } from './style-click'
import { buildSocialClones } from './social-clone-scene'
import { createLayoutPass } from './layout-pass'
import { createTypographyPass } from './typography-pass'

export type SceneRole = 'SceneDesign' | 'SceneCopy' | 'SceneBuild' | 'SceneDetail'
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function createSceneTools(root: HTMLElement, onComplete: () => void) {
  const all = <T extends HTMLElement = HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector))
  const get = (selector: string) => {
    const element = root.querySelector<HTMLElement>(selector)
    if (!element) throw new Error(`Missing build target: ${selector}`)
    return element
  }
  const tasks = createTaskCursors(get('[data-scene-overlay]'))
  const context = gsap.context(() => undefined)
  const layoutPass = createLayoutPass(root)
  context.add(layoutPass.prepare)
  const boxes = new Map(all('[data-build-text], [data-build-box], [data-build-media], [data-build-rule], [data-build-emphasis], .pf-tags, .signal__bar, .heatmap, .heatmap__grid, .heatmap__stat').map(element => [element, element.getBoundingClientRect()]))
  const cursors = new Map(all('[data-build-cursor]').map(cursor => [cursor.dataset.buildCursor as SceneRole, cursor]))
  const templates = new Map(cursors)
  const frames = new Map(Array.from(cursors.keys(), role => {
    const frame = get(`[data-build-frame="${role}"]`)
    return [role, { frame, top: frame.querySelector('[data-edge="top"]')!, bottom: frame.querySelector('[data-edge="bottom"]')!, left: frame.querySelector('[data-edge="left"]')!, right: frame.querySelector('[data-edge="right"]')!, handle: frame.querySelector('[data-frame-end]')! }]
  }))
  const owned = new Set<HTMLElement>()
  const temporaryNodes = new Set<HTMLElement>()
  const textStyles = sectionTextStyles(root, get('[data-scene-overlay]'))
  const typography = createTypographyPass(get('[data-scene-overlay]'))
  const lastJob = new Map<SceneRole, number>()
  let tl: gsap.core.Timeline
  const bounds = (element: HTMLElement) => boxes.get(element) ?? element.getBoundingClientRect()
  const cursorFor = (role: SceneRole) => cursors.get(role)!
  const allocate = (role: SceneRole, task: string, element: HTMLElement) => {
    const cursor = tasks.create(task, element)
    cursors.set(role, cursor)
    return cursor
  }
  const freshFrame = (role: SceneRole) => {
    const frame = get(`[data-build-frame="${role}"]`).cloneNode(true) as HTMLElement
    frame.removeAttribute('data-build-frame')
    get('[data-scene-overlay]').append(frame)
    temporaryNodes.add(frame)
    const parts = { frame, top: frame.querySelector('[data-edge="top"]')!, bottom: frame.querySelector('[data-edge="bottom"]')!, left: frame.querySelector('[data-edge="left"]')!, right: frame.querySelector('[data-edge="right"]')!, handle: frame.querySelector('[data-frame-end]')! }
    frames.set(role, parts)
    return parts
  }
  const own = (element: HTMLElement, role: SceneRole, task: string, phase: string, at: number) => {
    const cursor = cursorFor(role)
    owned.add(element)
    owned.add(cursor)
    tl.set(element, { attr: { 'data-build-owner': role, 'data-build-phase': phase } }, at)
    tasks.start(tl, cursor, at, bounds(element).left, bounds(element).top)
    tl.set(cursor, { attr: { 'data-build-task': task, 'data-build-phase': phase } }, at)
  }
  const release = (element: HTMLElement, role: SceneRole, at: number) => {
    tl.set(element, { attr: { 'data-build-phase': 'complete' } }, at)
    exitCursor(tl, cursorFor(role), at)
    tl.set(cursorFor(role), { attr: { 'data-build-phase': 'idle', 'data-build-task': '' } }, at)
    lastJob.set(role, Math.max(lastJob.get(role) ?? 0, at))
  }
  const draw = (element: HTMLElement, role: SceneRole, at: number, task: string, padding = 4) => {
    const b = bounds(element)
    const cursor = allocate(role, `draw ${task}`, element)
    const p = freshFrame(role)
    // Measure the whole region even on first-pixel entry. The overlay clips its
    // paint at the viewport; scrolling reveals the same uninterrupted work.
    const x = Math.max(5, b.left - padding)
    const y = b.top - padding
    const width = Math.min(innerWidth - x - 5, b.right + padding - x)
    const height = b.height + padding * 2
    own(element, role, task, 'drawing', at)
    tl.set(cursor, { attr: { 'data-dock': 'above' } }, at)
    tl.to(cursor, { x, y, duration: 0.2 }, at)
    const start = at + 0.2
    tl.set(p.frame, { x, y, width, height, opacity: 1 }, start)
    tl.set([p.top, p.bottom], { scaleX: 0, y: 0 }, start)
    tl.set([p.left, p.right], { scaleY: 0, x: 0 }, start)
    tl.set(p.handle, { x: 0, y: 0 }, start)
    tl.to(cursor, { scale: 0.88, duration: 0.06 }, start)
    tl.to(p.top, { scaleX: 1, duration: 0.26 }, start)
    tl.to(p.left, { scaleY: 1, duration: 0.26 }, start)
    tl.to(p.bottom, { scaleX: 1, y: height, duration: 0.26 }, start)
    tl.to(p.right, { scaleY: 1, x: width, duration: 0.26 }, start)
    tl.to(p.handle, { x: width, y: height, duration: 0.26 }, start)
    tl.to(cursor, { x: x + width, y: y + height, duration: 0.26 }, start)
    tl.set(cursor, { attr: { 'data-dock': 'left' } }, start + 0.2)
    tl.to(cursor, { scale: 1, duration: 0.06 }, start + 0.26)
    tasks.end(tl, cursor, start + 0.26)
    return start + 0.26
  }
  const park = (element: HTMLElement, role: SceneRole, at: number, below = false) => {
    const b = bounds(element)
    const cursor = cursorFor(role)
    tl.set(cursor, { attr: { 'data-dock': below ? 'below' : 'left' } }, at + 0.16)
    tl.to(cursor, {
      x: below ? clamp(b.left + 16, 24, innerWidth - 90) : clamp(b.right - 12, 90, innerWidth - 30),
      y: below ? b.bottom + 8 : b.top - 14,
      duration: 0.16,
    }, at)
    return at + 0.16
  }
  const write = (element: HTMLElement, role: SceneRole, start: number, duration: number, closeFrame = true, inheritFrom?: HTMLElement) => {
    allocate(role, `write ${element.dataset.buildText ?? 'text'}`, element)
    const caret = typography.caret()
    own(element, role, element.dataset.buildText ?? 'text', 'typing', start)
    const done = typography.type(tl, element, cursorFor(role), caret, start, duration, {
      inheritFrom,
      onStyled: at => textStyles.showDraft(tl, element, at),
    })
    if (closeFrame) tl.to(frames.get(role)!.frame, { opacity: 0, duration: 0.1 }, done)
    release(element, role, done + 0.08)
    return done + 0.1
  }

  const type = (selector: string | HTMLElement, role: SceneRole, at: number, duration = 0.6) => {
    const element = typeof selector === 'string' ? get(selector) : selector
    const b = bounds(element)
    const drawn = draw(element, role, at, element.dataset.buildText ?? 'text')
    const cursor = cursorFor(role)
    tl.set(cursor, { attr: { 'data-dock': 'above' } }, drawn)
    tl.to(cursor, { x: Math.max(12, b.left + 2), y: b.top + 8, duration: 0.12 }, drawn)
    tl.to(cursor, { scale: 0.88, duration: 0.05 }, drawn + 0.12)
    tl.to(cursor, { scale: 1, duration: 0.05 }, drawn + 0.17)
    return write(element, role, park(element, role, drawn + 0.22), duration)
  }
  const cloneSocials = (source: HTMLElement, targets: HTMLElement[], roles: SceneRole[], at: number) => {
    const actors = roles.map((role, index) => ({ role, cursor: tasks.create(`duplicate social ${index + 2}`, targets[index]), frame: freshFrame(role).frame, selection: get(`[data-scene-selection="${role}"]`) }))
    const actorFor = (role: SceneRole) => actors.find(actor => actor.role === role)!.cursor
    return buildSocialClones({
      timeline: tl, overlay: get('[data-scene-overlay]'), source, targets, at, actors,
      register: node => temporaryNodes.add(node),
      own: (element, role, task, phase, when) => {
        const box = bounds(element)
        const cursor = actorFor(role)
        tasks.start(tl, cursor, when, box.left, box.top)
        tl.set(cursor, { attr: { 'data-build-task': task, 'data-build-phase': phase } }, when)
      },
      release: (_element, role, when) => tasks.end(tl, actorFor(role), when),
      write: (element, role, when, duration, closeFrame, inheritFrom) => {
        tasks.end(tl, actorFor(role), when)
        return write(element, role, when, duration, closeFrame, inheritFrom)
      },
    })
  }
  const panel = (selector: string, role: SceneRole, at: number) => {
    const element = get(selector)
    const done = draw(element, role, at, 'region', 0)
    tl.set(element, { opacity: 1 }, done)
    tl.to(frames.get(role)!.frame, { opacity: 0, duration: 0.1 }, done)
    release(element, role, done + 0.1)
    return done + 0.12
  }
  const rule = (selector: string, role: SceneRole, at: number) => {
    const element = get(selector)
    const b = bounds(element)
    const y = b.top
    const line = get(`[data-scene-rule="${role}"]`)
    const cursor = allocate(role, 'draw divider', element)
    own(element, role, 'divider', 'drawing', at)
    tl.set(cursor, { attr: { 'data-dock': 'above' } }, at)
    tl.to(cursor, { x: b.left + 2, y, duration: 0.16 }, at)
    tl.set(line, { x: b.left, y, width: b.width, scaleX: 0, opacity: 1 }, at + 0.16)
    tl.to(line, { scaleX: 1, duration: 0.48, ease: 'none' }, at + 0.16)
    tl.to(cursor, { x: b.right - 2, duration: 0.48, ease: 'none' }, at + 0.16)
    tl.set(cursor, { attr: { 'data-dock': 'left' } }, at + 0.4)
    tl.set(element, { borderTopColor: 'var(--line)' }, at + 0.64)
    tl.set(line, { opacity: 0 }, at + 0.64)
    release(element, role, at + 0.64)
    return at + 0.66
  }
  const emphasize = (element: HTMLElement, role: SceneRole, at: number) => {
    const b = bounds(element)
    const selection = get(`[data-scene-selection="${role}"]`).cloneNode(true) as HTMLElement
    selection.removeAttribute('data-scene-selection')
    get('[data-scene-overlay]').append(selection)
    temporaryNodes.add(selection)
    const cursor = allocate(role, `style ${element.textContent?.trim().slice(0, 28)}`, element)
    own(element, role, 'emphasis', 'styling', at)
    tl.set(cursor, { attr: { 'data-dock': 'above' } }, at)
    tl.to(cursor, { x: b.left, y: b.top - 8, duration: 0.22 }, at)
    tl.set(selection, { x: b.left, y: b.top, width: b.width, height: b.height, scaleX: 0, opacity: 1 }, at + 0.22)
    tl.to(selection, { scaleX: 1, duration: 0.22 }, at + 0.22)
    tl.to(cursor, { x: b.right, duration: 0.22 }, at + 0.22)
    // Applying style is a real, separate step after the selection reaches the
    // end of the word. Nothing inherits its final accent/underline beforehand.
    tl.to(cursor, { x: b.left + b.width / 2, y: b.top + b.height / 2, duration: 0.12 }, at + 0.44)
    const clicked = styleClick(tl, cursor, at + 0.56)
    textStyles.apply(tl, element, clicked)
    tl.to(selection, { opacity: 0, duration: 0.14 }, at + 0.78)
    release(element, role, at + 0.98)
    return at + 1
  }
  const generate = (role: SceneRole, at: number) => {
    const media = get('[data-build-media]')
    const img = media.querySelector('img')!
    const box = bounds(media)
    const drawn = draw(media, role, at, 'image-region', 0)
    const tiles = get('[data-generation-tiles]')
    const status = get('[data-generation-status]')
    tl.set(media, { opacity: 1, background: 'var(--bg-alt)' }, drawn)
    gsap.set(img, { opacity: 0 })
    tl.set(tiles, { x: box.left, y: box.top, width: box.width, height: box.height, opacity: 1 }, drawn)
    tl.set(status, { x: box.left + 14, y: box.top + 14, opacity: 1 }, drawn)
    tl.set(img, { opacity: 1 }, drawn)
    const cursor = tasks.create('generate project image', media)
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    const start = drawn + 0.12
    tasks.start(tl, cursor, start, x - 24, y - 20)
    tl.to(cursor, { x, y, duration: 0.2 }, start)
    const applied = styleClick(tl, cursor, start + 0.2)
    // One image command starts the entire reveal; the pointer leaves after
    // submitting it instead of supervising individual tiles.
    tasks.end(tl, cursor, applied + 0.2)
    const cells = Array.from(tiles.children)
    tl.to(cells, { opacity: 0, duration: 0.3, stagger: { amount: 0.75, from: 'random' } }, applied)
    tl.fromTo(status.querySelector('[data-generation-progress]'), { textContent: 0 }, {
      textContent: 100, snap: { textContent: 1 }, duration: 1.05, ease: 'none',
    }, applied)
    const done = applied + 1.15
    tl.to([tiles, status, frames.get(role)!.frame], { opacity: 0, duration: 0.16 }, done)
    return done + 0.18
  }
  const populate = (element: HTMLElement, children: HTMLElement[], role: SceneRole, at: number, duration = 0.7) => {
    const drawn = draw(element, role, at, 'data-region')
    const start = park(element, role, drawn)
    tl.set(element, { opacity: 1 }, start)
    children.forEach((child, index) => {
      const cursor = tasks.create(`populate data column ${index + 1}`, child)
      const box = child.getBoundingClientRect()
      const begin = start + index * duration / Math.max(1, children.length)
      gsap.set(child, { opacity: 0 })
      tasks.start(tl, cursor, begin, box.left + box.width / 2, box.top)
      tl.to(child, { opacity: 1, duration: 0.2 }, begin)
      tl.to(cursor, { y: box.bottom, duration: 0.2, ease: 'none' }, begin)
      tasks.end(tl, cursor, begin + 0.2)
    })
    tl.to(frames.get(role)!.frame, { opacity: 0, duration: 0.1 }, start + duration + 0.15)
    release(element, role, start + duration + 0.25)
    return start + duration + 0.27
  }
  const growBar = (element: HTMLElement, role: SceneRole, at: number) => {
    const done = draw(element, role, at, 'reading-progress')
    const start = done + 0.08
    const cursor = allocate(role, 'set reading progress', element)
    own(element, role, 'reading-progress', 'building', start)
    tl.set(element, { opacity: 1 }, start)
    tl.fromTo(element.firstElementChild, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.55, immediateRender: false }, start)
    const fill = element.firstElementChild!.getBoundingClientRect()
    tl.set(cursor, { x: fill.left, y: fill.top }, start)
    tl.to(cursor, { x: fill.right, duration: 0.55 }, start)
    tl.to(frames.get(role)!.frame, { opacity: 0, duration: 0.1 }, start + 0.55)
    release(element, role, start + 0.65)
    return start + 0.67
  }
  const score = (element: HTMLElement, role: SceneRole, at: number) => {
    const drawn = draw(element, role, at, 'score')
    const typed = park(element, role, drawn)
    own(element, role, 'score-text', 'typing', typed)
    gsap.set(all('[data-score-value]'), { textContent: 0 })
    const start = typography.type(tl, element, cursorFor(role), get(`[data-scene-caret="${role}"]`), typed, 0.3, { text: '0 — 0' })
    tl.set(element, { opacity: 1 }, start)
    all('[data-score-value]').forEach((value, index) => {
      const cursor = tasks.create(`set score ${index + 1}`, value)
      const box = bounds(value)
      tasks.start(tl, cursor, start, box.left + box.width / 2, box.bottom + 4)
      tl.fromTo(value, { textContent: 0 }, { textContent: Number(value.dataset.scoreValue), snap: { textContent: 1 }, duration: 0.8, ease: 'power2.out' }, start)
      tasks.end(tl, cursor, start + 0.8)
    })
    tl.to(frames.get(role)!.frame, { opacity: 0, duration: 0.1 }, start + 0.85)
    release(element, role, start + 0.95)
    return start + 0.97
  }
  const align = (role: SceneRole) => {
    allocate(role, 'adjust spacing', get('[data-build-anchor]'))
    return layoutPass.play({ timeline: tl, cursor: cursorFor(role), role, at: tl.duration() + 0.05, own, release })
  }
  const finish = () => {
    context.revert()
    tasks.cleanup()
    layoutPass.cleanup()
    typography.cleanup()
    textStyles.cleanup()
    temporaryNodes.forEach(node => node.remove())
    owned.forEach(element => {
      element.removeAttribute('data-build-owner')
      element.removeAttribute('data-build-phase')
      element.removeAttribute('data-build-task')
    })
    cursors.forEach(cursor => { cursor.removeAttribute('data-dock'); cursor.style.removeProperty('opacity') })
  }
  const run = (storyboard: () => void) => {
    try {
      context.add(() => {
        tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete }).timeScale(0.75)
        gsap.set(all('[data-build-text], [data-build-media], [data-build-box], [data-build-visual]'), { opacity: 0 })
        gsap.set(all('[data-build-rule]'), { borderTopColor: 'transparent' })
        textStyles.prepare()
        const anchor = get('[data-build-anchor]').getBoundingClientRect()
        templates.forEach(cursor => gsap.set(cursor, { x: anchor.left + 24, y: anchor.top + 24, opacity: 0 }))
        storyboard()
        lastJob.forEach((end, role) => tl.to(cursorFor(role), { opacity: 0, duration: 0.18 }, end + 0.08))
        // Every scene has a finite timeline even when all its targets are clipped.
        if (!tl.duration()) tl.to({}, { duration: 0.01 })
      })
    } catch (error) { finish(); throw error }
    return { finish, durationMs: tl.duration() / tl.timeScale() * 1000 }
  }
  const show = (element: HTMLElement, at: number) => tl.set(element, { opacity: 1 }, at)
  return { get, all, show, type, panel, rule, emphasize, generate, populate, growBar, score, cloneSocials, align, run }
}
