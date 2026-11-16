import { expect, test } from '@playwright/test'
import { gotoAndReady, pageHydrated } from './helpers'

/**
 * What a screen reader says for the controls and pictures of the home page.
 * These were once written into the components in English or Portuguese, so
 * three of the four sites read some of them in the wrong language.
 */
const spokenLabels = [
  {
    path: '/',
    home: 'Fellas Barbers, página inicial',
    backToTop: 'Voltar ao topo',
    testimonials: ['Testemunho anterior', 'Testemunho seguinte'],
    shopImages: ['Imagem anterior', 'Imagem seguinte'],
    shopPhotos: 'Fotografias de Unidade Alameda',
    shopPhoto: 'Unidade Alameda, interior, fotografia 1',
    viewShopPhoto: 'Ver fotografia 1 de 3 de Unidade Alameda',
    call: 'Ligar para +351 215 860 238',
    whatsapp: 'Conversar no WhatsApp: +351 912 286 442',
    instagram: 'Instagram de Unidade Alameda',
    facebook: 'Facebook de Unidade Alameda',
    comparison: 'Comparação de imagens: Antes e Depois',
    comparisonHandle: 'Controlo de comparação de imagens',
    servicePhotos: [
      'Corte de cabelo com degradé e risco desenhado, visto de lado',
      'Barbeiro a contornar a barba de um cliente',
      'Máquina a aparar a linha da barba no pescoço de um cliente',
      'Cliente com corte texturizado, sentado na cadeira do barbeiro',
      'Corte curto à máquina com degradé, visto de lado',
      'Corte à tesoura com pente',
    ],
    galleryImage: /^Imagem da galeria \d+$/,
    mediaPreview: 'Pré-visualização de multimédia',
    close: 'Fechar',
  },
  {
    path: '/en',
    home: 'Fellas Barbers, home page',
    backToTop: 'Back to top',
    testimonials: ['Previous testimonial', 'Next testimonial'],
    shopImages: ['Previous image', 'Next image'],
    shopPhotos: 'Photos of Unit Alameda',
    shopPhoto: 'Unit Alameda, interior, photo 1',
    viewShopPhoto: 'View photo 1 of 3 of Unit Alameda',
    call: 'Call +351 215 860 238',
    whatsapp: 'Chat on WhatsApp: +351 912 286 442',
    instagram: 'Unit Alameda on Instagram',
    facebook: 'Unit Alameda on Facebook',
    comparison: 'Image comparison: Before and After',
    comparisonHandle: 'Image comparison control',
    servicePhotos: [
      'Haircut with a fade and a shaved line, seen from the side',
      "A barber shaping a client's beard",
      "A trimmer tidying the beard line on a client's neck",
      "A client with a textured cut, seated in the barber's chair",
      'A short clipper cut with a fade, seen from the side',
      'A scissor-over-comb haircut in progress',
    ],
    galleryImage: /^Gallery image \d+$/,
    mediaPreview: 'Media preview',
    close: 'Close',
  },
  {
    path: '/es',
    home: 'Fellas Barbers, página de inicio',
    backToTop: 'Volver arriba',
    testimonials: ['Testimonio anterior', 'Testimonio siguiente'],
    shopImages: ['Imagen anterior', 'Imagen siguiente'],
    shopPhotos: 'Fotos de Unidad Alameda',
    shopPhoto: 'Unidad Alameda, interior, foto 1',
    viewShopPhoto: 'Ver foto 1 de 3 de Unidad Alameda',
    call: 'Llamar al +351 215 860 238',
    whatsapp: 'Chatear por WhatsApp: +351 912 286 442',
    instagram: 'Instagram de Unidad Alameda',
    facebook: 'Facebook de Unidad Alameda',
    comparison: 'Comparación de imágenes: Antes y Después',
    comparisonHandle: 'Control de comparación de imágenes',
    servicePhotos: [
      'Corte de pelo con degradado y una línea rasurada, visto de lado',
      'Un barbero perfilando la barba de un cliente',
      'Una máquina recortando la línea de la barba en el cuello de un cliente',
      'Un cliente con corte texturizado, sentado en el sillón del barbero',
      'Corte corto a máquina con degradado, visto de lado',
      'Corte a tijera con peine',
    ],
    galleryImage: /^Imagen de la galería \d+$/,
    mediaPreview: 'Vista previa multimedia',
    close: 'Cerrar',
  },
  {
    path: '/fr',
    home: "Fellas Barbers, page d'accueil",
    backToTop: 'Retour en haut',
    testimonials: ['Témoignage précédent', 'Témoignage suivant'],
    shopImages: ['Image précédente', 'Image suivante'],
    shopPhotos: 'Photos de Établissement Alameda',
    shopPhoto: 'Établissement Alameda, intérieur, photo 1',
    viewShopPhoto: 'Voir la photo 1 sur 3 de Établissement Alameda',
    call: 'Appeler le +351 215 860 238',
    whatsapp: 'Discuter sur WhatsApp : +351 912 286 442',
    instagram: 'Instagram de Établissement Alameda',
    facebook: 'Facebook de Établissement Alameda',
    comparison: "Comparaison d'images : Avant et Après",
    comparisonHandle: "Curseur de comparaison d'images",
    servicePhotos: [
      'Coupe avec dégradé et trait rasé, vue de côté',
      "Un barbier dessinant les contours de la barbe d'un client",
      "Une tondeuse nettoyant la ligne de barbe sur le cou d'un client",
      'Un client avec une coupe texturée, assis dans le fauteuil du barbier',
      'Coupe courte à la tondeuse avec dégradé, vue de côté',
      'Coupe aux ciseaux sur peigne',
    ],
    galleryImage: /^Image de la galerie \d+$/,
    mediaPreview: 'Aperçu du média',
    close: 'Fermer',
  },
]

test.describe('Controls and pictures are labelled in the language of the page', () => {
  for (const labels of spokenLabels) {
    test(`${labels.path}: the header, footer, testimonials and comparison`, async ({ page }) => {
      await gotoAndReady(page, labels.path)

      await expect(page.locator('.header__logo')).toHaveAttribute('aria-label', labels.home)
      await expect(page.locator('.footer__go-to-top')).toHaveAttribute(
        'aria-label',
        labels.backToTop
      )
      const testimonialArrows = page.locator('.testimonials__nav-button')
      await expect(testimonialArrows.nth(0)).toHaveAttribute('aria-label', labels.testimonials[0])
      await expect(testimonialArrows.nth(1)).toHaveAttribute('aria-label', labels.testimonials[1])
      await expect(page.locator('.before-after-slider').first()).toHaveAttribute(
        'aria-label',
        labels.comparison
      )
      await expect(page.locator('.before-after-slider [role="slider"]').first()).toHaveAttribute(
        'aria-label',
        labels.comparisonHandle
      )
    })

    test(`${labels.path}: the first barbershop's card`, async ({ page }) => {
      await gotoAndReady(page, labels.path)
      const card = page.locator('.barbershop-card').first()

      await expect(card.locator('.barbershop-card__nav--prev')).toHaveAttribute(
        'aria-label',
        labels.shopImages[0]
      )
      await expect(card.locator('.barbershop-card__nav--next')).toHaveAttribute(
        'aria-label',
        labels.shopImages[1]
      )
      await expect(card.locator('.barbershop-card__dots')).toHaveAttribute(
        'aria-label',
        labels.shopPhotos
      )
      await expect(card.locator('.barbershop-card__dot').first()).toHaveAttribute(
        'aria-label',
        labels.viewShopPhoto
      )
      await expect(card.locator('.barbershop-card__image').first()).toHaveAttribute(
        'alt',
        labels.shopPhoto
      )
      await expect(card.locator('a[href^="tel:"]')).toHaveAttribute('aria-label', labels.call)
      await expect(card.locator('a[href^="https://wa.me/"]')).toHaveAttribute(
        'aria-label',
        labels.whatsapp
      )
      await expect(card.locator('a[href*="instagram.com"]')).toHaveAttribute(
        'aria-label',
        labels.instagram
      )
      await expect(card.locator('a[href*="facebook.com"]')).toHaveAttribute(
        'aria-label',
        labels.facebook
      )
    })

    test(`${labels.path}: the service photos and the gallery`, async ({ page }) => {
      await gotoAndReady(page, labels.path)

      const servicePhotos = await page
        .locator('#services img')
        .evaluateAll((images) => images.map((image) => image.getAttribute('alt')))
      expect(servicePhotos).toEqual(labels.servicePhotos)

      await expect(page.locator('.gallery-scroll__item img').first()).toHaveAttribute(
        'alt',
        labels.galleryImage
      )

      await pageHydrated(page)
      await page.locator('.gallery-scroll__item').first().dispatchEvent('click')
      await expect(page.locator('[role="dialog"]')).toHaveAttribute(
        'aria-label',
        labels.mediaPreview
      )
      await expect(page.locator('.f-modal__close')).toHaveAttribute('aria-label', labels.close)
    })
  }
})
