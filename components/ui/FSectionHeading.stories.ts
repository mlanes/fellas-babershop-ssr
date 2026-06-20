import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import FSectionHeading from './FSectionHeading.vue'

const meta = {
  title: 'Components/FSectionHeading',
  component: FSectionHeading,
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'inline-radio', options: ['h1', 'h2', 'h3'] },
    align: { control: 'inline-radio', options: ['left', 'center'] },
  },
  args: {
    eyebrow: 'Our Services',
    heading: 'Crafted For The Modern Gentleman',
    subtitle: 'Professional barber services with a premium finish, in three Lisbon locations.',
    level: 'h2',
    align: 'center',
  },
} satisfies Meta<typeof FSectionHeading>

export default meta
type Story = StoryObj<typeof meta>

export const Centered: Story = { args: { align: 'center' } }
export const LeftAligned: Story = { args: { align: 'left' } }
export const HeadingOnly: Story = { args: { eyebrow: undefined, subtitle: undefined } }
export const NoEyebrow: Story = { args: { eyebrow: undefined } }

/** The #heading slot allows inline markup such as an accent span. */
export const AccentMarkup: Story = {
  render: (args) => ({
    components: { FSectionHeading },
    setup: () => ({ args }),
    template: `
      <FSectionHeading v-bind="args">
        <template #heading>
          Before <span style="color:#E83752">&amp;</span> After
        </template>
      </FSectionHeading>`,
  }),
  args: { heading: undefined, eyebrow: 'Check This Out', subtitle: 'Drag the bar to either side.' },
}
