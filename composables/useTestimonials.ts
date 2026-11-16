import { testimonials } from '~/data/testimonials'

/**
 * Gives the customer testimonials shown on the home page. They are quoted as
 * the customers wrote them, so they are the same in every language.
 *
 * @returns `testimonials`, in the order they are shown
 */
export function useTestimonials() {
  return { testimonials }
}
