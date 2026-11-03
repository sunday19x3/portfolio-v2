import gsap from 'gsap'

type StyleKind = 'accent' | 'italic' | 'underline' | 'tag'
type StyleSpec = { element: HTMLElement; kind: StyleKind }

// Neutral paint and final paint share the same semantic text and layout. Italic
// needs a separate normal-font paint layer because changing its metrics would
// move the rest of the sentence and invalidate the typing/cursor coordinates.
export function createTextStylePass(specs: StyleSpec[], overlay: HTMLElement) {
  const records = specs.map(({ element, kind }) => {
    const style = getComputedStyle(element)
    const final: gsap.TweenVars = kind === 'italic' ? { opacity: 1 }
      : kind === 'underline' ? { backgroundSize: style.backgroundSize }
      : kind === 'tag' ? { borderColor: style.borderColor }
      : { color: style.color }
    const neutral: gsap.TweenVars = kind === 'italic' ? { opacity: 0 }
      : kind === 'underline' ? { backgroundSize: '0% 1px' }
      : kind === 'tag' ? { borderColor: 'transparent' }
      : { color: getComputedStyle(element.parentElement!).color }
    return { element, kind, final, neutral, draft: null as HTMLElement | null, draftWidth: 0, ends: [] as number[] }
  })

  const prepare = () => {
    for (const record of records) {
      const { element, kind } = record
      if (kind === 'italic') {
        const style = getComputedStyle(element)
        const source = document.createRange()
        source.selectNodeContents(element)
        const box = source.getBoundingClientRect()
        const draft = document.createElement('span')
        draft.textContent = element.textContent
        draft.dataset.buildStyleDraft = element.textContent ?? ''
        draft.setAttribute('aria-hidden', 'true')
        Object.assign(draft.style, {
          position: 'absolute', left: '0px', top: '0px', opacity: '0',
          whiteSpace: 'pre', pointerEvents: 'none', transformOrigin: '0 0',
          fontFamily: style.fontFamily, fontSize: style.fontSize,
          fontWeight: style.fontWeight, fontStyle: 'normal', lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing, color: getComputedStyle(element.parentElement!).color,
        })
        overlay.append(draft)
        record.draft = draft
        const range = document.createRange()
        range.selectNodeContents(draft)
        const natural = range.getBoundingClientRect()
        const scale = box.width / Math.max(1, natural.width)
        record.draftWidth = draft.getBoundingClientRect().width
        // Measure the draft before positioning it. The source keeps its italic
        // width; only this normal-font paint is fitted into that reserved space.
        let offset = 0
        for (const char of Array.from(draft.textContent ?? '')) {
          range.setStart(draft.firstChild!, offset)
          offset += char.length
          range.setEnd(draft.firstChild!, offset)
          record.ends.push(range.getBoundingClientRect().right)
        }
        Object.assign(draft.style, {
          left: `${box.left - natural.left * scale}px`, top: `${box.top - natural.top}px`,
          transform: `scaleX(${scale})`,
        })
      }
      gsap.set(element, { ...record.neutral, attr: { 'data-build-style-state': 'draft' } })
    }
  }

  const reveal = (tl: gsap.core.Timeline, node: Node, offset: number, at: number) => {
    for (const record of records) {
      if (!record.draft || !record.element.contains(node)) continue
      const index = Array.from((node.textContent ?? '').slice(0, offset)).length - 1
      const right = record.ends[index] ?? record.draftWidth
      tl.set(record.draft, { opacity: 1, clipPath: `inset(-32px ${Math.max(0, record.draftWidth - right)}px -32px -8px)` }, at)
    }
  }

  const apply = (tl: gsap.core.Timeline, target: HTMLElement, at: number) => {
    for (const record of records) {
      if (record.element !== target && !target.contains(record.element)) continue
      tl.set(record.element, { ...record.final, attr: { 'data-build-style-state': 'applied' } }, at)
      if (record.draft) tl.set(record.draft, { opacity: 0 }, at)
    }
  }

  const cleanup = () => records.forEach(record => {
    record.draft?.remove()
    record.element.removeAttribute('data-build-style-state')
  })

  const showDraft = (tl: gsap.core.Timeline, target: HTMLElement, at: number) => {
    records.forEach(record => {
      if (record.draft && target.contains(record.element)) tl.set(record.draft, { opacity: 1, clipPath: 'none' }, at)
    })
  }

  return { prepare, reveal, apply, cleanup, showDraft }
}

export function sectionTextStyles(root: HTMLElement, overlay: HTMLElement) {
  const specs: StyleSpec[] = []
  const selectors: [string, StyleKind][] = [
    ['.sticky__emph', 'italic'], ['.stack__kw-text', 'underline'],
    ['.project__no, .heatmap__stat-number', 'accent'], ['.pf-tag', 'tag'],
  ]
  for (const [selector, kind] of selectors) {
    root.querySelectorAll<HTMLElement>(selector).forEach(element => specs.push({ element, kind }))
  }
  return createTextStylePass(specs, overlay)
}
