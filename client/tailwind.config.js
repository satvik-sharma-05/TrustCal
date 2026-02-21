/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          base: '#0d0a14',
          deep: '#0f0c18',
          mid: '#1a1525',
          light: '#252035',
        },
        card: 'rgba(9, 9, 11, 0.94)',
        'card-foreground': '#fafafa',
        'muted-foreground': '#71717a',
        panel: '#0a0a0b',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#fafafa',
        'accent-muted': '#a1a1aa',
        purple: {
          DEFAULT: '#8b5cf6',
          glow: 'rgba(139, 92, 246, 0.35)',
          soft: 'rgba(139, 92, 246, 0.15)',
        },
        crimson: {
          DEFAULT: '#dc2626',
          glow: 'rgba(220, 38, 38, 0.25)',
          soft: 'rgba(220, 38, 38, 0.15)',
        },
        emerald: {
          DEFAULT: '#10b981',
          glow: 'rgba(16, 185, 129, 0.2)',
        },
        amber: {
          DEFAULT: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.2)',
        },
        cyan: {
          DEFAULT: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.3)',
        },
        pink: {
          DEFAULT: '#ec4899',
          glow: 'rgba(236, 72, 153, 0.3)',
        },
        slate: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
      },
      transitionDuration: {
        400: '400ms',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Share Tech Mono', 'monospace'],
        display: ['Orbitron', 'Share Tech Mono', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        display: '300',
      },
      borderRadius: {
        'glass': '14px',
        'glass-sm': '10px',
      },
      boxShadow: {
        'glass': '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 8px rgba(0,0,0,0.3)',
        'glass-hover': '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 16px rgba(0,0,0,0.35)',
        'emboss': '0 1px 0 rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.2)',
        'recess': 'inset 0 2px 4px rgba(0,0,0,0.2)',
      },
      animation: {
        'count-up': 'countUp 0.8s ease-out forwards',
        'breathe': 'breathe 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
      },
      keyframes: {
        spotlight: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
};
