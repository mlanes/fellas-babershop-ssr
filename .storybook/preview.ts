import type { Preview } from '@storybook-vue/nuxt'
// Global design tokens, theme variables, typography and self-hosted fonts.
import '../assets/styles/main.scss'

const preview: Preview = {
  // Toolbar switch to preview every component in both site themes. The
  // F* primitives read CSS custom properties keyed off data-theme.
  globalTypes: {
    theme: {
      description: 'Site theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme)
      return story()
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      // Sidebar order: introduction first, then foundations (Colors →
      // Typography → Spacing), then the components, alphabetical within.
      storySort: {
        order: ['Introduction', 'Foundations', ['Colors', 'Typography', 'Spacing'], 'Components'],
      },
    },
  },
}

export default preview
