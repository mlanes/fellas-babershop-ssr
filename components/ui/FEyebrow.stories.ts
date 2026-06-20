import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FEyebrow from './FEyebrow.vue'

const meta = {
  title: 'Components/FEyebrow',
  component: FEyebrow,
  tags: ['autodocs'],
  argTypes: {
    align: { control: 'inline-radio', options: ['left', 'center'] },
    as: { control: 'inline-radio', options: ['p', 'span'] },
  },
  args: { align: 'center', as: 'p' },
  render: (args) => ({
    components: { FEyebrow },
    setup: () => ({ args }),
    template: '<FEyebrow v-bind="args">Our Services</FEyebrow>',
  }),
} satisfies Meta<typeof FEyebrow>

export default meta
type Story = StoryObj<typeof meta>

export const Center: Story = { args: { align: 'center' } }
export const Left: Story = { args: { align: 'left' } }
