/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ed',
          100: '#e1e9db',
          200: '#c3d3b7',
          300: '#a5bd93',
          400: '#87a76f',
          500: '#4F6C3C',
          600: '#3f5630',
          700: '#2f4024',
          800: '#1f2a18',
          900: '#0f150c',
        },
        secondary: {
          50: '#f4f7f0',
          100: '#e9efe1',
          200: '#d3dfc3',
          300: '#bdcfa5',
          400: '#a7bf87',
          500: '#84AB51',
          600: '#6a8941',
          700: '#4f6731',
          800: '#354520',
          900: '#1a2310',
        }
      }
    },
  },
  plugins: [],
}
