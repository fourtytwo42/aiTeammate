import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      screens: {
        tablet: '960px',
        desktop: '1280px'
      },
      colors: {
        background: 'var(--color-background)',
        panel: 'var(--color-panel)',
        outline: 'var(--color-outline)',
        textPrimary: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)'
      },
      boxShadow: {
        glow: '0 0 0 3px rgba(126,93,255,0.35)'
      }
    }
  },
  plugins: []
};

export default config;
