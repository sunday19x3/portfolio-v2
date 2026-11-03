import type gsap from 'gsap'

// A visible mouse-down/up at the measured word position. Callers apply the
// style at the returned release time, while the click ring is still visible.
export function styleClick(timeline: gsap.core.Timeline, cursor: HTMLElement, at: number) {
  const ring = cursor.querySelector<HTMLElement>('[data-cursor-click]')!
  timeline.set(ring, { scale: 0.5, opacity: 0.9, attr: { 'data-click-phase': 'pressed' } }, at)
  timeline.to(cursor, { scale: 0.82, duration: 0.07 }, at)
  timeline.to(cursor, { scale: 1, duration: 0.11 }, at + 0.07)
  timeline.to(ring, { scale: 1.75, opacity: 0, duration: 0.34, ease: 'power2.out' }, at + 0.07)
  timeline.set(ring, { attr: { 'data-click-phase': 'idle' } }, at + 0.41)
  return at + 0.09
}
