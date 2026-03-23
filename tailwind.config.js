/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-dim": "#dadada",
        "error-container": "#ffdad6",
        "tertiary": "#000000",
        "secondary-container": "#dfeb72",
        "primary-fixed": "#e5e2e1",
        "secondary-fixed": "#dfeb72",
        "surface": "#f9f9f9",
        "background": "#f9f9f9",
        "on-background": "#1a1c1c",
        "tertiary-fixed": "#e3e2e2",
        "outline-variant": "#c4c7c7",
        "on-primary": "#ffffff",
        "secondary-fixed-dim": "#c3ce5a",
        "on-primary-container": "#858383",
        "inverse-primary": "#c8c6c5",
        "secondary": "#5b6300",
        "surface-tint": "#5f5e5e",
        "on-error-container": "#93000a",
        "inverse-on-surface": "#f1f1f1",
        "on-secondary-container": "#616a00",
        "on-tertiary": "#ffffff",
        "primary-fixed-dim": "#c8c6c5",
        "on-tertiary-container": "#848484",
        "surface-container-low": "#f3f3f3",
        "error": "#ba1a1a",
        "on-secondary-fixed": "#1a1d00",
        "tertiary-fixed-dim": "#c7c6c6",
        "on-primary-fixed-variant": "#474646",
        "on-tertiary-fixed": "#1b1c1c",
        "on-surface-variant": "#444748",
        "primary-container": "#1c1b1b",
        "surface-bright": "#f9f9f9",
        "primary": "#000000",
        "on-secondary-fixed-variant": "#444b00",
        "on-secondary": "#ffffff",
        "inverse-surface": "#2f3131",
        "on-tertiary-fixed-variant": "#464747",
        "surface-container-highest": "#e2e2e2",
        "on-primary-fixed": "#1c1b1b",
        "surface-variant": "#e2e2e2",
        "on-surface": "#1a1c1c",
        "tertiary-container": "#1b1c1c",
        "on-error": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "outline": "#747878"
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out infinite 1s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--tw-rotate, 0deg))' },
          '50%': { transform: 'translateY(-20px) rotate(var(--tw-rotate, 0deg))' },
        }
      }
    },
  },
  plugins: [],
}
