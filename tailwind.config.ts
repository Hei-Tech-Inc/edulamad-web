import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          base: '#0F0F0F',
          surface: '#1A1A1A',
          raised: '#242424',
          hover: '#2E2E2E',
        },
        // Brand
        brand: {
          DEFAULT: '#F97316',
          dim: 'rgba(249,115,22,0.15)',
          glow: 'rgba(249,115,22,0.30)',
          hover: '#EA6C0D',
          light: '#FB923C',
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255,255,255,0.65)',
          muted: 'rgba(255,255,255,0.35)',
          disabled: 'rgba(255,255,255,0.20)',
        },
        // Semantic
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        body: ['var(--font-jakarta)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        'brand-glow': '0 0 20px rgba(249,115,22,0.25)',
        card: '0 1px 3px rgba(0,0,0,0.4)',
        raised: '0 4px 12px rgba(0,0,0,0.5)',
        float: '0 8px 32px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        shimmer: 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;

