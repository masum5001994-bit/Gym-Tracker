/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'Inter', 'system-ui', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'Barlow', 'sans-serif'],
      },
      colors: {
        'gym-bg': '#0e0e10',
        'gym-card': '#1b1b1e',
        'gym-primary': '#ff6b00',
        'gym-secondary': '#ffd600',
        'gym-text': '#ffffff',
        'gym-muted': '#a0a0a6',
        'gym-border': '#2e2e33',
        bws: {
          blue: {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            950: '#070f26',
          },
          gold: {
            400: '#facc15',
            500: '#eab308',
            600: '#d97706',
            700: '#b45309',
          },
        },
      },

    },
  },
  plugins: [],
};
