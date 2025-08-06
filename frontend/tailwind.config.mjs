/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Assistant', 'ui-sans-serif', 'system-ui'],
      serif: ['"Roboto Slab"', 'ui-serif', 'Georgia'],
      mono: ['ui-monospace', 'SFMono-Regular'],
    },
    extend: {
      fontFamily: {
        'roboto-slab': ['"Roboto Slab"', 'serif'],
        assistant: ['Assistant', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#F9F0ED',
          100: '#EED1C8',
          200: '#bfdbfe',
          300: '#D99B88',
          400: '#D28871',
          500: '#C76A4D',
          600: '#C76A4D',
          700: '#8D4B37',
          800: '#1e40af',
          900: '#542D20',
        },
        gray: {
          10: '#F8F9FA',
          50: '#8E98A8',
          100: '#F1F3F5',
          200: '#E8ECEF',
          300: '#c7cdd3',
          400: '#bdc4ca',
          500: '#acb5bd',
          600: '#9da5ac',
          700: '#7a8186',
          800: '#495057',
          900: '#343A40',
        },
      },
    },
  },
  plugins: [],
};

export default config;
