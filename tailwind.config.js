/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'speed-yellow': {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        'speed-black': {
          900: '#0c0c0c',
          800: '#1a1a1a',
          700: '#2d2d2d',
        }
      },
      animation: {
        'speed-blur': 'speed-blur 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'speed-glow': 'speed-glow 2s ease-in-out infinite',
        'speed-lines': 'speed-lines 2s linear infinite',
        'motorcycle-zoom': 'motorcycle-zoom 0.6s ease-in-out',
      },
      backgroundImage: {
        'speed-gradient': 'linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #facc15 50%, #eab308 75%, #000000 100%)',
      },
      boxShadow: {
        'speed': '0 0 40px rgba(250, 204, 21, 0.3)',
        'speed-lg': '0 0 60px rgba(250, 204, 21, 0.4)',
      }
    },
  },
  plugins: [],
};
