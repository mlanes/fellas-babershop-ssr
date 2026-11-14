import { expect, test } from '@playwright/test'

test.describe('SEO meta', () => {
  test('home page exposes description, og:title and og:image', async ({ page }) => {
    await page.goto('/')

    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveCount(1)
    const descriptionContent = await description.getAttribute('content')
    expect(descriptionContent).toBeTruthy()
    expect(descriptionContent!.length).toBeGreaterThan(20)

    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
  })

  test('favicon and apple-touch-icon are linked', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel="icon"]')).not.toHaveCount(0)
    await expect(page.locator('link[rel="apple-touch-icon"]')).not.toHaveCount(0)
  })

  test('robots.txt is served', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body.toLowerCase()).toContain('user-agent')
  })

  test('robots.txt points only at the sitemap on the production domain', async ({ request }) => {
    const response = await request.get('/robots.txt')
    const sitemapLines = (await response.text())
      .split('\n')
      .filter((line) => /^sitemap:/i.test(line))
    expect(sitemapLines).toEqual(['Sitemap: https://fellasbarber.com/sitemap.xml'])
  })

  // The dev server lists its own localhost URLs unless asked for the canonical ones.
  test('sitemap.xml lists the home page on the production domain', async ({ request }) => {
    const response = await request.get('/sitemap.xml?canonical')
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('<loc>https://fellasbarber.com/</loc>')
  })
})
