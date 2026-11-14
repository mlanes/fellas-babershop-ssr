import { type Page } from '@playwright/test'

export async function gotoAndReady(page: Page, path: string) {
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.textContent = '.app-loader { display: none !important; }'
    document.documentElement.appendChild(style)
  })
  await page.goto(path, { waitUntil: 'domcontentloaded' })
}
