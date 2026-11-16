/** The number of stars a rating is shown out of. */
export const MAX_RATING = 5

/**
 * Gives the initials shown in place of a customer's photo.
 *
 * @param name - the customer's name as written in the review
 * @returns the first letter of the first two words, in capitals; one letter
 *   for a single name, nothing for an empty one
 * @example
 * getInitials('João Pedro Santos') // 'JP'
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Says which of the stars under a testimonial are filled.
 *
 * @param rating - the review's rating, a whole number from 0 to `MAX_RATING`
 * @returns one entry per star, left to right; `true` for a filled one
 * @example
 * renderStars(3) // [true, true, true, false, false]
 */
export function renderStars(rating: number): boolean[] {
  return Array.from({ length: MAX_RATING }, (_, star) => star < rating)
}
