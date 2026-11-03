import gsap from 'gsap'

// Scene geometry is measured once. Follow its real anchor without changing the
// timeline's transforms, including the translated text inside the sticky scene.
export function trackBuildOverlay(overlay: HTMLElement, anchor: HTMLElement, followOpacity = false) {
  const origin = anchor.getBoundingClientRect()
  let previousX = 0
  let previousY = 0
  const update = () => {
    const box = anchor.getBoundingClientRect()
    const x = box.left - origin.left
    const y = box.top - origin.top
    if (x !== previousX) overlay.style.setProperty('--build-offset-x', `${x}px`)
    if (y !== previousY) overlay.style.setProperty('--build-offset-y', `${y}px`)
    previousX = x
    previousY = y
    // Keep offscreen scenes running, but don't leave their rulers on screen.
    overlay.style.visibility = box.bottom <= 0 || box.top >= innerHeight ? 'hidden' : ''
    if (followOpacity) overlay.style.opacity = getComputedStyle(anchor).opacity
  }
  gsap.ticker.add(update)
  return () => {
    gsap.ticker.remove(update)
    overlay.style.removeProperty('--build-offset-x')
    overlay.style.removeProperty('--build-offset-y')
    overlay.style.removeProperty('visibility')
    overlay.style.removeProperty('opacity')
  }
}
