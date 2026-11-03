import gsap from 'gsap'
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
  const context = gsap.context(() => undefined)
  const layoutPass = createLayoutPass(root)
  context.add(layoutPass.prepare)
  const boxes = new Map(all('[data-build-text], [data-build-box], [data-build-media], [data-build-rule], [data-build-emphasis], .pf-tags, .signal__bar, .heatmap, .heatmap__grid, .heatmap__stat').map(element => [element, element.getBoundingClientRect()]))
  const cursors = new Map(all('[data-build-cursor]').map(cursor => [cursor.dataset.buildCursor as SceneRole, cursor]))
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
  const own = (element: HTMLElement, role: SceneRole, task: string, phase: string, at: number) => {
    const cursor = cursorFor(role)
    owned.add(element)
    owned.add(cursor)
    tl.set(element, { attr: { 'data-build-owner': role, 'data-build-phase': phase } }, at)
    tl.set(cursor, { opacity: 1, attr: { 'data-build-task': task, 'data-build-phase': phase } }, at)
  }
  const release = (element: HTMLElement, role: SceneRole, at: number) => {
    tl.set(element, { attr: { 'data-build-phase': 'complete' } }, at)
    tl.set(cursorFor(role), { attr: { 'data-build-phase': 'idle', 'data-build-task': '' } }, at)
    lastJob.set(role, Math.max(lastJob.get(role) ?? 0, at))
  }
  const draw = (element: HTMLElement, role: SceneRole, at: number, task: string, padding = 4) => {
    const b = bounds(element)
    const cursor = cursorFor(role)
    const p = frames.get(role)!
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
    const caret = get(`[data-scene-caret="${role}"]`)
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
  const cloneSocials = (source: HTMLElement, targets: HTMLElement[], roles: SceneRole[], at: number) => buildSocialClones({
    timeline: tl, overlay: get('[data-scene-overlay]'), source, targets, at,
    actors: roles.map(role => ({ role, cursor: cursorFor(role), frame: frames.get(role)!.frame, selection: get(`[data-scene-selection="${role}"]`) })),
    register: node => temporaryNodes.add(node), own, release, write,
  })
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
    const cursor = cursorFor(role)
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
    const selection = get(`[data-scene-selection="${role}"]`)
    const cursor = cursorFor(role)
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
    const b = bounds(media)
    const drawn = draw(media, role, at, 'image-region', 0)
    const tiles = get('[data-generation-tiles]')
    const status = get('[data-generation-status]')
    tl.set(media, { opacity: 1, background: 'var(--bg-alt)' }, drawn)
    tl.set(img, { opacity: 0, filter: 'blur(12px)' }, 0)
    tl.to(cursorFor(role), { x: b.left + b.width / 2, y: b.top + b.height / 2, duration: 0.16 }, drawn)
    tl.to(cursorFor(role), { scale: 0.86, duration: 0.08, repeat: 1, yoyo: true }, drawn + 0.16)
    const start = park(media, role, drawn + 0.32, true)
    own(media, role, 'generate-image', 'generating', start)
    tl.set(tiles, { x: b.left, y: b.top, width: b.width, height: b.height, opacity: 1 }, start)
    tl.set(status, { x: b.left + 14, y: b.top + 14, opacity: 1 }, start)
    tl.set(Array.from(tiles.children), { opacity: 1 }, start)
    tl.to(img, { opacity: 1, duration: 0.25 }, start + 0.12)
    tl.to(Array.from(tiles.children), { opacity: 0, duration: 0.28, stagger: { amount: 0.95, from: 'random' } }, start + 0.22)
    tl.to(img, { filter: 'blur(0px)', duration: 1.2 }, start + 0.28)
    tl.fromTo(status.querySelector('[data-generation-progress]'), { textContent: 0 }, { textContent: 100, snap: { textContent: 1 }, duration: 1.48, ease: 'none' }, start)
    tl.to([tiles, status, frames.get(role)!.frame], { opacity: 0, duration: 0.16 }, start + 1.5)
    release(media, role, start + 1.66)
    return start + 1.68
  }
  const populate = (element: HTMLElement, children: HTMLElement[], role: SceneRole, at: number, duration = 0.7) => {
    const drawn = draw(element, role, at, 'data-region')
    const start = park(element, role, drawn)
    own(element, role, 'populate-data', 'building', start)
    tl.set(element, { opacity: 1 }, start)
    tl.fromTo(children, { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: { amount: duration }, immediateRender: false }, start)
    tl.to(frames.get(role)!.frame, { opacity: 0, duration: 0.1 }, start + duration + 0.15)
    release(element, role, start + duration + 0.25)
    return start + duration + 0.27
  }
  const growBar = (element: HTMLElement, role: SceneRole, at: number) => {
    const done = draw(element, role, at, 'reading-progress')
    const start = park(element, role, done, true)
    own(element, role, 'reading-progress', 'building', start)
    tl.set(element, { opacity: 1 }, start)
    tl.fromTo(element.firstElementChild, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.55, immediateRender: false }, start)
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
    own(element, role, 'score', 'counting', start)
    tl.set(element, { opacity: 1 }, start)
    all('[data-score-value]').forEach(value => tl.fromTo(value, { textContent: 0 }, { textContent: Number(value.dataset.scoreValue), snap: { textContent: 1 }, duration: 0.8, ease: 'power2.out' }, start))
    tl.to(frames.get(role)!.frame, { opacity: 0, duration: 0.1 }, start + 0.85)
    release(element, role, start + 0.95)
    return start + 0.97
  }
  const align = (role: SceneRole) => layoutPass.play({ timeline: tl, cursor: cursorFor(role), role, at: tl.duration() + 0.05, own, release })
  const finish = () => {
    context.revert()
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
        cursors.forEach(cursor => gsap.set(cursor, { x: anchor.left + 24, y: anchor.top + 24, opacity: 0 }))
        storyboard()
        lastJob.forEach((end, role) => tl.to(cursorFor(role), { opacity: 0, duration: 0.18 }, end + 0.08))
        // Every scene has a finite timeline even when all its targets are clipped.
        if (!tl.duration()) tl.to({}, { duration: 0.01 })
      })
    } catch (error) { finish(); throw error }
    return { finish, durationMs: tl.duration() / tl.timeScale() * 1000 }
  }
  return { get, all, type, panel, rule, emphasize, generate, populate, growBar, score, cloneSocials, align, run }
}
