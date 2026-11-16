# Quality roadmap

Written 2026-11-15, on `main` at `4c05e7b` (`v1.1.1` plus two maintenance PRs). Analysis only: no package was installed, no configuration or code changed. The companion document, `.claude/notes/review-whole-project.md`, answers the four review questions (anti-corruption layers, doc comments, unit tests, Storybook against Ring UI) in detail; this one decides what to adopt and in which order.

Every claim is marked **[ran]** (a command was run and its output read), **[read]** (a file or page was read) or **[inferred]**.

## Summary

- **The single most valuable addition is a CI workflow.** Nothing runs on GitHub today: the only required check on `main` is Netlify's preview build, so a failing test cannot stop a merge.
- **Three items on the list are worth doing now** for a one-person site: CI, git hooks, and making the existing Storybook stories into accessibility tests. Two more are worth doing small: unit tests for five pieces of logic, and a smoke test against deploy previews.
- **Four are not worth it yet**: CRAP as a tool, dependency-cruiser, mutation testing, and any SonarQube edition. Each has a cheaper substitute that covers this codebase, named below, and a condition under which to revisit.
- **Three premises in the brief do not match the repository**, so nothing is recommended for them: there is no Google Business Profile integration and no OAuth (the reviews are static data in `data/testimonials.ts`), there is no server code (`server/` is empty and nothing is rendered at request time; every page is prerendered), and SEO meta per page is already tested **[ran]**.
- **The Figma file fails contrast in four places** and has drifted from the site. The site fixed the same problem for two of its buttons; its primary button is a gradient that no test measures.
- **Extracting the components into a shared package: not yet.** Prepare the boundary now, extract when the second app exists.

## Roadmap

| Item                                       | Recommendation                                                   | Catches what is missed today                                                                | Effort                         | Priority     |
| ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ | ------------ |
| CI on GitHub Actions                       | **Do**                                                           | A red gate can be merged; the gates only run on one laptop                                  | Half a day                     | 1            |
| Stories as accessibility tests             | **Do**                                                           | 32 stories are never checked; the site's components are tested only when composed in a page | Half a day                     | 2            |
| Husky, lint-staged, commitlint             | **Do**                                                           | Lint and commit-format slips are found after the push, by Netlify or by nobody              | 1 to 2 hours                   | 3            |
| Unit tests (Vitest), small                 | **Do, scoped**                                                   | Logic rules cost a build and a browser to check; one fallback path has no test at all       | 1 day                          | 4            |
| Smoke test on deploy previews              | **Do**                                                           | The preview was checked by hand four times this week with throwaway configs                 | 2 to 3 hours                   | 5            |
| Complexity lint rule                       | **Do**                                                           | Nothing limits function complexity                                                          | 15 minutes                     | 6            |
| `no-restricted-imports` for the layer rule | **Do**, in place of dependency-cruiser                           | Three components import data directly against the project's rule                            | 30 minutes                     | 7            |
| Lighthouse in CI                           | **Do, as a budget, not a gate at first**                         | Performance is measured by hand, last in May                                                | 2 hours                        | 8            |
| Figma: fix contrast, record the drift      | **Do before designing the next app**                             | Four failing colour pairs would be carried into the new system                              | 2 to 3 hours of design work    | 9            |
| Shared design-system package               | **Prepare, do not extract**                                      | n/a                                                                                         | 2 hours now; 2 to 3 days later | 10           |
| Coverage floor                             | **Later**, from a measured number                                | n/a until unit tests exist                                                                  | 30 minutes                     | Later        |
| Mutation testing (Stryker)                 | **Later, scheduled, three folders**                              | Tests that pass without checking anything                                                   | Half a day                     | Later        |
| CRAP as a separate tool                    | **No**                                                           | Nothing the complexity rule and a coverage floor do not                                     | n/a                            | No           |
| dependency-cruiser                         | **No**, for now                                                  | Nothing `no-restricted-imports` does not, at this size                                      | n/a                            | No           |
| SonarQube, any edition                     | **No**; SonarQube Cloud free as an optional one-month experiment | Mostly what ESLint, `vue-tsc` and Playwright already report                                 | n/a                            | No           |
| Visual regression                          | **Only with the shared package**                                 | Unintended visual change in a primitive                                                     | Depends on the tool            | With item 10 |

## Starting state

Commands run on Node 24.22.3, one worker **[ran]**:

```
$ npm run lint
✖ 20 problems (0 errors, 20 warnings)          exit 0
$ npm run typecheck                             exit 0
$ npx playwright test -c playwright.built.config.ts --workers=1
  550 passed (11.4m)
$ npx playwright test --workers=1
  465 passed (24.7m)
```

The repository **[ran]**: 22 components and 9 story files (6,441 lines together), 9 composables (456), 8 Playwright spec files (1,410), 32 stories, 4 MDX pages. No `.github/`, no `.husky/`, no unit-test runner. TypeScript `strict: true`; `noUncheckedIndexedAccess: false`.

## CI on GitHub Actions

**Recommendation: do it first.**

- **What it catches.** Today the ruleset on `main` requires one check, `netlify/fellasbaber/deploy-preview` **[ran]**. That proves the site builds. It does not run lint, the type-check or a single test. In the last two days three defects were caught only because the suites were run by hand before merging: the service worker serving the Portuguese home page at `/fr/`, the redirect frozen into `/`, and the Portuguese flash on 3G.
- **Shape.** One workflow on `pull_request`: `npm ci`, `npm run lint`, `npm run typecheck`, then the built-site suite and the dev suite. Locally the two suites take about 11 and 18 minutes on one worker **[ran]**; on a hosted runner, split the five browser projects across jobs. A reasonable first cut is chromium, webkit and Mobile Safari on every pull request and all five nightly, since every defect this week showed on at least one of those three.
- **Fit.** The repository is public **[ran]**, and GitHub does not charge Actions minutes for public repositories; confirm on your account before relying on it. Add the workflow's jobs to the ruleset's required checks once they have been green for a week.
- **Depends on something I cannot see:** whether you want the repository to stay public.

## CRAP scores

**Recommendation: no separate tool. Use the complexity rule now and a coverage floor later; together they bound CRAP.**

The metric is `CRAP(m) = comp(m)^2 * (1 – cov(m)/100)^3 + comp(m)`, where `comp` is cyclomatic complexity and `cov` is test coverage; its authors suggested "INITIALLY use a CRAP score of 30 as the threshold" ([Savoia and Evans, 2007](https://www.artima.com/weblogs/viewpost.jsp?thread=215899)).

Two consequences of the formula for this codebase:

- A function with complexity 5 or less scores at most 30 with no coverage at all, so it can never cross the threshold.
- Only six functions here are above 5 **[ran]**:

```
$ npx eslint components composables pages stores utils data app.vue --rule '{"complexity":["warn",5]}'
components/layout/AppHeader.vue:56              complexity 10
components/sections/GalleryScrollSection.vue:109  complexity 9
utils/moveToVisitorLanguage.ts:25               complexity 8
components/ui/FLanguageSelector.vue:56          complexity 6
composables/useTheme.ts:22                      complexity 6
composables/useTranslatedServices.ts:13         complexity 6
```

At complexity 10, a function drops under 30 once its coverage passes about 42%. So "complexity capped at 10" plus "coverage of at least 50% on the files that hold logic" guarantees no function can be CRAP, without computing it.

- **What a CRAP report would add:** a single ranked number per function. With six candidates, the list above is the report.
- **Fit.** ESLint's `complexity` rule "measures the number of linearly independent paths"; its default threshold is 20 ([ESLint](https://eslint.org/docs/latest/rules/complexity)). Set it to 10: everything passes today.
- **Revisit** when the future app with a backend exists. Business logic there will have real branching, and your own method already uses CRAP for that kind of code.
- I did not find a maintained CRAP tool for TypeScript on the pages I read, and did not search further once the arithmetic above made the question moot.

## dependency-cruiser

**Recommendation: not now. One ESLint rule covers the rule that exists.**

- **What the brief asks for.** Rules for the folder structure, and keeping server-only code out of client bundles.
- **Server-only code:** there is none. `server/` is an empty folder, there are no API routes, and every page is prerendered **[ran]**. Nuxt already separates server from client by convention (`server/`, `.server.` and `.client.` suffixes). The one file that runs in both worlds on purpose, `utils/moveToVisitorLanguage.ts`, is imported by `nuxt.config.ts` at build time and written into the page as text.
- **Folder rules that would make sense:**

| Rule                                                  | State today                                                                                        |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `components/**` must not import `~/data/**`           | Broken in three files: `TestimonialsSection.vue:7`, `AppHeader.vue:8`, `AppFooter.vue:5` **[ran]** |
| `components/ui/**` must not import `~/composables/**` | Broken once: `FLanguageSelector.vue:4`                                                             |
| `data/**` and `utils/**` import nothing from the app  | Holds                                                                                              |
| No circular imports, no orphans                       | Not measured; two orphans were found by reading and removed in PR #21                              |

- **Why not the tool.** It forbids dependencies by `from.path` and `to.path` and detects `circular`, `orphan` and `couldNotResolve` ([rules reference](https://raw.githubusercontent.com/sverweij/dependency-cruiser/main/doc/rules-reference.md)), which is what the table needs. But the first two rows are exactly what ESLint's built-in `no-restricted-imports` does, per folder, with no new dependency. And Nuxt's auto-imports are invisible to any import-graph tool: `useI18n`, `computed` and friends appear in no import statement. Whether dependency-cruiser parses `.vue` files in this setup I could not confirm from the pages I read.
- **Revisit** if the shared package is extracted: "the package imports nothing from the app" is then a rule worth a graph tool, and orphans start to matter.

## Husky with lint-staged and commitlint

**Recommendation: do it. Small, fast, and it protects your own commits, which nothing does today.**

- **What exists.** The Stop hook in `.claude/hooks/` lints changed files and type-checks, but only at the end of a Claude session. A commit made by hand passes through nothing.
- **Setup that stays fast:**
  - `pre-commit`: lint-staged running `eslint --fix` and `prettier --write` on staged `.ts` and `.vue` files. The whole repository lints in about 4 seconds now **[ran]**, so staged files are instant.
  - `commit-msg`: commitlint with `@commitlint/config-conventional`. Your commit rule is already Conventional Commits; this makes it mechanical. commitlint's guide uses the `commit-msg` hook ([local setup](https://commitlint.js.org/guides/local-setup.html)).
  - Nothing heavier in hooks. The type-check takes tens of seconds and the suites take minutes; they belong in CI.
- **Install:** `npm install --save-dev husky` then `npx husky init`, which "creates a pre-commit script in `.husky/` and updates the prepare script" ([Husky](https://typicode.github.io/husky/get-started.html)). lint-staged "runs formatters and linters on staged files" and needs the hook set up separately ([lint-staged](https://github.com/lint-staged/lint-staged)). Four dev dependencies in total.
- **One thing to decide:** `package.json` already has a `postinstall` (`nuxt prepare`). Husky adds a `prepare` script; both can coexist, but Netlify's install will run it too, so the hook install must be a no-op there.

## Smoke tests against deploy previews

**Recommendation: do it. It already exists in pieces.**

- **What it catches.** Things only Netlify shows: redirects, trailing slashes, the image service, the service worker on a real network. This week the preview revealed that `/en` redirects to `/en/`, which no local test could.
- **What exists.** `tests/e2e/i18n.spec.ts` and `tests/e2e-built/returning-visitor.spec.ts` were run against previews four times with throwaway configs, passing 180, 190, 84 and 20 tests **[ran]**. `prerendered.spec.ts` cannot run there as written: it refuses redirects and uses addresses without a trailing slash.
- **Shape.** A third Playwright config that takes the address from `BASE_URL`, with no web server, running:
  - every one of the 20 pages answers 200 in its language (after following the slash redirect);
  - no `console.error` and no "Hydration completed but contains mismatches" on any of them;
  - the home page shows a testimonial and three barbershops with booking links;
  - the language-routing spec, on chromium and Mobile Safari.
- **Trigger.** A GitHub Actions job on `deployment_status`, which fires when Netlify reports the preview ready and carries its address.
- **The "reviews section" in the brief** is `TestimonialsSection.vue` reading static data. There is no API to smoke-test. If Google reviews are ever pulled in, that is a build-time fetch with a fixture, not something to call from a test.
- **Timeouts.** The service-worker tests need about 35 seconds each on a real network, because the worker downloads 194 files before it takes control **[ran]**.

## Mutation testing

**Recommendation: later, on a schedule, on three folders. Not on every push.**

- **Why later.** Mutation testing asks whether the tests would notice a changed line. The only tests today are browser tests; a mutation run against a 30-minute suite, once per mutant, is not feasible. It becomes useful the day the unit tests in the next section exist.
- **Scope when it starts:** `utils/`, `data/locales.ts`, `composables/useTranslatedServices.ts`, and any helpers extracted from components. About 150 lines. Never the `.vue` templates.
- **Tool.** StrykerJS with the Vitest runner. It "can mutate both your js/ts files as the script tags in your `*.vue` files"; browser mode is not supported ([Vue guide](https://stryker-mutator.io/docs/stryker-js/guides/vuejs/), [Vitest runner](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)).
- **Schedule.** Weekly, or on demand before a release. Incremental mode stores results in `reports/stryker-incremental.json` and reuses them, with a stated limit: "changes outside mutated and test files are not detected" ([incremental mode](https://stryker-mutator.io/docs/stryker-js/incremental/)), so a full run from time to time.
- **Fit with your method.** Your `hardener` agent exists for exactly this job. The threshold is yours to set once there is a first number; do not pick one in advance.

## Unit tests

**Recommendation: do it, scoped to logic.** The detail, with the list of what to test and what to leave in Playwright, is question 3 of the review. In short: Vitest; a `test/unit/` folder in a plain Node environment for four of the six targets; the Nuxt environment only where a composable needs it ([Nuxt testing guide](https://nuxt.com/docs/3.x/getting-started/testing)). The first target is `utils/moveToVisitorLanguage.ts`: nine rules that today cost a browser each.

## Vue and SSR standards

**Recommendation: three small fixes; otherwise the code already follows the guide.**

**Priority A, Essential** ([style guide](https://vuejs.org/style-guide/rules-essential.html)) **[ran]**

| Rule                           | State                                                                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use multi-word component names | Followed. The lint rule is switched off (`eslint.config.js`, `vue/multi-word-component-names: 'off'`), though only page files would trip it. It can be turned back on with pages excluded |
| Use detailed prop definitions  | Followed through TypeScript types. Three `vue/require-default-prop` warnings: optional props with no default                                                                              |
| Use keyed `v-for`              | Followed: 15 of 15                                                                                                                                                                        |
| Avoid `v-if` with `v-for`      | Followed: none found                                                                                                                                                                      |
| Use component-scoped styling   | Followed: every component with styles uses `<style scoped>`                                                                                                                               |

**Priority B, Strongly Recommended** ([style guide](https://vuejs.org/style-guide/rules-strongly-recommended.html)): 14 `vue/attributes-order` warnings, all auto-fixable with `eslint --fix` **[ran]**. Component and file naming, self-closing and casing are consistent. "Simple expressions in templates" is broken in `GalleryScrollSection.vue:234-299`, where six inline handlers cast the event target (`(e.target as HTMLVideoElement).play()`).

**Composition API and `<script setup>`:** every component uses `<script setup lang="ts">` **[ran]**. Reusable logic is in composables. One store, used for two pieces of UI state.

**TypeScript strictness** **[ran]**

- `strict: true`. `noUncheckedIndexedAccess` is off; turning it on would flag the array indexing in the carousels and is worth one afternoon.
- Eleven `as` casts, against your own rule: six in `GalleryScrollSection.vue` (above), `FModal.vue:58`, `FIcon.vue:27` and `:49`, `useTheme.ts:75`, and one non-null assertion in `BarbershopsSection.vue:28`. Each has a type-guard replacement; two were removed from `FLanguageSelector.vue` this week the same way.
- `@typescript-eslint/no-explicit-any` is an error and there are no violations.

**SSR safety**

- **Browser-only APIs.** Nine files touch `window`, `document`, `localStorage` or `navigator` **[ran]**. All are inside `onMounted`, an event handler or an `import.meta.client` guard; the proof is that all 20 pages prerender, which would crash otherwise.
- **State leaking between requests.** Not possible in production: nothing is rendered per request. During prerender, module-level values are constants (`useBarbershops.ts` image paths) and the store is created per render by Pinia.
- **Hydration mismatches.** One real one waiting to happen: `AppFooter.vue:16`, `const currentYear = ref(new Date().getFullYear())`. The year is frozen into the HTML at build time; in January, until the next deploy, the browser computes a different year than the page was built with. Either render it in the browser only or accept a yearly rebuild.
- **Nothing checks for hydration errors.** No spec listens for Vue's mismatch message. The smoke test above should.

## Storybook: interaction and visual tests

**Recommendation: accessibility tests now, interaction tests for three components, visual regression only with the shared package.** The comparison with Ring UI and the steps are question 4 of the review.

- **Accessibility, now.** Storybook's docs list render, interaction, accessibility, visual and snapshot tests, run by the Vitest addon, `@storybook/addon-vitest`; `parameters.a11y.test: 'error'` "fails the UI and CLI/CI run" ([writing tests](https://storybook.js.org/docs/writing-tests), [accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing)). Ring UI does exactly this, in both themes ([preview.ts](https://raw.githubusercontent.com/JetBrains/ring-ui/master/.storybook/preview.ts)). For us: 32 stories, two themes, 64 checks.
- **Interaction tests** where a component has behaviour a page test does not reach: `FModal` (focus trap, Escape, focus returning to the opener), `FLanguageSelector` (arrow keys, Home, End), `BeforeAfterSlider` (keyboard). No spec tests keyboard use today.
- **Visual regression.** Chromatic's free plan is "5,000 billed snapshots", "Test on Chrome"; the first paid plan is "$179/ month" for "35,000 billed snapshots" ([Chromatic pricing](https://www.chromatic.com/pricing)). 32 stories in two themes is 64 snapshots a run, so the free plan would cover about 78 runs a month. It earns its place when the primitives are consumed by a second app and a visual change can break something you are not looking at. For one site whose pages are already tested, it mostly reports changes you made on purpose.

## SonarQube

**Recommendation: no edition. If you are curious, SonarQube Cloud's free plan for one month, then decide from what it found.**

Read on the vendor's pages on 2026-11-15:

| Offering                                 | Price                                                                                                                                            | Limits                                                                                                                   | Source                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| SonarQube Cloud, Free                    | "free for your private projects up to 50k LOC. No card, no expiry."                                                                              | 50k lines of code                                                                                                        | [plans and pricing](https://www.sonarsource.com/plans-and-pricing/)                              |
| SonarQube Cloud, for public repositories | "Public, OSI-licensed repos get SonarQube for OSS..." listed as "Free forever"                                                                   | Needs an OSI licence. **This repository has none** and `package.json` says `"private": true` **[ran]**                   | same page                                                                                        |
| SonarQube Cloud, Team                    | "Starts at $34 monthly" for up to 100k LOC                                                                                                       |                                                                                                                          | same page                                                                                        |
| SonarQube Server Developer Edition       | **No price shown.** "Get in touch with sales for pricing specific to your needs", priced "per instance per year and based on your lines of code" | You host and maintain the server                                                                                         | [Developer Edition](https://www.sonarsource.com/plans-and-pricing/developer/)                    |
| SonarQube Community Build                | Free, self-managed                                                                                                                               | The page lists what paid editions add: "more powerful secrets detection and SAST with taint analysis" and more languages | [Community Build](https://www.sonarsource.com/open-source-editions/sonarqube-community-edition/) |

JavaScript, TypeScript, CSS and HTML are listed for all of them; **Vue is not named on any of the four pages**, so whether `.vue` files are fully analysed I could not confirm there.

- **Is Developer Edition worth paying for here? No.** It is priced by lines of code for teams who need branch and pull-request analysis on private code across many projects, and it adds a server to run. This repository is about 8,000 lines with one author. Its distinguishing features (taint analysis, extra languages such as C++ and Swift) have nothing to act on in a static site with no input handling and no backend.
- **What any Sonar edition would add over what exists:** duplication detection, cognitive complexity, a pull-request quality gate and a dashboard. What it would repeat: most of ESLint and `vue-tsc`. The duplication that matters was found by reading (the barbershops' details written twice).
- **Which plugins or rule sets:** none recommended. If the free Cloud plan is tried, use its default "Sonar way" profile untouched for a month and judge by how many findings you act on.
- **Revisit** for the future app with a backend: input handling, authentication and a database are where taint analysis and security hotspots earn their keep.
- **Depends on something I cannot see:** your budget, and whether the repository gets a licence.

## Anything else

- **Lighthouse in CI.** `npm run lighthouse` runs against production by hand; the reports in `.lighthouse/` date from May **[ran]**. `lhci autorun` "runs collection and assertions with inferred defaults" and supports budgets such as `minScore` ([Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)). Run it against the deploy preview in the same job as the smoke test, reporting only at first; turn scores into a gate once you have a month of numbers. I would not use Netlify's Lighthouse plugin: its README says contributions are not being accepted, and its threshold mode "does not work for SSR or ISR sites" ([plugin](https://github.com/netlify/netlify-plugin-lighthouse)).
- **Accessibility in CI.** Already there in substance: axe scans of every page in both themes, measured contrast for hover and selected states. It only needs to run in CI.
- **SEO meta per page.** Done this week and tested: one title and description per language, canonical and sister-page tags in the static HTML, a sitemap with sister links, structured data per page, `noindex` on the coming-soon pages in four languages **[ran]**.
- **Dependency updates.** `npm audit` reports 32 known issues today: 2 high, 28 moderate, 2 low, none critical **[ran]**. Dependabot or Renovate with one grouped pull request a week would keep that from growing; with CI in place such a pull request tests itself.
- **A licence and a `SECURITY.md`**, if the repository stays public.
- **Two accessibility defects found on the way, neither covered by a tool:** the testimonials rotate with no way to pause them, which WCAG 2.2.2 asks for when content auto-updates ([Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)), and 15 labels are hardcoded in one language (listed in the review).

## The Figma file: contrast and accessibility

File: "Fellas-Barber", pages Cover, StyleGuide, UI, Logo, Page 5. Read through the Figma connector, which can read the file but, as found earlier, not write to it on the current plan. The frame in the link (`22:1777`) is a background; the review below uses the StyleGuide page and the `home` frame.

**Contrast of the palette, computed from the file's own variables** **[ran]**. WCAG AA needs 4.5:1 for normal text and 3:1 for large text and interface parts.

| Text                  | On `black` #121111 | On `black-light` #1C1B1B | On `dark-700` #202227 |
| --------------------- | ------------------ | ------------------------ | --------------------- |
| `white` #F7F9FC       | 17.87              | 16.29                    | 15.09                 |
| `gray-7` #A3A3A3      | 7.47               | 6.81                     | 6.31                  |
| `gray-6` #8C8C8C      | 5.61               | 5.11                     | 4.73                  |
| `gray-5` #747474      | **4.03**           | **3.68**                 | **3.40**              |
| `red-default` #E83752 | 4.58               | **4.17**                 | **3.86**              |
| `red-dark` #D4203B    | **3.65**           | **3.33**                 | **3.08**              |
| `red-light` #FA5770   | 5.98               | 5.45                     | 5.05                  |

| Button                                                        | Ratio    | Verdict                                                   |
| ------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| `white` #F7F9FC on `red-default` #E83752 (the primary button) | **3.90** | Fails for the small uppercase label the style guide shows |
| `white` on `red-dark` #D4203B                                 | 4.89     | Passes                                                    |
| `white` on `red-light` #FA5770 (the hover glow state)         | **2.99** | Fails even as large text                                  |

**Findings**

1. **The primary button fails**: white on the brand red is 3.90:1. On the site, the coming-soon button and the hovered outline button use the darker red, measured live at 4.96:1. The site's own primary button (`FButton.vue:75-84`) is white on a gradient, which axe cannot judge and no spec measures: a gap worth one contrast test at the gradient's lightest stop.
2. **Brand red as text only passes on the darkest background**, and only just (4.58:1). On cards and panels (`black-light`, `dark-700`) it fails for body-size text. The style guide draws every heading sample and the testimonial names in red. Use `red-light` #FA5770 for small red text on dark surfaces, or keep red for large headings only.
3. **`red-dark` must never be text on dark**: 3.08 to 3.65.
4. **`gray-5` fails as text everywhere**; `gray-6` is the lightest grey that passes on all three backgrounds. The hero description and the testimonial dates in the `home` frame look like `gray-5` or darker; I could not read their exact fills.
5. **The design is dark only.** The site has a light theme the file knows nothing about, with its own, already-fixed contrast problems (red on white).
6. **Not checkable from a static file:** focus states (none are drawn), keyboard order, touch target sizes for the 48px carousel arrows, and motion.

**Drift between the file and the site** **[read]**

| In Figma                                                                                                                                                         | On the site                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Dark theme only                                                                                                                                                  | Light and dark                                                  |
| Desktop frame at 2560 px; no tablet or phone frames for the page                                                                                                 | Responsive, tested at phone sizes                               |
| Menu: Home, Sobre, Serviços, Galeria, Contacto                                                                                                                   | Home, Sobre, Serviços, Galeria, Barbearias                      |
| Two locations in the footer                                                                                                                                      | Three                                                           |
| No barbershops section, no gallery section; placeholder text ("Lorem ipsum", "Finalizar CTA")                                                                    | Both sections built, real content                               |
| Forms, alerts, inputs, selects in the style guide                                                                                                                | None on the site: it has no forms by design                     |
| Variables duplicated under two spellings with different values: `gray / gray-5` #717274 and `gray/gray-5` #747474; `brand / red-default` and `brand/red-default` | One token per colour, in `assets/styles/_primitive-colors.scss` |
| One text style in "M PLUS 1"                                                                                                                                     | Raleway and Bebas Neue only                                     |

**Keeping them in step.** The connector cannot write, so there is no automatic sync to propose. The practical rule: **the code is the source of truth for tokens**, and the Storybook Foundations pages are where they are shown. Before designing the next app in this file: fix the four contrast pairs, merge the duplicated variables, add a light mode to the variable collection, and add the tokens the code has that the file lacks. That is a few hours of design work, done once, and it gives the new app's designs a palette that already passes.

## A shared design-system package

**Recommendation: do not extract yet. Prepare the boundary now, extract when the second app starts.**

What would move: the nine documented primitives (`FButton`, `FIcon`, `FModal`, `FEyebrow`, `FSectionHeading`, `FLogo`, `FLogoFooter`, `FLanguageSelector`, `BeforeAfterSlider`), the tokens and mixins in `assets/styles/` (1,063 lines of SCSS), the icon set, and the Storybook.

What ties them to this site today **[ran]**:

| Coupling                                             | Where                                                                     | To extract                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| The `~/` alias in every import                       | all of `components/ui`                                                    | Relative imports inside the package                                                   |
| `<NuxtImg>`                                          | `BeforeAfterSlider.vue:130,151`, `MediaPreviewDialog.vue:43`              | A plain `<img>` or an image slot; the future app may not be Nuxt                      |
| SVG files imported as components through `nuxt-svgo` | `FLogo.vue`, `FLogoFooter.vue`, `AppLoader.vue`                           | Inline the SVG or ship it with a Vite plugin                                          |
| A composable of this site                            | `FLanguageSelector.vue:4` uses `useLocale`                                | Take the languages and the current one as props, emit the pick                        |
| Hardcoded labels                                     | `FModal.vue:96`, `BeforeAfterSlider.vue:177`, `MediaPreviewDialog.vue:32` | Props                                                                                 |
| Tokens reached by `@use '~/assets/styles/...'`       | ten of eleven files                                                       | The package ships the tokens as a CSS file of custom properties, plus the SCSS mixins |

| Option                                                                                                  | Costs                                                                                                                   | Buys                                                                                                |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **1. Stay in this repository; remove the couplings above**                                              | About 2 hours, and it is good hygiene anyway (the primitives are meant to hold no business logic)                       | Extraction becomes a move, not a rewrite. Nothing to version or publish                             |
| **2. A workspace package in one repository** (`packages/ui`, npm workspaces) when the second app starts | 2 to 3 days: build setup with Vite library mode, types, the Storybook moves with it                                     | Both apps consume it without publishing; one pull request can change a component and both consumers |
| **3. A separate repository and a published package**                                                    | Everything in 2, plus versioning, a registry, release notes, and a change needing two pull requests in two repositories | Independence between projects; worth it with other contributors or a third consumer                 |

I would pick 1 now and 2 when the second app is real. The usual advice is to extract on the second or third use, because the first consumer alone cannot tell you which props the next one needs; a design system built for one site tends to encode that site. The future app has forms, alerts and tables that this site has never needed, so most of its components do not exist yet in any case.

This is where three "not now" items above come back in: visual regression, dependency-cruiser ("the package imports nothing from an app") and a published Storybook all become worth their cost once a second consumer exists.

**Depends on something I cannot see:** whether the future app is Nuxt or plain Vue, whether anyone else will work on it, and when it starts.

## Suggested order, in small pull requests

| #     | Pull request                                                                                                                                       | Needs your yes for                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1     | CI workflow: lint, type-check, both suites on three browser projects                                                                               | Keeping the repository public        |
| 2     | Add the CI jobs to the `main` ruleset's required checks, after a week of green                                                                     | The ruleset change                   |
| 3     | Husky, lint-staged, commitlint                                                                                                                     | Four dev dependencies                |
| 4     | `complexity` at 10; `no-restricted-imports` for the layer rule; fix the three components that break it; `eslint --fix` for the 16 fixable warnings | Nothing new                          |
| 5     | One source for the barbershops' details; one function for the WhatsApp link                                                                        | Nothing new                          |
| 6     | Translate the 15 hardcoded labels; labels of the primitives become props                                                                           | Wording in four languages            |
| 7     | Storybook: autodocs set once, prop docs, missing stories                                                                                           | Nothing new                          |
| 8     | Storybook stories as accessibility tests in both themes, in CI                                                                                     | One dev dependency                   |
| 9     | Vitest and the first unit tests (`moveToVisitorLanguage`, `localizedPath`, locale-file keys)                                                       | Three or four dev dependencies       |
| 10    | Smoke-test config for deploy previews, triggered when Netlify reports a preview; Lighthouse reported in the same job                               | One dev dependency for Lighthouse CI |
| 11    | Remove the eleven casts; the footer year; a pause control for the testimonials                                                                     | Nothing new                          |
| 12    | Decouple the primitives from Nuxt and from this site (option 1 above)                                                                              | Nothing new                          |
| Later | Coverage floor from a measured number; Stryker on three folders, weekly; publish the Storybook                                                     | Each when its precondition exists    |

## What I could not see

- Your budget, your Netlify plan and its build minutes, and whether anyone else will work on this.
- Whether the repository is meant to stay public, and under what licence.
- Whether `.vue` files are fully analysed by SonarQube or parsed by dependency-cruiser in this setup.
- Ring UI's Storybook as a person sees it (the published page is a script shell), and the name of its screenshot tool.
- Exact fills of individual text layers in Figma; the contrast table uses the file's variables.
- `.env` was not read. Nothing was deployed, no Netlify or DNS setting was changed, and no Google API was called.
