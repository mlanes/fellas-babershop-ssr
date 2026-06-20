import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FLanguageSelector from './FLanguageSelector.vue'

/**
 * Locale dropdown. It reads and writes the live i18n locale via
 * useLocale(), so selecting a language in a story changes the locale
 * for the whole Storybook session — that is expected.
 */
const meta = {
  title: 'Components/FLanguageSelector',
  component: FLanguageSelector,
  tags: ['autodocs'],
  // The dropdown opens downward — give it room.
  decorators: [() => ({ template: '<div style="min-height:280px;padding:1rem"><story /></div>' })],
} satisfies Meta<typeof FLanguageSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
