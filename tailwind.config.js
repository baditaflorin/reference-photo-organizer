/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f5f2ea',
        ink: '#23211d',
        graphite: '#3d3a34',
        moss: '#50624b',
        clay: '#9d6b53',
        saffron: '#cf9b45',
        tide: '#426a75',
        shell: '#fffaf0'
      },
      boxShadow: {
        board: '0 22px 60px rgba(35, 33, 29, 0.13)'
      }
    }
  },
  plugins: []
};
