/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0047AB',
          ink: '#0F1F3D',
          teal: '#2AB6A5',
          mist: '#EAF1FF',
          line: '#D5DDEE',
          canvas: '#F5F8FE',
          green: '#1C9A57',
          amber: '#F2A33C',
          red: '#D9534F',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        strategist: '0 24px 64px rgba(10, 32, 84, 0.12)',
        float: '0 14px 28px rgba(9, 31, 75, 0.12)',
      },
    },
  },
  plugins: [],
};
