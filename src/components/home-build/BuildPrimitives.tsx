import styles from './home-build.module.css'

const CURSOR_NAMES = [
  'Milo', 'Luna', 'Kai', 'Nora', 'Finn', 'Aria', 'Theo', 'Mia',
  'Leo', 'Remi', 'Juno', 'Alex', 'Sage', 'Iris', 'Noah', 'Ruby',
  'Ezra', 'Zoe', 'Owen', 'Ada', 'Jude', 'Cleo', 'Luca', 'Eden',
  'Otis', 'Alma', 'Hugo', 'Isla', 'Elio', 'Romy', 'Leon', 'Vera',
  'Aiden', 'Alice', 'Amir', 'Anya', 'Arlo', 'Asher', 'Ava', 'Axel',
  'Beau', 'Bella', 'Ben', 'Blair', 'Blake', 'Bodhi', 'Briar', 'Bryn',
  'Caleb', 'Cara', 'Cass', 'Celia', 'Cody', 'Cora', 'Cyrus', 'Daisy',
  'Dante', 'Dara', 'Dean', 'Demi', 'Drew', 'Dylan', 'Eli', 'Ella',
  'Ellis', 'Elsa', 'Ember', 'Emil', 'Emma', 'Enzo', 'Esme', 'Evan',
  'Faye', 'Felix', 'Fern', 'Flora', 'Flynn', 'Freya', 'Gael', 'Gemma',
  'Gia', 'Grace', 'Gus', 'Hana', 'Hank', 'Hazel', 'Heath', 'Hope',
  'Ida', 'Imani', 'Inez', 'Isaac', 'Ivan', 'Ivy', 'Jace', 'Jade',
  'Jasper', 'Jay', 'Jenna', 'Joel', 'Jonah', 'Josie', 'Joy', 'June',
  'Kara', 'Keira', 'Ken', 'Kian', 'Kira', 'Kit', 'Lana', 'Lara',
  'Leah', 'Lena', 'Levi', 'Lila', 'Lily', 'Lois', 'Lola', 'Lou',
  'Mae', 'Mara', 'Marco', 'Maya', 'Micah', 'Miles', 'Mira', 'Nadia',
  'Nash', 'Nell', 'Nico', 'Nina', 'Noel', 'Nova', 'Olive', 'Omar',
  'Opal', 'Orion', 'Oscar', 'Paige', 'Pearl', 'Piper', 'Quinn', 'Rae',
  'Reed', 'Reese', 'Rhea', 'Rhys', 'Rio', 'River', 'Rose', 'Rowan',
  'Ruth', 'Sam', 'Skye', 'Tara', 'Tess', 'Uma', 'Wren', 'Yara',
]
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
  const used = new Set(reserved)
  const available = CURSOR_NAMES.filter(name => !used.has(name))
  for (const cursor of cursors) {
    const index = Math.floor(Math.random() * available.length)
    let name = available.splice(index, 1)[0]
    if (!name) {
      let suffix = 2
      let candidates = CURSOR_NAMES.map(base => `${base} ${suffix}`).filter(candidate => !used.has(candidate))
      while (!candidates.length) {
        suffix += 1
        candidates = CURSOR_NAMES.map(base => `${base} ${suffix}`).filter(candidate => !used.has(candidate))
      }
      name = candidates[Math.floor(Math.random() * candidates.length)]
    }
    used.add(name)
    cursor.querySelector<HTMLElement>('[data-cursor-name]')!.textContent = name
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
