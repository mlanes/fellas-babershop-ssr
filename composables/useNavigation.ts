import { navigationItems } from '~/data/navigation'
import type { NavigationItem } from '~/types/navigation'

/**
 * Gives the main menu's items with their labels in the language being read.
 *
 * @returns `items`: each with its translated `label` and the `href` of the
 *   home-page section it leads to, e.g. `#about`
 */
export function useNavigation() {
  const { t } = useLocale()

  const items = computed<NavigationItem[]>(() =>
    navigationItems.map((item) => ({ ...item, label: t(item.label) }))
  )

  return { items }
}
