// tailwind.config.js

/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette").default

const addVariablesForColors = plugin(function({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"))
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  )
 
  addBase({
    ":root": newVars,
  })
})

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sky-top': '#EAF2FC',
        'sky-mid': '#DCE3FA',
        'haze': '#E9DFFB',
        'ink': '#211C36',
        'ink-dim': '#6C6684',
        'accent-violet': '#7C5CFF',
        'accent-blue': '#4DA6FF',
        'glass-fill': 'rgba(255,255,255,0.55)',
        'glass-border': 'rgba(255,255,255,0.7)',
        'pill-dark': '#241B3D',
        // keeping these for backwards compatibility until all files updated
        void: '#09090b',
        dusk: '#1a1025',
        'signal-violet': '#ff007f',
        'cipher-cyan': '#00f0ff',
        'key-amber': '#ffea00',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'], // kept for backward compat, but we'll use Inter/Fraunces mostly
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        headline: ['Inter', 'sans-serif'],
        accent: ['Fraunces', 'serif'],
      },
      boxShadow: {
        'input': '0px 2px 3px -1px rgba(235, 0, 0, 0.1), 0px 1px 0px 0px rgba(14, 141, 237, 0.02), 0px 0px 0px 1px rgba(0, 87, 237, 0.08)',
        'glass': '0 8px 32px rgba(33,28,54,0.10)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    addVariablesForColors,
    require('@tailwindcss/typography'),
  ],
}