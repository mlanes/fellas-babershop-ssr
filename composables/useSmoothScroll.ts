/**
 * Composable for smooth scrolling to page sections
 */
export function useSmoothScroll() {
  const scrollTo = (target: string, offset = 0) => {
    if (!import.meta.client) return

    const element = document.querySelector(target)
    if (!element) return

    // Emit custom event to notify that programmatic scroll is starting
    window.dispatchEvent(
      new CustomEvent('programmatic-scroll-start', {
        detail: { target },
      })
    )

    const top = element.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })

    // If scrolling to home, emit event when scroll completes
    if (target === '#home') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scrolled-to-home'))
      }, 1000) // Wait for smooth scroll to complete
    }
  }

  return { scrollTo }
}
