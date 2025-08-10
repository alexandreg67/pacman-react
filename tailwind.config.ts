import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  content: ['index.html', 'src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      animationDelay: {
        1000: '1s',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    daisyui,
    function ({ addUtilities, theme }) {
      const delays = theme('animationDelay')
      const newUtils = Object.entries(delays).map(([name, value]) => [
        `.animation-delay-${name}`,
        { 'animation-delay': value },
      ])
      addUtilities(Object.fromEntries(newUtils))
    },
  ],
  daisyui: {
    themes: ['emerald', 'dark'],
    darkTheme: 'dark',
    logs: false,
  },
} satisfies Config
