import { locales } from '~/data/locales'

/**
 * Adds the business's structured data to the page head for search engines:
 * the organisation, the website and each barbershop, which are the same on
 * every page, and the page itself with its language and address. The shops'
 * details come from `useBarbershops`, the list the page itself shows.
 */
export function useStructuredData() {
  const siteUrl = useSiteConfig().url
  const logoUrl = `${siteUrl}/og-image.jpg`
  const { locale, localeProperties } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const pageUrl = computed(() => {
    const path = switchLocalePath(locale.value)
    return path === '/' ? siteUrl : `${siteUrl}${path}`
  })

  const { barbershops } = useBarbershops()

  useHead(() => ({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': `${siteUrl}/#organization`,
              name: 'Fellas Barbers',
              url: siteUrl,
              logo: logoUrl,
              sameAs: [
                'https://www.instagram.com/fellasbarber.pt',
                'https://www.facebook.com/FellasBarberAlameda',
              ],
            },
            {
              '@type': 'WebSite',
              '@id': `${siteUrl}/#website`,
              url: siteUrl,
              name: 'Fellas Barbers',
              inLanguage: locales.map(({ language }) => language),
              publisher: { '@id': `${siteUrl}/#organization` },
            },
            {
              '@type': 'WebPage',
              '@id': `${pageUrl.value}#webpage`,
              url: pageUrl.value,
              inLanguage: localeProperties.value.language,
              isPartOf: { '@id': `${siteUrl}/#website` },
            },
            ...barbershops.value.map((shop) => ({
              '@type': 'BarberShop',
              '@id': `${siteUrl}/#location-${shop.id}`,
              name: `Fellas Barbers - ${shop.area}`,
              image: logoUrl,
              url: siteUrl,
              ...(shop.phone ? { telephone: shop.phone.replace(/\s/g, '') } : {}),
              address: {
                '@type': 'PostalAddress',
                streetAddress: shop.street,
                addressLocality: shop.city,
                postalCode: shop.postalCode,
                addressCountry: 'PT',
              },
              hasMap: shop.mapsUrl,
              priceRange: '€€',
              parentOrganization: { '@id': `${siteUrl}/#organization` },
            })),
          ],
        }),
      },
    ],
  }))
}
