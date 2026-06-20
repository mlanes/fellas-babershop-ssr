import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FLogoFooter from './FLogoFooter.vue'

const meta = {
  title: 'Components/FLogoFooter',
  component: FLogoFooter,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { size: 'md' },
  // Footer logo is light-on-dark — preview on a dark surface.
  parameters: {
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0A0909' }] },
  },
} satisfies Meta<typeof FLogoFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
export const Large: Story = { args: { size: 'lg' } }
