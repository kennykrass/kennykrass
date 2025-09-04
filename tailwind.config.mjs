/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  safelist: [
    'text-blue-600',
    'text-blue-700', 
    'bg-blue-100',
    'bg-blue-600',
    'bg-white',
    'hover:text-blue-600',
    'hover:text-blue-700',
    'hover:bg-blue-600',
    'border-blue-600',
    'border-gray-400',
    'focus:border-blue-600',
    'text-gray-900',
    'dark:border-blue-600',
    'dark:focus:border-accent',
    'dark:bg-background',
    'dark:text-text-primary'
  ],
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