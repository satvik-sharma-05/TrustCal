/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00F5FF', // Electric Cyan
          glow: 'rgba(0, 245, 255, 0.4)',
        },
        secondary: {
          DEFAULT: '#FF2D95', // Neon Magenta
          glow: 'rgba(255, 45, 149, 0.4)',
        },
        accent: {
          DEFAULT: '#7B61FF', // Bright Violet
          glow: 'rgba(123, 97, 255, 0.4)',
        },
        safe: {
          DEFAULT: '#00FF41', // Bright Lime
          glow: 'rgba(0, 255, 65, 0.3)',
        },
        danger: {
          DEFAULT: '#FF003C', // Neon Red
          glow: 'rgba(255, 0, 60, 0.4)',
        },
        background: {
          start: '#FFFFFF',
          end: '#F0F7FF',
        },
        panel: 'rgba(255, 255, 255, 0.7)',
        border: 'rgba(255, 255, 255, 0.2)',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 245, 255, 0.3), 0 0 20px rgba(0, 245, 255, 0.1)',
        'neon-magenta': '0 0 10px rgba(255, 45, 149, 0.3), 0 0 20px rgba(255, 45, 149, 0.1)',
        'neon-violet': '0 0 10px rgba(123, 97, 255, 0.3), 0 0 20px rgba(123, 97, 255, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #00F5FF 0%, #7B61FF 50%, #FF2D95 100%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 245, 255, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 245, 255, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
