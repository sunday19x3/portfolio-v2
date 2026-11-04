import gsap from 'gsap'

export const CURSOR_EXIT_DURATION = 0.64

// A viewport-space snapshot can leave independently while the original cursor
// is handed to another task or its scroll-tracked canvas moves away.
export function exitCursor(timeline: gsap.core.Timeline, cursor: HTMLElement, at: number) {
  let flight: HTMLElement | undefined
  const canvas = cursor.parentElement!
  // Register disposal with the scene context, including interrupted playback.
  gsap.context(() => () => flight?.remove())

  const motion = { progress: 0 }
  let x = 0, y = 0, dx = 0, dy = 0
  let c1x = 0, c1y = 0, c2x = 0, c2y = 0, sway = 0
  let arrow: SVGElement | null = null
  timeline.call(() => {
    const box = cursor.getBoundingClientRect()
    const css = getComputedStyle(cursor)
    const parentStyle = getComputedStyle(canvas)
    const opacity = Number(css.opacity) * Number(parentStyle.opacity)
    // Handoffs can release an already hidden template more than once.
    if (css.visibility === 'hidden' || opacity === 0) return
    flight = cursor.cloneNode(true) as HTMLElement
    flight.removeAttribute('style')
    flight.removeAttribute('data-task-cursor')
    flight.removeAttribute('data-build-cursor')
    flight.dataset.exitCursor = ''
    flight.setAttribute('aria-hidden', 'true')
    // Task/role attributes also control label anchors. Freeze the resolved
    // geometry before the snapshot loses those selectors during its flight.
    const label = cursor.querySelector<HTMLElement>('[data-cursor-name]')
    const flightLabel = flight.querySelector<HTMLElement>('[data-cursor-name]')
    if (label && flightLabel) {
      const labelStyle = getComputedStyle(label)
      Object.assign(flightLabel.style, {
        left: labelStyle.left, top: labelStyle.top,
        right: 'auto', bottom: 'auto',
        width: labelStyle.width, height: labelStyle.height,
      })
    }
    x = box.left
    y = box.top
    const margin = 160
    const edges = [
      { distance: x, x: -margin, y },
      { distance: innerWidth - x, x: innerWidth + margin, y },
      { distance: y, x, y: -margin },
      { distance: innerHeight - y, x, y: innerHeight + margin },
    ]
    const edge = edges.reduce((nearest, next) => next.distance < nearest.distance ? next : nearest)
    dx = edge.x - x
    dy = edge.y - y
    const distance = Math.hypot(dx, dy)
    const ux = dx / distance, uy = dy / distance
    const nx = -uy, ny = ux
    sway = (Math.random() < 0.5 ? -1 : 1) * Math.min(240, 110 + distance * 0.25)
    // Catch the wind inward, sweep across the departure direction, then
    // counter-bank into the exit. Vary the bend so workers don't fly in formation.
    const pullback = Math.min(55, distance * 0.14)
    c1x = -ux * pullback + nx * sway
    c1y = -uy * pullback + ny * sway
    c2x = dx * 0.58 - nx * sway * 0.8
    c2y = dy * 0.58 - ny * sway * 0.8
    dx += nx * sway * 0.35
    dy += ny * sway * 0.35
    arrow = flight.querySelector('svg')
    if (arrow) arrow.style.transformOrigin = '2px 2px'
    flight.dataset.dock = cursor.dataset.dock ?? 'above'
    flight.dataset.buildTask = cursor.dataset.buildTask ?? ''
    flight.dataset.buildPhase = 'exiting'
    flight.style.opacity = String(opacity)
    flight.style.transform = `translate3d(${x}px, ${y}px, 0)`
    canvas.parentElement!.append(flight)
  }, [], at)
  timeline.set(cursor, { opacity: 0 }, at)
  timeline.to(motion, {
    progress: 1, duration: CURSOR_EXIT_DURATION, ease: 'power1.in',
    onUpdate: () => {
      if (!flight) return
      const t = motion.progress, remaining = 1 - t
      const px = x + 3 * remaining * remaining * t * c1x + 3 * remaining * t * t * c2x + t * t * t * dx
      const py = y + 3 * remaining * remaining * t * c1y + 3 * remaining * t * t * c2y + t * t * t * dy
      const bank = Math.sin(t * Math.PI * 2) * 24 * Math.sign(sway)
      flight.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${bank * 0.2}deg)`
      if (arrow) arrow.style.transform = `rotate(${bank}deg)`
    },
  }, at)
  timeline.call(() => flight?.remove(), [], at + CURSOR_EXIT_DURATION)
}
