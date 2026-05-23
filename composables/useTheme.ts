export type Theme = 'light' | 'dark' | 'auto'

const THEME_STORAGE_KEY = 'fellas-theme-preference'

export function useTheme() {
  const currentTheme = ref<Theme>('auto')
  const isDark = ref(false)

  /**
   * Get system preference for dark mode
   */
  const getSystemPreference = (): boolean => {
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }

  /**
   * Apply theme to document
   */
  const applyTheme = (theme: Theme, withTransition = false) => {
    if (!import.meta.client) return

    const htmlElement = document.documentElement

    // Add transition class if requested
    if (withTransition) {
      htmlElement.classList.add('theme-transitioning')
    }

    if (theme === 'auto') {
      // Remove explicit theme attribute to allow media query to work
      htmlElement.removeAttribute('data-theme')
      isDark.value = getSystemPreference()
    } else {
      // Set explicit theme
      htmlElement.setAttribute('data-theme', theme)
      isDark.value = theme === 'dark'
    }

    // Remove transition class after animation completes
    if (withTransition) {
      setTimeout(() => {
        htmlElement.classList.remove('theme-transitioning')
      }, 300) // Match transition duration
    }
  }

  /**
   * Set theme preference
   */
  const setTheme = (theme: Theme, withTransition = false) => {
    currentTheme.value = theme
    applyTheme(theme, withTransition)
    if (import.meta.client) {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    setTheme(newTheme, true) // Enable transition when toggling
  }

  /**
   * Initialize theme from storage or system preference
   */
  const initTheme = () => {
    if (!import.meta.client) return

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null

    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      currentTheme.value = savedTheme
    } else {
      currentTheme.value = 'auto'
    }

    applyTheme(currentTheme.value)
  }

  /**
   * Listen for system theme changes when in auto mode
   */
  const setupSystemThemeListener = () => {
    if (!import.meta.client) return () => {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (currentTheme.value === 'auto') {
        isDark.value = e.matches
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  onMounted(() => {
    initTheme()
    return setupSystemThemeListener()
  })

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
