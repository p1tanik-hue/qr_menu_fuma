import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // FUMA LOUNGE premium palette
        ink: {
          DEFAULT: '#0E0E0E', // deep black
          900: '#0A0A0A',
          800: '#141414',
          700: '#1B1B1B',
          600: '#242424',
        },
        graphite: {
          DEFAULT: '#2A2A2A',
          light: '#3A3A3A',
          soft: '#333333',
        },
        gold: {
          DEFAULT: '#C9A55C', // primary gold
          light: '#E7CE93', // light gold
          soft: '#D8BE7E',
          deep: '#A9863F',
        },
        sand: {
          DEFAULT: '#E8DCC4', // warm beige
          soft: '#D9CBAE',
          muted: '#B7AC94',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0,0,0,0.6)',
        gold: '0 8px 30px -10px rgba(201,165,92,0.35)',
        card: '0 20px 60px -20px rgba(0,0,0,0.75)',
      },
      backgroundImage: {
        'gold-line':
          'linear-gradient(90deg, transparent, rgba(201,165,92,0.7), transparent)',
        'gold-sheen':
          'linear-gradient(135deg, #E7CE93 0%, #C9A55C 45%, #A9863F 100%)',
        'card-radial':
          'radial-gradient(120% 120% at 50% 0%, rgba(201,165,92,0.10) 0%, rgba(14,14,14,0) 60%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
