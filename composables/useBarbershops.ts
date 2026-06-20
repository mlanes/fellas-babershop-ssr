import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Barbershop } from '~/types/barbershop'

const alameda1 = '/images/barbershops/alameda/fellas-barbers-alameda-interior-1.png'
const alameda2 = '/images/barbershops/alameda/fellas-barbers-alameda-interior-2.png'
const alameda3 = '/images/barbershops/alameda/fellas-barbers-alameda-interior-3.png'
const campoGrande1 = '/images/barbershops/campo-grande/fellas-barbers-campo-grande-interior-1.png'
const campoGrande2 = '/images/barbershops/campo-grande/fellas-barbers-campo-grande-interior-2.png'
const campoGrande3 = '/images/barbershops/campo-grande/fellas-barbers-campo-grande-interior-3.png'
const campoGrande4 = '/images/barbershops/campo-grande/fellas-barbers-campo-grande-interior-4.png'
const almada1 = '/images/barbershops/almada/fellas-barbers-almada-interior-1.png'
const almada2 = '/images/barbershops/almada/fellas-barbers-almada-interior-2.png'
const almada3 = '/images/barbershops/almada/fellas-barbers-almada-interior-3.png'
const almada4 = '/images/barbershops/almada/fellas-barbers-almada-interior-4.png'
const almada5 = '/images/barbershops/almada/fellas-barbers-almada-interior-5.png'

export function useBarbershops() {
  const { t } = useI18n()

  const barbershops = computed<Barbershop[]>(() => [
    {
      id: 'alameda',
      name: `${t('barbershops.unit')} Alameda`,
      address: 'Alameda Dom Afonso Henriques, 47A - 1000-123 Alameda - Lisboa/LI - Portugal',
      phone: '+351 215 860 238',
      whatsapp: '+351 912 286 442',
      instagram: 'https://www.instagram.com/fellasbarber.pt',
      facebook: 'https://www.facebook.com/FellasBarberAlameda',
      scheduleWeekday: `${t('barbershops.schedule.weekdays')}: 10:00 - 19:00`,
      scheduleWeekend: `${t('barbershops.schedule.saturday')} ${t('barbershops.schedule.and')} ${t('barbershops.schedule.holidays')}: 10:00 - 17:00`,
      scheduleSunday: `${t('barbershops.schedule.sunday')}: 10:00 - 14:00`,
      mapsUrl: 'https://maps.app.goo.gl/D83DuiVBsqQ4mith6',
      bookingUrl: 'https://sites.appbarber.com.br/fellasbarbersho-auei',
      images: [alameda1, alameda2, alameda3],
    },
    {
      id: 'campo-grande',
      name: `${t('barbershops.unit')} Campo Grande`,
      address: 'Campo Grande, 296 B - 1700-097 Alvalade - Lisboa/LI - Portugal',
      phone: '+351 215 904 241',
      whatsapp: '+351 910 452 767',
      instagram: 'https://www.instagram.com/fellasbarber2.pt',
      facebook:
        'https://www.facebook.com/people/Fellas-Barber-Premium-II/61562815660848/?rdid=nEF4vgUgQpGM7Q6g&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Eky6MhsaA%2F%3Fmibexti',
      scheduleWeekday: `${t('barbershops.schedule.weekdays')}: 10:00 - 20:00`,
      scheduleWeekend: `${t('barbershops.schedule.saturday')} ${t('barbershops.schedule.and')} ${t('barbershops.schedule.holidays')}: 10:00 - 18:00`,
      scheduleSunday: `${t('barbershops.schedule.sunday')}: ${t('barbershops.schedule.closed')}`,
      mapsUrl: 'https://maps.app.goo.gl/ykdUubmgE2FxJQph9',
      bookingUrl: 'https://sites.appbarber.com.br/fellasbarberpre-81lr',
      images: [campoGrande1, campoGrande2, campoGrande3, campoGrande4],
    },
    {
      id: 'almada',
      name: `${t('barbershops.unit')} Almada`,
      address: 'Av. do Cristo Rei 2A, 2800-055 Almada - Portugal',
      phone: '+351 215 500 374',
      whatsapp: '+351 923 343 517',
      instagram: 'https://www.instagram.com/fellasbarber.pt',
      facebook: 'https://www.facebook.com/FellasBarberAlameda',
      scheduleWeekday: `${t('barbershops.schedule.weekdays')}: 10:00 - 20:00`,
      scheduleWeekend: `${t('barbershops.schedule.saturday')} ${t('barbershops.schedule.and')} ${t('barbershops.schedule.holidays')}: 10:00 - 18:00`,
      scheduleSunday: `${t('barbershops.schedule.sunday')}: ${t('barbershops.schedule.closed')}`,
      mapsUrl: 'https://maps.app.goo.gl/JhKbV9Rn9UXhU6U4A',
      bookingUrl: 'https://sites.appbarber.com.br/fellasalmada-kwtd',
      images: [almada1, almada2, almada3, almada4, almada5],
    },
  ])

  return { barbershops }
}
