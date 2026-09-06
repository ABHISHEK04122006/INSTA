/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F5F2F0',
          card: '#FFFFFF',
          border: '#EFE7E5',
          primary: '#903945',
          deep: '#681C2D',
          'dark-burgundy': '#7A2638',
          active: '#903945',
          secondary: '#DC8876',
          text: '#2D282A',
          muted: '#6D5E67',
          subtle: '#91858B',
          // Dark mode surface tokens
          'dark-bg': '#1C1518',
          'dark-card': '#271E22',
          'dark-border': '#403035',
          'dark-text': '#FCF8F7',
          'dark-muted': '#C2B4B8',
        },
        nexora: {
          pink: '#903945',
          purple: '#681C2D',
          orange: '#DC8876',
          yellow: '#FBD0BD',
          gradientStart: '#903945',
          gradientMid: '#903945',
          gradientEnd: '#681C2D',
        },
      },
      backgroundImage: {
        'nexora-gradient': 'linear-gradient(135deg, #903945, #681C2D)',
        'primary-gradient': 'linear-gradient(135deg, #903945 0%, #681C2D 100%)',
        'story-ring': 'linear-gradient(135deg, #903945 0%, #DC8876 58%, #E8AA8D 100%)',
        'dark-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'light-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      },
      boxShadow: {
        sidebar: '0 0 28px rgba(86,48,56,.05)',
        card: '0 10px 26px rgba(96,60,66,.07)',
        'dark-card': '0 10px 30px rgba(0,0,0,.3)',
        feed: '0 12px 30px rgba(86,49,57,.08)',
        active: '0 8px 22px rgba(144,57,69,.18)',
        dropdown: '0 18px 45px rgba(74,42,49,.16)',
        fab: '0 10px 25px rgba(144,57,69,.20)',
        glow: '0 0 20px rgba(144,57,69,.25)',
      },
      keyframes: {
        'heart-burst': {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '50%': { transform: 'scale(1.3) rotate(0deg)', opacity: '1' },
          '70%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'story-progress': {
          from: { width: '0%' },
          to: { width: '100%' },
        },
      },
      animation: {
        'heart-burst': 'heart-burst 800ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'fade-in': 'fade-in 300ms ease-out forwards',
        'story-progress': 'story-progress 5s linear forwards',
      },
    },
  },
  plugins: [],
};
