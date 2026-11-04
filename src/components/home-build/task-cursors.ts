import gsap from 'gsap'
import { assignCursorNames } from './BuildPrimitives'
import styles from './home-build.module.css'

const COLORS = [styles.design, styles.copy, styles.build, styles.heroTitle, styles.heroCopy, styles.heroTop, styles.heroBottom]
let nextTaskId = 0

// A worker exists for one real operation. Its lifetime is the operation's
// lifetime; no followers, inspection loops, or parked decorative pointers.
export function createTaskCursors(overlay: HTMLElement, register?: (node: HTMLElement) => void) {
  const nodes = new Set<HTMLElement>()
  const create = (task: string, target: HTMLElement) => {
    const template = overlay.querySelector<HTMLElement>('[data-build-cursor]')!
    const cursor = template.cloneNode(true) as HTMLElement
    const id = `task-${++nextTaskId}`
    cursor.removeAttribute('style')
    cursor.removeAttribute('data-build-cursor')
    cursor.className = `${styles.cursor} ${COLORS[nextTaskId % COLORS.length]}`
    cursor.dataset.taskCursor = id
    cursor.dataset.buildTask = task
    cursor.dataset.taskTarget = target.dataset.buildText ?? target.dataset.heroText ?? target.className ?? target.tagName
    const reserved = Array.from(document.querySelectorAll<HTMLElement>('[data-task-cursor], [data-build-cursor]'))
      .filter(other => other.hasAttribute('data-task-cursor') || other.parentElement === overlay || Number(gsap.getProperty(other, 'opacity')) > 0)
      .map(other => other.querySelector('[data-cursor-name]')?.textContent ?? '')
    assignCursorNames([cursor], reserved)
    overlay.append(cursor)
    nodes.add(cursor)
    register?.(cursor)
    return cursor
  }
  const start = (tl: gsap.core.Timeline, cursor: HTMLElement, at: number, x: number, y: number) => {
    tl.set(cursor, { x, y, opacity: 0, attr: { 'data-build-phase': 'working', 'data-dock': y < 64 ? 'below' : x > innerWidth - 110 ? 'left' : 'above' } }, at)
    tl.to(cursor, { opacity: 1, duration: 0.08 }, at)
  }
  const end = (tl: gsap.core.Timeline, cursor: HTMLElement, at: number) => {
    tl.to(cursor, { opacity: 0, duration: 0.1 }, at)
    tl.set(cursor, { attr: { 'data-build-phase': 'complete' } }, at + 0.1)
  }
  return { create, start, end, cleanup: () => nodes.forEach(node => node.remove()) }
}
