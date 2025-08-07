// tailwind.config.js
module.exports = {
  // ...
  theme: {
    extend: {
      textShadow: {
        glow: '0 0 10px rgba(255,255,255,0.8)',
      },
    },
  },
  plugins: [require('tailwindcss-textshadow')],
}
