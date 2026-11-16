# Fellas Barbershop

A modern, responsive web application for Fellas Barbers — a premium barbershop with three locations in Lisbon, Portugal. Built with Nuxt 3, TypeScript and deployed on Netlify.

**Live site:** [fellasbarber.com](https://fellasbarber.com)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Design System & Storybook](#design-system--storybook)
- [Testing](#testing)
- [Deployment](#deployment)
- [Internationalization](#internationalization)
- [Design](#design)
- [Contributing](#contributing)

## Overview

A marketing/showcase site for a three-location barbershop, prerendered at build time for fast initial load and indexed via JSON-LD structured data. Four languages, dark/light theming, PWA installable, fully responsive.

## Features

### Core

- **SSR + prerendering**: All pages prerendered at build via Nuxt 3 + Nitro; runtime image transformation through Netlify's image service
- **Responsive**: Mobile, tablet and desktop layouts; the gallery scrollytelling effect only activates ≥1024px so touch devices scroll naturally
- **Dark/light theme**: Manual toggle + automatic system-preference detection, no boot flash
- **i18n**: Portuguese (default), English, Spanish, French, each at its own address (`/`, `/en`, `/es`, `/fr`)
- **PWA**: Installable, Workbox-cached fonts/images/videos for offline-friendly return visits
- **A11y**: WCAG 2.1 AA target sizes, ARIA landmarks, modal focus trap, keyboard-navigable language selector

### Sections

- Hero with looping background video (separate desktop/mobile sources + real poster frame)
- Services overview and full pricing list
- Infinite-scroll gallery (desktop pinned scrollytelling, mobile/tablet continuous CSS drift)
- Before/after slider
- Customer testimonials carousel
- Three barbershop locations with image carousel and external booking links

### Performance

- **@nuxt/image**: Auto WebP/AVIF, responsive srcset, native lazy + async decode
- **Self-hosted fonts**: Raleway and Bebas Neue via `@fontsource/*`, no Google Fonts CDN round-trips
- **Re-encoded mobile hero video**: 6.1 MB → ~6 MB combined, audio dropped (video is muted)
- **JSON-LD structured data**: Organization + WebSite + per-location BarberShop schemas
- **Canonical + hreflang links** on every page

## Tech Stack

| Category      | Tech                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| Framework     | Nuxt 3, Vue 3, TypeScript                                                     |
| Server        | Nitro (Netlify preset)                                                        |
| State         | Pinia                                                                         |
| i18n          | @nuxtjs/i18n                                                                  |
| Images        | @nuxt/image (Netlify image service in prod, IPX locally)                      |
| Fonts         | @fontsource/raleway, @fontsource/bebas-neue (self-hosted)                     |
| SEO           | @nuxtjs/sitemap, runtime JSON-LD, dynamic canonical/hreflang                  |
| PWA           | @vite-pwa/nuxt (Workbox)                                                      |
| Styling       | SCSS with CSS custom properties for theming, nuxt-svgo for SVGs               |
| Design system | Storybook 9 (`@storybook-vue/nuxt`) — Foundations docs + component playground |
| Tests         | Playwright (e2e), Lighthouse (`npm run lighthouse`)                           |
| Lint/format   | ESLint, Prettier                                                              |

## Project Structure

```
fellas-babershop-spa/
├── app.vue                       # Root component (lang, canonical, JSON-LD)
├── nuxt.config.ts                # Modules, head, image, PWA, i18n config
├── netlify.toml                  # Netlify build config
├── .npmrc                        # legacy-peer-deps (see Storybook section)
├── .storybook/
│   ├── main.ts                   # Story globs + framework
│   ├── preview.ts                # Global SCSS, theme toolbar, sidebar order
│   └── docs/                     # MDX Foundations pages (Colors / Typography / Spacing)
├── assets/
│   ├── img/                      # SVG-only assets (logos, decorations)
│   ├── styles/                   # SCSS tokens, mixins, themes, typography
│   └── videos/                   # Hero background videos
├── components/
│   ├── layout/                   # AppHeader, AppFooter
│   ├── sections/                 # Home page sections (Hero, Services, …)
│   └── ui/                       # Reusable primitives + co-located *.stories.ts
├── composables/                  # useTheme, useLocale, useBarbershops, useStructuredData, …
├── data/                         # Static content (services, testimonials, contact, navigation)
├── i18n/locales/                 # pt.json, en.json, es.json, fr.json
├── pages/                        # File-based routing (/, /services, /gallery, /contacts, /score)
├── public/
│   ├── images/                   # Runtime images (services, gallery, barbershops, before-after, hero posters)
│   ├── favicon.svg, robots.txt …
├── tests/e2e/                    # Playwright specs
└── types/                        # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher

### Installation

```bash
git clone <repository-url>
cd fellas-babershop-spa
npm install
npm run dev   # http://localhost:3000
```

## Development

### Available Scripts

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build (Netlify preset on Netlify, Node server elsewhere)
npm run generate     # Static prerender to ./dist
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm run format       # Prettier
npm run test:e2e     # Playwright headless
npm run test:e2e:ui  # Playwright UI mode
npm run lighthouse   # Lighthouse audit against fellasbarber.com, opens HTML report
npm run storybook    # Storybook dev server on :6006
npm run build-storybook  # Static Storybook to ./storybook-static
```

### Environment Variables

`.env` for local overrides:

```env
VITE_APP_TITLE=Fellas Barbers
VITE_BOOKING_URL=https://booking.example.com
VITE_INSTAGRAM_URL=https://instagram.com/fellasbarber.pt
VITE_GOOGLE_ANALYTICS_ID=
```

### Theme System

- `data-theme="light|dark"` set on `<html>`.
- An inline script in `nuxt.config.ts` applies the theme **before** Vue hydrates so there is no flash. Don't touch that without testing the boot.
- `composables/useTheme.ts` exposes `toggleTheme()` and persists the choice in `localStorage`.

### Adding Things

| Want to add           | Where                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| A service             | `data/services.ts` + `i18n/locales/*.json` under `servicesList.<id>`                                                             |
| A barbershop location | `composables/useBarbershops.ts`, drop images in `public/images/barbershops/<id>/`, add `barbershops.units.<id>` translations     |
| A gallery image       | Drop in `public/images/gallery/`, append filename to the `galleryFilenames` array in `GalleryScrollSection.vue`                  |
| A page                | `pages/<name>.vue`, add it to `pages` or `comingSoonPages` at the top of `nuxt.config.ts`, add nav entry in `data/navigation.ts` |
| A language            | `data/locales.ts` + a translation file `i18n/locales/<code>.json`                                                                |

### Conventions

- Runtime image assets live in `public/images/<topic>/`. Reference as `/images/...` strings and render via `<NuxtImg>`, not `<img>`, so they pick up WebP/AVIF + responsive srcset.
- SVGs stay in `assets/img/` and import as Vue components via `nuxt-svgo`.
- TypeScript everywhere; new data shapes get interfaces in `types/`.
- `F*`-prefixed components are reusable UI primitives — keep them business-logic-free.
- Strings that the user sees go through the `t()` translation helper.

## Design System & Storybook

The reusable `F*`-prefixed primitives in `components/ui/` are the design
system: `FButton`, `FIcon`, `FLogo`, `FLogoFooter`, `FLanguageSelector`,
`FEyebrow`, `FSectionHeading`, `FModal`, plus `BeforeAfterSlider`.
Section components (`components/sections/`) are page-level and
data-coupled — they consume primitives but aren't part of the design
system surface.

### Running it

```bash
npm run storybook          # dev server at http://localhost:6006
npm run build-storybook    # static build to ./storybook-static
```

### Sidebar layout

- **Introduction** — design system overview
- **Foundations** — MDX docs visualising the tokens (Colors, Typography,
  Spacing). Source of truth stays in `assets/styles/`.
- **Components** — every `F*` primitive with prop controls (auto-inferred
  from its TS prop interface), side-by-side size/variant stories, and an
  autodoc page

The toolbar's paintbrush flips every story between **Light** and **Dark**
themes via `data-theme`.

### Adding a component story

1. Drop `MyComponent.stories.ts` next to the component in `components/ui/`.
2. Set `title: 'Components/MyComponent'`.
3. Use `tags: ['autodocs']` for an auto-generated docs page.

### Storybook + Nuxt quirk

The `.npmrc` at the repo root sets `legacy-peer-deps=true`. The latest
stable `@nuxtjs/storybook@9.0.1` ships contradictory peer-dep metadata
(declares `storybook@~9.0.5` but its own bundled deps need `^9.1.x`).
`legacy-peer-deps` is the standard workaround until a fixed
`@nuxtjs/storybook` release lands. **`@nuxtjs/storybook` is deliberately
_not_ in the `nuxt.config.ts` modules array** — the Storybook framework
(`@storybook-vue/nuxt`) boots Nuxt itself, and registering the module
during the Nuxt build path crashed `nuxt prepare` on Netlify.

## Testing

End-to-end coverage with Playwright across Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari:

```bash
npm run test:e2e -- --project=chromium     # single browser
npm run test:e2e                           # all 5 projects
npm run test:e2e:ui                        # interactive UI mode
npm run test:e2e:built                     # built, prerendered site (see below)
npm run test:e2e:all                       # both of the above; run this before a pull request
npm run test:stories                       # every Storybook story, scanned for accessibility
```

`test:e2e` runs against the dev server, which renders every request afresh. The live site serves pages rendered once at build time, so `test:e2e:built` builds the site, serves it on port 3100 and runs the specs in `tests/e2e-built/`, plus the language-routing spec `tests/e2e/i18n.spec.ts`, against it. Anything decided during that build-time render, such as the page's language, can only be checked there. Stop `npm run dev` before running it: the build clears files the dev server is using, which makes it log errors and restart.

`test:stories` builds Storybook, serves it on port 6106 and scans each story with axe in the light and the dark theme (`tests/storybook/a11y.spec.ts`). The stories come from the build's own list, so a new story is scanned without being added anywhere. Pages and stories are held to the same bar, `blockingViolations` in `tests/accessibility.ts`. A story is scanned as it first appears: one that needs a click to show something, such as the modal, is not scanned open.

The spec files (`tests/e2e/*.spec.ts`) cover home page rendering, per-route 200s + titles, theme toggle, mobile menu, language switching, and SEO meta presence.

## Deployment

Netlify builds on every push to `main`:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

The Netlify image service handles on-the-fly image transformation for `@nuxt/image`.

## Internationalization

Four locales, each with its own address: Portuguese at the plain addresses (`/`, `/services`), and English, Spanish and French under `/en`, `/es` and `/fr`. The list lives in `data/locales.ts`; routing, the language selector, the language tags and the prerendered pages are built from it.

A visitor who opens the plain home address is taken to their language: a choice saved from the selector comes first, then the browser's language, then English when the site does not have it. An address that names a language is always shown in that language. The rules are written as tables at the top of `tests/e2e/i18n.spec.ts`.

Add a key to all four files in `i18n/locales/`, use as:

```vue
<template>
  <p>{{ $t('key.path') }}</p>
</template>
```

## Design

Design system in Figma: **[View Figma Design](https://www.figma.com/design/KcNyrpxsmfBF6B3CNdzfVF/Fellas-Barber?node-id=0-1&p=f&t=LBEbTQ2tji4qFw0p-0)**

### Brand colors

|            | Light     | Dark      |
| ---------- | --------- | --------- |
| Primary    | `#E83752` | `#E83752` |
| Background | `#F7F9FC` | `#0A0909` |
| Text       | `#000000` | `#FFFFFF` |

### Typography

- **Raleway** (400 / 600 / 700 / 800) — primary
- **Bebas Neue** (400) — display accents

Both shipped via `@fontsource/*` (no external font CDN).

## Browser Support

Chrome, Firefox, Safari and Edge — latest two stable versions of each.

## Performance Targets

| Metric                    | Target                       |
| ------------------------- | ---------------------------- |
| Lighthouse Performance    | ≥ 95 (mobile), 99+ (desktop) |
| Lighthouse Accessibility  | 100                          |
| Lighthouse Best Practices | 100                          |
| Lighthouse SEO            | 100                          |
| FCP                       | < 1.8s                       |
| LCP                       | < 2.6s                       |
| CLS                       | 0                            |

## Contributing

1. Branch off `main`: `git checkout -b mario/<type>/<short-name>` (`feat`, `fix`, `chore`, `perf`, `docs`, `test`, `refactor`)
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <subject>`
3. Prefer multiple focused commits over one big commit when changes touch unrelated concerns
4. Add a line under **Unreleased** in `CHANGELOG.md` when the change is worth telling
5. Push and open a PR. `main` only takes pull requests, and one merges once its checks pass: Netlify's preview, lint, the type-check and both test suites on five browser projects

Two git hooks run on every commit, installed by `npm install`:

- **pre-commit** runs ESLint and Prettier on the staged files only (`lint-staged`), so it takes a second or two.
- **commit-msg** checks the message against Conventional Commits and a 72-character subject (`commitlint.config.js`).

The type-check and the test suites are left to CI; they are too slow for a hook.

---

Built with care by Mario Lanes
