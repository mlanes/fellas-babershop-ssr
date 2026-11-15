import { locales } from '~/data/locales'

/**
 * Adds the business's structured data to the page head for search engines:
 * the organisation, the website and each barbershop location.
 */
export function useStructuredData() {
  const siteUrl = useSiteConfig().url
  const logoUrl = `${siteUrl}/og-image.jpg`

  const locations = [
    {
      id: 'alameda',
      name: 'Fellas Barbers - Alameda',
      street: 'Alameda Dom Afonso Henriques, 47A',
      postal: '1000-123',
      city: 'Lisboa',
      phone: '+351215860238',
      maps: 'https://maps.app.goo.gl/D83DuiVBsqQ4mith6',
    },
    {
      id: 'campo-grande',
      name: 'Fellas Barbers - Campo Grande',
      street: 'Campo Grande',
      postal: '1700',
      city: 'Lisboa',
      phone: '',
      maps: '',
    },
    {
      id: 'almada',
      name: 'Fellas Barbers - Almada',
      street: 'Almada',
      postal: '2800',
      city: 'Almada',
      phone: '',
      maps: '',
    },
  ]

  useHead({
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
            ...locations.map((loc) => ({
              '@type': 'BarberShop',
              '@id': `${siteUrl}/#location-${loc.id}`,
              name: loc.name,
              image: logoUrl,
              url: siteUrl,
              ...(loc.phone ? { telephone: loc.phone } : {}),
              address: {
                '@type': 'PostalAddress',
                streetAddress: loc.street,
                addressLocality: loc.city,
                postalCode: loc.postal,
                addressCountry: 'PT',
              },
              ...(loc.maps ? { hasMap: loc.maps } : {}),
              priceRange: '€€',
              parentOrganization: { '@id': `${siteUrl}/#organization` },
            })),
          ],
        }),
      },
    ],
  })
}
