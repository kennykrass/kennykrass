/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'background': '#111827', // Un carbón casi negro, muy oscuro
        'primary': '#1F2937',    // Índigo oscuro para paneles y tarjetas
        'accent': '#00FFFF',      // Cian Eléctrico vibrante para botones y highlights
        'text-primary': '#E5E7EB', // Plata suave para el texto principal
        'text-secondary': '#9CA3AF', // Gris para texto menos importante
      }
    },
  },
  plugins: [],
}