/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F0E4',
        'paper-dark': '#EBE3D1',
        ink: '#24312B',
        pine: {
          DEFAULT: '#2E5E4E',
          dark: '#1D4437',
          light: '#3F7863',
        },
        gold: {
          DEFAULT: '#B8873A',
          light: '#D6A863',
        },
        sage: {
          DEFAULT: '#7C9A82',
          light: '#A5BFAA',
        },
        rust: {
          DEFAULT: '#A6432E',
          light: '#C15E47',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        ledger: "repeating-linear-gradient(to bottom, transparent, transparent 35px, rgba(46,94,78,0.08) 36px)",
      },
    },
  },
  plugins: [],
}
