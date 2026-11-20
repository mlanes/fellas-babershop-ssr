/**
 * Navigation item for header and footer links
 */
export interface NavigationItem {
  /** Display label (i18n key) */
  label: string
  /** Anchor link or route path */
  href: string
  /** Whether this navigation item is currently active */
  isActive?: boolean
}

/**
 * A menu item as the header and the footer show it.
 */
export interface MenuLink {
  /** The label, in the language being read */
  label: string
  /** The full address of the section, e.g. `/en/#about` */
  href: string
  /** The id of the home-page section it leads to, e.g. `about` */
  section: string
}
