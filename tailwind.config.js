/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F14',
        surface: '#111827',
        border: 'rgba(255,255,255,0.08)',
        accent: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
        },
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-green': '0 0 20px rgba(34,197,94,0.15)',
        'glow-green-sm': '0 0 10px rgba(34,197,94,0.10)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0B0F14 60%, rgba(34,197,94,0.06) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
