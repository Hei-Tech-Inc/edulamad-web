import type { Config } from 'tailwindcss';

const config: Config = {
  /** Match `ThemeContext`: toggle sets `class="dark"` on `<html>`, not OS `prefers-color-scheme`. */
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds — resolved from CSS vars so both themes work
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          raised: 'var(--bg-raised)',
          hover: 'var(--bg-hover)',
        },
        // Brand — same hue in both themes
        brand: {
          DEFAULT: 'var(--brand-orange)',
          dim: 'var(--brand-orange-dim)',
          glow: 'var(--brand-orange-glow)',
          hover: '#EA6C0D',
          light: '#FB923C',
        },
        // Text — resolved from CSS vars
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
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
        'slide-in-right': 'slideInRight 0.2s ease-out',
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
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
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

