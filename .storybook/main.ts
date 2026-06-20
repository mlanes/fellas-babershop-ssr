import type { StorybookConfig } from '@storybook-vue/nuxt'

const config: StorybookConfig = {
  stories: [
    // Foundations + Introduction MDX docs (design tokens, getting started)
    '../.storybook/docs/**/*.mdx',
    // Reusable UI primitives — section components stay out of Storybook.
    '../components/ui/**/*.stories.@(ts|tsx|js|jsx|mdx)',
  ],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook-vue/nuxt',
}

export default config
