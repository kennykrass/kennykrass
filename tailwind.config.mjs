/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'background': '#000000', // Negro puro igual al fondo del logo
        'primary': '#111111',    // Gris muy oscuro para paneles con contraste sutil
        'accent': '#00FFFF',      // Cian Eléctrico vibrante para botones y highlights
        'text-primary': '#E5E7EB', // Plata suave para el texto principal
        'text-secondary': '#9CA3AF', // Gris para texto menos importante
      }
    },
  },
  plugins: [],
}