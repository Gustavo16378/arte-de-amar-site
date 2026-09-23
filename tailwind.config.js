/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        creme: 'var(--creme)',
        tinta: 'var(--tinta)',
        'verde-profundo': 'var(--verde-profundo)',
        esmeralda: 'var(--esmeralda)',
        menta: 'var(--menta)',
        neutro: 'var(--neutro)',
        'neutro-fechado': 'var(--neutro-fechado)',
        terracota: 'var(--terracota)',
        'creme-fundo': 'var(--creme-fundo)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
      maxWidth: {
        leitura: '560px',
      },
    },
  },
  plugins: [],
}
