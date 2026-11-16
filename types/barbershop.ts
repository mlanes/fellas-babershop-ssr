/**
 * One of the barbershops: what the site shows about it, what search engines
 * are told about it, and where its links lead.
 */
export interface Barbershop {
  id: string
  /** The neighbourhood that tells the shops apart, e.g. `Alameda` */
  area: string
  /** Name shown to visitors, in the language being read, e.g. `Unidade Alameda` */
  name: string
  /** The address as visitors read it, on one line */
  address: string
  /** Street and number alone, for search engines */
  street: string
  postalCode: string
  city: string
  /** Phone number as visitors read it, e.g. `+351 215 860 238` */
  phone?: string
  /** Link that calls `phone` */
  phoneUrl?: string
  /** WhatsApp number as visitors read it */
  whatsapp?: string
  /** Link that opens a WhatsApp chat with `whatsapp` */
  whatsappUrl?: string
  instagram?: string
  facebook?: string
  scheduleWeekday: string
  scheduleWeekend: string
  scheduleSunday: string
  mapsUrl: string
  /** The shop's AppBarber booking page */
  bookingUrl: string
  images: string[]
}
