import gsap from 'gsap'
import { styleClick } from './style-click'
import styles from './home-build.module.css'

type TypeOptions = { text?: string; inheritFrom?: HTMLElement; onStyled?: (at: number) => void }

function plainText(element: HTMLElement) {
  const copy = element.cloneNode(true) as HTMLElement
  copy.querySelectorAll('.flip__b, .stack__tip, [data-build-exclude], [data-build-ink]').forEach(node => node.remove())
  copy.querySelectorAll('br').forEach(node => node.replaceWith('\n'))
  copy.querySelectorAll('.pf-tag').forEach(node => node.after(' '))
  copy.querySelectorAll('.contact__social-name, .heatmap__stat-number, .heatmap__stat-label').forEach(node => node.after('\n'))
  return (copy.textContent ?? '').replace(/[\t ]+/g, ' ').trim()
}

// All draft paint lives in the aria-hidden overlay. The semantic text retains
// its final geometry; only the draft uses a basic system font and 16px size.
export function createTypographyPass(overlay: HTMLElement) {
  const nodes = new Set<HTMLElement>()
  const sources = new Set<HTMLElement>()
  const make = (className: string) => {
    const node = document.createElement('span')
    node.className = className
    node.setAttribute('aria-hidden', 'true')
    overlay.append(node)
    nodes.add(node)
    return node
  }
  const type = (tl: gsap.core.Timeline, element: HTMLElement, cursor: HTMLElement, caret: HTMLElement, at: number, duration: number, options: TypeOptions = {}) => {
    const text = options.text ?? plainText(element)
    const box = element.getBoundingClientRect()
    if (!text || !/[\p{L}\p{N}]/u.test(text)) {
      tl.set(element, { opacity: 1, clipPath: 'none' }, at)
      options.onStyled?.(at)
      return at + duration
    }
    sources.add(element)
    const draft = make(styles.basicText)
    draft.dataset.typographyDraft = element.dataset.buildText || element.tagName.toLowerCase()
    Object.assign(draft.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${Math.max(24, Math.min(box.width, innerWidth - box.left - 12))}px` })
    // Editing a duplicate inherits the source's typography from the first
    // character. It is a content replacement, not another style-building pass.
    if (options.inheritFrom) {
      const sourceStyle = getComputedStyle(options.inheritFrom)
      Object.assign(draft.style, {
        fontFamily: sourceStyle.fontFamily, fontSize: sourceStyle.fontSize,
        fontWeight: sourceStyle.fontWeight, fontStyle: sourceStyle.fontStyle,
        lineHeight: sourceStyle.lineHeight, letterSpacing: sourceStyle.letterSpacing,
        color: sourceStyle.color, textTransform: sourceStyle.textTransform,
        textAlign: sourceStyle.textAlign, whiteSpace: sourceStyle.whiteSpace,
      })
      draft.dataset.typographyInherited = 'true'
    }
    const letters = Array.from(text, char => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.opacity = '0'
      draft.append(span)
      return span
    })
    const rects = letters.map(letter => letter.getBoundingClientRect())
    const right = Math.max(...rects.map(rect => rect.right))
    gsap.set(draft, { opacity: 0 })
    gsap.set(element, { opacity: 0 })
    const phase = (value: string, when: number) => {
      tl.set(element, { attr: { 'data-typography-state': value } }, when)
      tl.set(cursor, { attr: { 'data-build-phase': value === 'styled' ? 'typography' : 'typing' } }, when)
    }
    phase(options.inheritFrom ? 'inherited' : 'basic', at)
    tl.set(draft, { opacity: 1 }, at)
    letters.forEach((letter, index) => {
      const when = at + (index + 1) * duration / letters.length
      const r = rects[index]
      tl.set(letter, { opacity: 1 }, when)
      tl.set(caret, { x: r.right + 1, y: r.top, height: r.height, opacity: 1 }, when)
    })
    const typed = at + duration
    tl.set(caret, { opacity: 0 }, typed + 0.04)
    if (options.inheritFrom) {
      tl.set(draft, { opacity: 0 }, typed + 0.04)
      tl.set(element, { opacity: 1, clipPath: 'none' }, typed + 0.04)
      return typed + 0.16
    }
    const clickX = Math.max(16, Math.min(innerWidth - 24, box.left + Math.min(right - box.left, 320) / 2))
    const clickY = box.top + 11
    tl.set(cursor, { attr: { 'data-dock': clickY < 64 ? 'below' : 'above' } }, typed + 0.06)
    tl.to(cursor, { x: clickX, y: clickY, duration: 0.16 }, typed + 0.06)
    const applied = styleClick(tl, cursor, typed + 0.22)
    phase('styled', applied)
    tl.set(draft, { opacity: 0 }, applied)
    tl.set(element, { opacity: 1, clipPath: 'none' }, applied)
    options.onStyled?.(applied)
    return applied + 0.16
  }
  const cleanup = () => {
    nodes.forEach(node => node.remove())
    sources.forEach(element => element.removeAttribute('data-typography-state'))
  }
  return { type, cleanup, caret: () => make(styles.heroCaret) }
}
