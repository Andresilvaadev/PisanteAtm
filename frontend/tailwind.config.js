/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFFDF4',
          100: '#FEF3CC',
          200: '#FDE59A',
          300: '#F8D060',
          400: '#ECC030',
          500: '#D4AF37',
          600: '#A88010',
          700: '#886600',
          800: '#6A5000',
          900: '#503C00',
          950: '#362800',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
