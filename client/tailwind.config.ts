/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-none': {
          'scrollbar-width': 'none',  // Firefox specific property
          '&::-webkit-scrollbar': {
            display: 'none',  // Webkit browsers
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',  // Firefox specific property
        },
      };
      addUtilities(newUtilities);
    },
  ],
}

