/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#111827',
        panel: '#f8fafc',
        solar: '#0f766e',
        amberline: '#f59e0b'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(17, 24, 39, 0.12)'
      }
    }
  },
  plugins: []
};
