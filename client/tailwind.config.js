/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base neutra de SaaS com o rosa como cor de acento.
        primary: {
          DEFAULT: '#E38BA8',
          dark: '#C5638A',
          deep: '#A84C76',
          light: '#F1B8CC',
          soft: '#FCEBF1',
          tint: '#FBF3F6',
        },
        surface: '#F5F4F7', // fundo limpo, levemente quente
        card: '#FFFFFF',
        ink: '#201E26', // texto de alto contraste (neutro)
        muted: '#6C6873', // legível em fundo claro
        line: '#E8E6EC', // hairline neutra
        subtle: '#F1F0F4', // fundo de hover
        gold: '#CBA35A',
        success: '#3F9E76',
        danger: '#DC4B5F',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        // Sombras neutras e sutis (crispness de SaaS).
        soft: '0 12px 36px -12px rgba(20, 18, 26, 0.18)',
        card: '0 1px 2px rgba(20, 18, 26, 0.04), 0 6px 20px -12px rgba(20, 18, 26, 0.12)',
        glow: '0 8px 20px -6px rgba(197, 99, 138, 0.45)', // realce do CTA primário
        inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.21,.6,.35,1) both',
      },
    },
  },
  plugins: [],
};
