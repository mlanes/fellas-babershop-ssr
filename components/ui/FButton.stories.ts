import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FButton from './FButton.vue'

const meta = {
  title: 'Components/FButton',
  component: FButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'gradient', 'outline'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    type: { control: 'select', options: ['button', 'submit', 'reset'] },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    fullWidth: false,
    type: 'button',
  },
  render: (args) => ({
    components: { FButton },
    setup: () => ({ args }),
    template: '<FButton v-bind="args">Book Now</FButton>',
  }),
} satisfies Meta<typeof FButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Gradient: Story = { args: { variant: 'gradient' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Disabled: Story = { args: { disabled: true } }
export const FullWidth: Story = { args: { fullWidth: true } }

/** All three sizes side by side for quick visual comparison. */
export const Sizes: Story = {
  render: () => ({
    components: { FButton },
    template: `
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
        <FButton size="sm">Small</FButton>
        <FButton size="md">Medium</FButton>
        <FButton size="lg">Large</FButton>
      </div>`,
  }),
}

/** Every variant in one view. */
export const Variants: Story = {
  render: () => ({
    components: { FButton },
    template: `
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <FButton variant="primary">Primary</FButton>
        <FButton variant="secondary">Secondary</FButton>
        <FButton variant="gradient">Gradient</FButton>
        <FButton variant="outline">Outline</FButton>
      </div>`,
  }),
}
