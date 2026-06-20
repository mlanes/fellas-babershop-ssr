import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FIcon from './FIcon.vue'

const iconNames = [
  'check',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'calendar',
  'quote',
  'see-more',
  'star-filled',
  'email',
  'location',
  'crown',
  'whatsapp',
  'close',
]

const meta = {
  title: 'Components/FIcon',
  component: FIcon,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: { type: 'range', min: 12, max: 96, step: 4 } },
    color: { control: 'color' },
  },
  args: { name: 'check', size: 24, color: 'currentColor' },
  render: (args) => ({
    components: { FIcon },
    setup: () => ({ args }),
    template: '<FIcon v-bind="args" />',
  }),
} satisfies Meta<typeof FIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Large: Story = { args: { size: 64 } }
export const Branded: Story = { args: { name: 'crown', size: 48, color: '#E83752' } }

/** The full icon set at a glance. */
export const Gallery: Story = {
  render: () => ({
    components: { FIcon },
    setup: () => ({ iconNames }),
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap">
        <div
          v-for="n in iconNames"
          :key="n"
          style="display:flex;flex-direction:column;align-items:center;gap:.5rem;width:80px"
        >
          <FIcon :name="n" :size="32" />
          <small style="opacity:.6">{{ n }}</small>
        </div>
      </div>`,
  }),
}
