import { describe, expect, it } from 'vitest'
import { withLegacyFileExtension } from '../../utils/withLegacyFileExtension'

const imageHelpers = '/site/node_modules/@nuxt/image/dist/runtime/server/utils'

describe('The path of a server helper written for the older server', () => {
  it('is given its file extension, so ".legacy" is not taken for one', () => {
    expect(withLegacyFileExtension(`${imageHelpers}/image.legacy`)).toBe(
      `${imageHelpers}/image.legacy.js`
    )
  })

  it.each([
    { path: `${imageHelpers}/image`, why: 'it is not a legacy helper' },
    { path: `${imageHelpers}/image.legacy.js`, why: 'it has its extension already' },
    { path: '/site/node_modules/legacy/image', why: '"legacy" is a folder, not the ending' },
    { path: '/site/utils/imagelegacy', why: 'the ending is not ".legacy"' },
    { path: 'nitropack/runtime', why: 'it names a package, not a file' },
  ])('$path is left alone: $why', ({ path }) => {
    expect(withLegacyFileExtension(path)).toBe(path)
  })
})
