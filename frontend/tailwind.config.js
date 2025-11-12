/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        button: ['Poppins', 'sans-serif'],
        input: ['Nunito Sans', 'sans-serif'],
        body: ['sans-serif'],
      },
      colors: {
        login: '#FCAF3C',
        register: '#5268F7',
        sidebar: '#F3E43C',
        danger: '#E53E3E',
        
      },
    },
  },
  plugins: [],
}

