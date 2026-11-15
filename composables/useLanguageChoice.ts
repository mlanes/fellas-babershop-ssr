const STORAGE_KEY = 'fellas-language-chosen'

/**
 * Remembers, in this browser only, whether the visitor has picked a language
 * in the selector. The cookie the i18n module keeps cannot tell: on a first
 * visit the module saves the default language as if it had been chosen.
 *
 * @returns `wasChosen`, which reads the mark, and `markChosen`, which sets it.
 *   Both must be called in the browser.
 */
export function useLanguageChoice() {
  return {
    wasChosen: () => localStorage.getItem(STORAGE_KEY) !== null,
    markChosen: () => localStorage.setItem(STORAGE_KEY, 'yes'),
  }
}
