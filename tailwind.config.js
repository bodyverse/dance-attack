// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      textShadow: {
        glow: '0 0 10px rgba(255,255,255,0.8)',
      },
    },
  },
  plugins: [require('tailwindcss-textshadow')],
}
