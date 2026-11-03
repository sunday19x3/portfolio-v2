import styles from './home-build.module.css'

const CURSOR_NAMES = ['Milo', 'Luna', 'Kai', 'Nora', 'Finn', 'Aria', 'Theo', 'Mia', 'Leo', 'Remi', 'Juno', 'Alex', 'Sage', 'Iris', 'Noah', 'Ruby', 'Ezra', 'Zoe', 'Owen', 'Ada', 'Jude', 'Cleo', 'Luca', 'Eden', 'Otis', 'Alma', 'Hugo', 'Isla', 'Elio', 'Romy', 'Leon', 'Vera']
const CURSOR_STYLES = {
  Design: styles.design, Copy: styles.copy, Build: styles.build,
  HeroTitle: styles.heroTitle, HeroCopy: styles.heroCopy,
  HeroTop: styles.heroTop, HeroBottom: styles.heroBottom,
  TickerDesign: styles.design, TickerCopy: styles.copy,
  WorkDesign: styles.design, WorkCopy: styles.copy,
  SceneDesign: styles.design, SceneCopy: styles.copy,
  SceneBuild: styles.build, SceneDetail: styles.heroTitle,
}

export function assignCursorNames(cursors: Iterable<HTMLElement>, reserved: string[] = []) {
  const available = CURSOR_NAMES.filter(name => !reserved.includes(name))
  for (const cursor of cursors) {
    const index = Math.floor(Math.random() * available.length)
    cursor.querySelector<HTMLElement>('[data-cursor-name]')!.textContent = available.splice(index, 1)[0] ?? `Alex ${Math.floor(Math.random() * 1000)}`
  }
}

export function BuildCursor({ role }: { role: keyof typeof CURSOR_STYLES }) {
  return (
    <div className={`${styles.cursor} ${CURSOR_STYLES[role]}`} data-build-cursor={role}>
      <span className={styles.cursorClick} data-cursor-click data-click-phase='idle' />
      <svg viewBox='0 0 24 24' className={styles.arrow}>
        <path d='M2 2L21 9.5L12 12L9.5 21Z' fill='currentColor' stroke='#fff' strokeWidth='1' strokeLinejoin='round' />
      </svg>
      <span className={styles.cursorLabel} data-cursor-name />
    </div>
  )
}

export function BuildFrame({ name, className }: { name: string; className: string }) {
  return (
    <span className={`${styles.frame} ${className}`} data-build-frame={name}>
      <i className={styles.horizontalEdge} data-edge='top' />
      <i className={styles.verticalEdge} data-edge='right' />
      <i className={styles.horizontalEdge} data-edge='bottom' />
      <i className={styles.verticalEdge} data-edge='left' />
      <i className={styles.frameHandle} />
      <i className={styles.frameHandle} data-frame-end />
    </span>
  )
}
