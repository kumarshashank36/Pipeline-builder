/** @type {import('tailwindcss').Config} */
//
// Tailwind earns its place here for two things only:
//   1. Preflight (`@tailwind base` in src/index.css) — the app's CSS reset.
//   2. The `fontFamily` tokens preflight applies to <html>.
//
// All component styling is hand-written in src/index.css against CSS custom
// properties, so there are deliberately no colour/shadow/animation extensions:
// unreferenced theme keys emit no CSS and only add noise.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
