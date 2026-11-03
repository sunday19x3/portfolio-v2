import styles from './home-build.module.css'

export function addLayoutRulers(parent: HTMLElement) {
  for (const axis of ['X', 'Y'] as const) {
    const ruler = document.createElement('span')
    ruler.className = axis === 'X' ? styles.rulerX : styles.rulerY
    parent.append(ruler)
    for (let value = 100; value < (axis === 'X' ? innerWidth : innerHeight); value += 100) {
      const label = document.createElement('span')
      label.className = axis === 'X' ? styles.rulerNumberX : styles.rulerNumberY
      label.textContent = String(value)
      label.style[axis === 'X' ? 'left' : 'top'] = `${value - (axis === 'Y' ? 20 : 0)}px`
      ruler.append(label)
    }
  }
}
