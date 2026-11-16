import { describe, expect, it } from 'vitest'
import { MAX_RATING, getInitials, renderStars } from '../../utils/testimonials'

describe("A customer's initials, shown where a photo would be", () => {
  it.each([
    { name: 'Mario Lanes', initials: 'ML' },
    { name: 'madonna', initials: 'M' },
    { name: 'élise dupont', initials: 'ÉD' },
    { name: 'Ana  Silva', initials: 'AS' },
  ])('$name gives $initials', ({ name, initials }) => {
    expect(getInitials(name)).toBe(initials)
  })

  it('are the first two when the name has more than two words', () => {
    expect(getInitials('João Pedro Santos')).toBe('JP')
  })

  it('are empty for an empty name', () => {
    expect(getInitials('')).toBe('')
  })
})

describe('The stars under a testimonial', () => {
  it('are five', () => {
    expect(MAX_RATING).toBe(5)
    expect(renderStars(3)).toHaveLength(5)
  })

  it.each([
    { rating: 0, filled: 0 },
    { rating: 1, filled: 1 },
    { rating: 3, filled: 3 },
    { rating: 5, filled: 5 },
  ])('a rating of $rating fills $filled of them, from the left', ({ rating, filled }) => {
    const stars = renderStars(rating)
    expect(stars.filter(Boolean)).toHaveLength(filled)
    expect(stars.slice(0, filled).every(Boolean)).toBe(true)
  })

  it('never fills more than five', () => {
    expect(renderStars(9).filter(Boolean)).toHaveLength(5)
  })
})
