/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-blue':   '#00d4ff',
        'neon-purple': '#7928ca',
        'neon-teal':   '#06b6d4',
        'bg-primary':  '#050a14',
        'bg-secondary':'#0a1628',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        ultra: '0.35em',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'blink':      'blink 1s step-end infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.15)' },
          '50%':      { boxShadow: '0 0 40px rgba(0,212,255,0.35), 0 0 80px rgba(121,40,202,0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00d4ff 0%, #7928ca 100%)',
      },
    },
  },
  plugins: [],
};
