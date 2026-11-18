/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Anek Bangla"', 'system-ui', 'sans-serif'] },
      colors: {
        sidebar: '#211E46',
        primary: { DEFAULT: '#4A4396', 50: '#EEEDF8', 100: '#DDDAF1', 700: '#37317A' },
        accent: '#52B89A',
        page: '#F4F5F8',
        line: '#E3E5EB',
        ink: { DEFAULT: '#151528', 2: '#5A5B6E', muted: '#8A8C9C' },
        ok: { DEFAULT: '#1F8A5B', bg: '#E6F4EC' },
        review: { DEFAULT: '#A86A12', bg: '#FDF3E1' },
        stale: { DEFAULT: '#9A5B2E', bg: '#F7ECE3' },
        bad: { DEFAULT: '#C53030', bg: '#FDECEC' },
      },
      borderRadius: { card: '12px' },
    },
  },
  plugins: [],
};
