import type { HomeSection } from '~/types/navigation'

/**
 * Lets a button take the visitor to a section of the home page the way a link
 * to it does: the address gains the section, Back returns to where they were,
 * and where the section lands and how it moves there are the stylesheet's.
 *
 * @returns `goToSection`, to call with a section's id, e.g. `barbershops`. It
 *   works from any page, in the language being read. It resolves once the
 *   visitor is on their way, and rejects if the router could not take them.
 */
export function useSectionLink() {
  const { homePath } = useHomeLink()

  const goToSection = (section: HomeSection) => navigateTo(`${homePath.value}#${section}`)

  return { goToSection }
}
