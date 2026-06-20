import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import BeforeAfterSlider from './BeforeAfterSlider.vue'

const meta = {
  title: 'Components/BeforeAfterSlider',
  component: BeforeAfterSlider,
  tags: ['autodocs'],
  argTypes: {
    initialPosition: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    beforeLabel: { control: 'text' },
    afterLabel: { control: 'text' },
  },
  args: {
    beforeImage: '/images/before-after/fellas-barbers-haircut-before-3.jpg',
    afterImage: '/images/before-after/fellas-barbers-haircut-after-3.jpg',
    beforeLabel: 'Before',
    afterLabel: 'After',
    initialPosition: 50,
  },
  // Give the slider some breathing room in the canvas.
  decorators: [
    () => ({
      template: '<div style="max-width:720px;margin:0 auto"><story /></div>',
    }),
  ],
} satisfies Meta<typeof BeforeAfterSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Initial divider biased to the left so the "after" image dominates. */
export const RevealAfter: Story = { args: { initialPosition: 15 } }

/** Localized labels for the language toolbar. */
export const PortugueseLabels: Story = {
  args: { beforeLabel: 'Antes', afterLabel: 'Depois' },
}
