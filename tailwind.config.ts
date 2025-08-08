import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  content: ['index.html', 'src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['emerald', 'dark'],
    darkTheme: 'dark',
    logs: false,
  },
} satisfies Config
