import { navigationItems } from '~/data/navigation'
import type { MenuLink } from '~/types/navigation'

/**
 * Gives the main menu's items in the language being read.
 *
 * Each `href` is the section's full address and not a bare `#about`, so the
 * link works from any page, in a new tab and without scripts.
 *
 * @returns `items`: each with its translated `label`, the `href` of the
 *   home-page section it leads to, e.g. `/en/#about`, and that section's id
 */
export function useNavigation() {
  const { t } = useLocale()
  const { homePath } = useHomeLink()

  const items = computed<MenuLink[]>(() =>
    navigationItems.map((item) => ({
      label: t(item.label),
      href: `${homePath.value}${item.href}`,
      section: item.href.slice(1),
    }))
  )

  return { items }
}
