/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F8F2',
        ink: '#1B2B20',
        primary: {
          DEFAULT: '#2F6B3C',
          dark: '#1F4A29',
          light: '#E8F0E4',
        },
        accent: {
          DEFAULT: '#E85D2C',
          soft: '#FCE4D6',
        },
        gold: '#D9A441',
        line: '#E3E8DD',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}