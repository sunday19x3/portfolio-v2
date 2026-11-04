import gsap from 'gsap'
import styles from './home-build.module.css'
import { addLayoutRulers } from './layout-chrome'

type Point = { x: number; y: number }
type LayoutSpec = {
  kind: 'gap' | 'margin' | 'padding'
  target: HTMLElement
  moving: HTMLElement[]
  offset: Point
  origin: Point
  originOffset?: Point
  badgeY?: number
  tip: Point
  from: number
  to: number
  vertical: boolean
  box: { x: number; y: number; width: number; height: number }
}
type LayoutPlayback<Role extends string> = {
  timeline: gsap.core.Timeline
  cursor: HTMLElement
  role: Role
  at: number
  own: (element: HTMLElement, role: Role, task: string, phase: string, at: number) => void
  release: (element: HTMLElement, role: Role, at: number) => void
}

function layoutSpec(root: HTMLElement, id = root.dataset.scrollBuild): LayoutSpec | undefined {
  const get = (selector: string) => root.querySelector<HTMLElement>(selector)!
  if (id === 'navigation-contact') {
    const work = get('.nav__items > a:first-child').getBoundingClientRect()
    const stack = get('.nav__items > a:nth-child(2)').getBoundingClientRect()
    const target = get('.nav__items > a:nth-child(3)')
    const contact = target.getBoundingClientRect()
    const gap = contact.left - stack.right
    if (gap < 24) return
    const stackOffset = stack.left - work.right >= 24 ? 16 - (stack.left - work.right) : 0
    return {
      kind: 'gap', target, moving: [target], offset: { x: stackOffset + 16 - gap, y: 0 },
      origin: { x: stack.right, y: contact.top }, originOffset: { x: stackOffset, y: 0 },
      badgeY: root.getBoundingClientRect().bottom + 38,
      tip: { x: contact.left, y: contact.top }, from: 16, to: gap, vertical: false,
      box: { x: contact.left, y: contact.top, width: contact.width, height: contact.height },
    }
  }
  if (id === 'mimboku' || id === 'pyxis' || id === 'navigation' || id === 'work') {
    const target = get(id === 'navigation' ? '.nav__items > a:nth-child(2)' : id === 'work' ? '.work__title' : '.project__body')
    const body = target.getBoundingClientRect()
    const media = get(id === 'navigation' ? '.nav__items > a:first-child' : id === 'work' ? '.pf-eyebrow' : '.project__media').getBoundingClientRect()
    const gap = body.left - media.right
    if (gap < 24) return
    return {
      kind: 'gap', target, moving: [target], offset: { x: 16 - gap, y: 0 },
      origin: { x: media.right, y: body.top }, tip: { x: body.left, y: body.top },
      from: 16, to: gap, vertical: false,
      badgeY: id === 'navigation' ? root.getBoundingClientRect().bottom + 10 : undefined,
      box: { x: body.left, y: body.top, width: body.width, height: body.height },
    }
  }
  if (id === 'punkga' || id === 'dichung') {
    const title = get('.project__name').getBoundingClientRect()
    const target = get('.project__problem')
    const description = target.getBoundingClientRect()
    const foot = get('.project__foot')
    const gap = description.top - title.bottom
    if (gap < 16) return
    return {
      kind: 'margin', target, moving: [target, foot], offset: { x: 0, y: 8 - gap },
      origin: { x: description.left, y: title.bottom }, tip: { x: description.left, y: description.top },
      from: 8, to: gap, vertical: true,
      box: { x: description.left, y: description.top, width: description.width, height: foot.getBoundingClientRect().bottom - description.top },
    }
  }
  if (id === 'hero' || id === 'stack' || id === 'contact') {
    const previous = get(id === 'hero' ? '.hero__title' : id === 'stack' ? '.stack__head' : '.contact__mail').getBoundingClientRect()
    const target = get(id === 'hero' ? '.hero__manifesto' : id === 'stack' ? '.stack__copy' : '.contact__socials')
    const box = target.getBoundingClientRect()
    const gap = box.top - previous.bottom
    if (gap < 20) return
    return {
      kind: 'margin', target, moving: [target], offset: { x: 0, y: 16 - gap },
      origin: { x: box.left, y: previous.bottom }, tip: { x: box.left, y: box.top },
      from: 16, to: gap, vertical: true,
      box: { x: box.left, y: box.top, width: box.width, height: box.height },
    }
  }
  if (id === 'reading' || id === 'activity' || id === 'match' || id === 'footer' || id === 'now') {
    const target = get(id === 'footer' ? '.footer' : id === 'now' ? '.ticker__inner' : '.signal')
    const card = target.getBoundingClientRect()
    const css = getComputedStyle(target)
    const left = parseFloat(css.paddingLeft)
    const top = parseFloat(css.paddingTop)
    const origin = { x: card.left + parseFloat(css.borderLeftWidth), y: card.top + parseFloat(css.borderTopWidth) }
    return {
      kind: 'padding', target, moving: Array.from(target.children) as HTMLElement[],
      offset: { x: 16 - left, y: 16 - top }, origin,
      tip: { x: origin.x + left, y: origin.y + top },
      from: 16, to: left, vertical: false,
      box: { x: origin.x + left, y: origin.y + top, width: card.width - left - parseFloat(css.paddingRight) - parseFloat(css.borderLeftWidth) - parseFloat(css.borderRightWidth), height: card.height - top - parseFloat(css.paddingBottom) - parseFloat(css.borderTopWidth) - parseFloat(css.borderBottomWidth) },
    }
  }
}

// Reserve the final v2 footprint. Only transform the content inside that
// footprint, then measure typing/frame geometry in the compact draft layout.
// The spacing pass runs after typing/style work, so no caret can drift.
export function createLayoutPass(root: HTMLElement, id = root.dataset.scrollBuild) {
  const spec = layoutSpec(root, id)
  const bases = new Map<HTMLElement, Point>()
  let visual: HTMLElement | undefined
  const make = (className: string, parent: HTMLElement) => {
    const element = document.createElement('span')
    element.className = className
    parent.append(element)
    return element
  }
  const prepare = () => {
    spec?.moving.forEach(element => {
      const base = { x: Number(gsap.getProperty(element, 'x')) || 0, y: Number(gsap.getProperty(element, 'y')) || 0 }
      bases.set(element, base)
      gsap.set(element, { x: base.x + spec!.offset.x, y: base.y + spec!.offset.y })
    })
  }
  const play = <Role extends string>({ timeline: tl, cursor, role, own, release, at }: LayoutPlayback<Role>) => {
    if (!spec) return at
    const { kind, target, moving, offset, origin, originOffset = { x: 0, y: 0 }, tip, from, to, vertical, box } = spec
    visual = document.createElement('div')
    visual.className = styles.layoutPass
    visual.dataset.layoutPass = kind
    visual.dataset.layoutTarget = target.textContent?.trim() ?? ''
    visual.setAttribute('aria-hidden', 'true')
    ;(root.querySelector('[data-scene-overlay]') ?? cursor.parentElement!).append(visual)

    addLayoutRulers(visual)
    const guideX = make(styles.layoutGuideX, visual)
    const guideY = make(styles.layoutGuideY, visual)
    const fixedGuide = make(vertical ? styles.layoutGuideY : styles.layoutGuideX, visual)
    const markerX = make(styles.rulerMarkerX, visual)
    const markerY = make(styles.rulerMarkerY, visual)
    const frame = make(styles.layoutOutline, visual)
    const band = make(styles.layoutBand, visual)
    const measure = make(vertical ? styles.layoutMeasureY : styles.layoutMeasureX, visual)
    const badge = make(styles.layoutValue, visual)
    const label = make('', badge)
    label.textContent = kind === 'padding' ? 'PADDING L/T ' : `${kind.toUpperCase()} `
    const number = make('', badge)
    number.dataset.layoutValue = kind
    number.textContent = String(from)
    let topNumber: HTMLElement | undefined
    if (kind === 'padding') {
      make('', badge).textContent = ' / '
      topNumber = make('', badge)
      topNumber.textContent = String(tip.y + offset.y - origin.y)
    }
    const unit = make('', badge)
    unit.textContent = ' px'
    const startTip = { x: tip.x + offset.x, y: tip.y + offset.y }
    const delta = { x: tip.x - startTip.x, y: tip.y - startTip.y }
    const measureOrigin = vertical ? { x: origin.x - 10, y: origin.y } : { x: origin.x + originOffset.x, y: tip.y }
    const badgeOrigin = kind === 'padding'
      ? { x: box.x + box.width - 8, y: origin.y + 7 }
      : vertical
        ? { x: origin.x + 14, y: origin.y + from / 2 - 10 }
        : { x: origin.x + originOffset.x + from / 2, y: spec.badgeY ?? box.y - 32 }

    gsap.set(visual, { opacity: 0 })
    gsap.set(frame, { x: box.x + offset.x, y: box.y + offset.y, width: box.width, height: box.height })
    gsap.set(guideX, { x: startTip.x })
    gsap.set(guideY, { y: startTip.y })
    gsap.set(fixedGuide, vertical ? { y: origin.y, opacity: 0.5 } : { x: origin.x + originOffset.x, opacity: 0.5 })
    gsap.set(markerX, { x: startTip.x })
    gsap.set(markerY, { y: startTip.y })
    gsap.set(badge, { ...badgeOrigin, xPercent: kind === 'padding' ? -100 : vertical ? 0 : -50 })
    gsap.set(measure, { ...measureOrigin, width: vertical ? 1 : to, height: vertical ? to : 1, scaleX: vertical ? 1 : from / to, scaleY: vertical ? from / to : 1 })
    gsap.set(band, vertical
      ? { x: origin.x, y: origin.y, width: box.width, height: to, scaleY: from / to }
      : { x: origin.x + originOffset.x, y: kind === 'padding' ? origin.y : box.y, width: to, height: kind === 'padding' ? box.height + (tip.y - origin.y) : box.height, scaleX: from / to })
    const topPadding = kind === 'padding' ? make(styles.layoutBand, visual) : undefined
    if (topPadding) gsap.set(topPadding, { x: startTip.x, y: origin.y, width: box.width, height: tip.y - origin.y, scaleY: (startTip.y - origin.y) / (tip.y - origin.y) })

    own(target, role, `layout-${kind}`, 'aligning', at)
    tl.set(visual, { attr: { 'data-layout-phase': 'selecting' } }, at)
    tl.set(cursor, { attr: { 'data-dock': startTip.y < 64 ? 'below' : 'above' } }, at)
    tl.to(visual, { opacity: 1, duration: 0.12 }, at)
    tl.to(cursor, { ...startTip, duration: 0.2 }, at)
    const pickup = at + 0.2
    const drag = pickup + 0.12
    const duration = 0.7
    const dropped = drag + duration
    tl.to(cursor, { scale: 0.84, duration: 0.07 }, pickup)
    const ring = cursor.querySelector('[data-cursor-click]')!
    tl.set(ring, { scale: 0.5, opacity: 0.8 }, pickup)
    tl.to(ring, { scale: 1.65, opacity: 0, duration: 0.25 }, pickup + 0.05)
    tl.set(visual, { attr: { 'data-layout-phase': 'adjusting' } }, drag)
    // Cursor, content, guides and ruler markers share one easing and duration.
    moving.forEach(element => tl.to(element, { ...bases.get(element), duration }, drag))
    tl.to(cursor, { ...tip, duration }, drag)
    tl.to(frame, { x: box.x, y: box.y, duration }, drag)
    tl.to([guideX, markerX], { x: tip.x, duration }, drag)
    tl.to([guideY, markerY], { y: tip.y, duration }, drag)
    tl.to([measure, band], { scaleX: 1, scaleY: 1, duration }, drag)
    if (originOffset.x) {
      tl.to(fixedGuide, { x: origin.x, duration }, drag)
      tl.to([measure, band], { x: origin.x, duration }, drag)
    }
    if (topPadding) tl.to(topPadding, { x: tip.x, scaleY: 1, duration }, drag)
    if (kind !== 'padding') tl.to(badge, { x: badgeOrigin.x + (vertical ? 0 : (delta.x - originOffset.x) / 2), y: badgeOrigin.y + (vertical ? delta.y / 2 : 0), duration }, drag)
    tl.to(number, { textContent: to, snap: { textContent: 1 }, duration }, drag)
    if (topNumber) tl.to(topNumber, { textContent: tip.y - origin.y, snap: { textContent: 1 }, duration }, drag)
    tl.to(cursor, { scale: 1, duration: 0.08 }, dropped)
    tl.set(visual, { attr: { 'data-layout-phase': 'settled' } }, dropped)
    tl.to(visual, { opacity: 0, duration: 0.14 }, dropped + 0.3)
    release(target, role, dropped + 0.44)
    return dropped + 0.46
  }
  return { prepare, play, cleanup: () => visual?.remove() }
}
