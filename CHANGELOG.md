# Changelog

What changed on fellasbarber.com, newest first. Written for someone who wants to know what a release did, not how; the pull requests have the detail.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow the scheme in the project guide: MAJOR for a redesign, MINOR for a new page, section or visitor-facing feature, PATCH for fixes, performance, copy and dependency updates.

Each pull request adds its line under **Unreleased**. A release renames that section to the version and date.

## Unreleased

## 1.1.2 - 2026-11-16

### Fixed

- Visitors no longer download all four hero videos, about 18 MB, in the background. The page was asking browsers to fetch them ahead of time, and loaded the phone and the wide-screen video together. Now only the one shown on the visitor's screen is loaded.

### Maintenance

- Lint, the type-check and both test suites now run on GitHub for every pull request, on all five browser projects.
- The accessibility scans stop the page's rotating content first. The earlier approach, repeating a scan that a rotation had disturbed, could give up on a slow machine.
- Removed code and a dependency that nothing used: two scroll helpers, one type, and a direct `chrome-launcher` entry that Lighthouse already brings.

## 1.1.1 - 2026-11-15

### Added

- The home page's title and description are in the page's language, in the browser tab, in search results and when a link is shared.
- The sitemap gives each language's home page its sister pages in the other languages.
- The business details given to search engines name the language and address of the page they are on.

### Changed

- A shared link shows the same title and description as a search result. The Portuguese share texts were shorter variants of their own.

## 1.1.0 - 2026-11-15

### Added

- Each language has its own address. Portuguese stays at `/`, and English, Spanish and French are at `/en`, `/es` and `/fr`, for every page.
- A visitor who opens the home address is taken to their language: the one they picked in the language selector, otherwise their browser's language, otherwise English when the site does not have it.
- Picking a language keeps the visitor on the page they were reading and changes the address to match.
- Every page tells search engines where the same page is in the other three languages.

### Changed

- The home address is now Portuguese for search engines. It was being indexed in English.
- An address that names a language is always shown in that language, whatever the browser's language or an earlier choice.
- Menu links, the logo, the booking button and the "back home" link stay in the language being read.
- Footer link hover, the selected language option and the outline button use a darker red in the light theme, for readable contrast.

### Maintenance

- Security updates: known vulnerabilities reduced from 114 to 39, none critical.
- `@nuxtjs/i18n` 9 to 10, `nuxt-svgo` 4 to 5, Playwright 1.60 to 1.65.
- Removed an inline loader that was never shown.
- Tests now also run against the built site, which is where language behaviour can differ from development.
- Lint no longer walks generated folders: about 4 seconds, down from more than 14 minutes.

## 1.0.1 - 2026-11-14

### Fixed

- Brand-red text (menu links, the services page number, the "View on Map" button and the coming-soon "back home" button) is readable in both themes.
- `robots.txt` and the sitemap point at fellasbarber.com.

### Changed

- The old `netlify.app` address redirects to fellasbarber.com.

### Maintenance

- Node 24, and a type-check command.

## 1.0.0 - 2026-05-22

Baseline release of the site.
