/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          primary: '#FF4D6D',
          secondary: '#6366F1',
          text: '#0F172A',
          muted: '#64748B',
        },
        insta: {
          pink: '#FF4D6D',
          purple: '#6366F1',
          orange: '#FF5F6D',
          yellow: '#FFC371',
        },
      },
      backgroundImage: {
        'insta-gradient': 'linear-gradient(135deg, #FF5F6D, #FFC371)',
        'primary-gradient': 'linear-gradient(135deg, #FF5F6D, #FFC371)',
        'story-ring': 'linear-gradient(135deg, #FF5F6D, #FFC371)',
      },
      boxShadow: {
        sidebar: '0 0 25px rgba(0,0,0,.04)',
        card: '0 8px 24px rgba(15,23,42,.06)',
        feed: '0 12px 35px rgba(0,0,0,.06)',
        active: '0 10px 20px rgba(255,95,109,.3)',
        dropdown: '0 18px 45px rgba(0,0,0,.12)',
        fab: '0 18px 35px rgba(255,95,109,.35)',
        profile: '0 10px 30px rgba(0,0,0,.05)',
      },
    },
  },
  plugins: [],
};
