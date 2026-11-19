/**
 * Gives a server helper whose path ends in ".legacy" its file extension, so
 * the build loads that file and not the one beside it.
 *
 * `@nuxt/image` 2.2 names its helper for Nitro 2 "image.legacy", with no
 * ".js". Nitro's auto-imports drop the letters after the last dot of a path
 * as its extension, which leaves "image": the helper for Nuxt 4. That one
 * imports "nuxt/server", which Nuxt 3 does not have.
 *
 * @param path - where an auto-imported server helper comes from
 * @returns the path with ".js" added when it ends in ".legacy"; any other
 *   path as it was
 * @example
 * withLegacyFileExtension('/utils/image.legacy') // '/utils/image.legacy.js'
 */
export function withLegacyFileExtension(path: string): string {
  return path.endsWith('.legacy') ? `${path}.js` : path
}
