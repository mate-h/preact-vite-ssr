import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: [
      '**/*.{vue,html,jsx,tsx}',
    ],
  },
  theme: {
    extend: {
      opacity: {
        medium: 0.6,
        disabled: 0.38,
        divider: 0.12,
        well: 0.06,
      },
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
      },
    },
  },
  plugins: [require('windicss/plugin/forms')],
})
