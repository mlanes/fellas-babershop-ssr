import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FLogo from './FLogo.vue'

const meta = {
  title: 'Components/FLogo',
  component: FLogo,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { size: 'md' },
} satisfies Meta<typeof FLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
export const Large: Story = { args: { size: 'lg' } }

/** All sizes together. */
export const Sizes: Story = {
  render: () => ({
    components: { FLogo },
    template: `
      <div style="display:flex;gap:2rem;align-items:center">
        <FLogo size="sm" />
        <FLogo size="md" />
        <FLogo size="lg" />
      </div>`,
  }),
}
