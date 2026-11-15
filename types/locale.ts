/**
 * One language the site is published in.
 */
export interface LocaleDefinition {
  /** Short code used in addresses and to name the translation file, e.g. `en` */
  code: string
  /** Full language tag announced to browsers and search engines, e.g. `en-US` */
  language: string
  /** The language's own name, shown in the selector */
  name: string
  /** Flag emoji shown beside the name in the selector */
  flag: string
}
