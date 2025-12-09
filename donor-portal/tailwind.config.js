/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terracotta': '#D97757',
        'mediterranean-blue': '#5B9BD5',
        'olive-green': '#9CAF88',
        'cream': '#FDF6E9',
        'espresso': '#3E2723',
        'taupe': '#A1887F',
        'burnt-orange': '#E67E22',
        'sky-blue': '#87CEEB',
        'mint-green': '#98D8C8',
      },
    },
  },
  plugins: [],
}

