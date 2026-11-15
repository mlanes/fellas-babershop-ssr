/**
 * Tells a component where the home page is in the language being read, so a
 * link home never drops the visitor into another language.
 *
 * @returns `homePath`, the home page's address in the current language, and
 *   `isHome`, whether the visitor is on the home page in any language
 */
export function useHomeLink() {
  const localePath = useLocalePath()
  const routeBaseName = useRouteBaseName()
  const route = useRoute()

  return {
    homePath: computed(() => localePath('/')),
    isHome: computed(() => routeBaseName(route) === 'index'),
  }
}
