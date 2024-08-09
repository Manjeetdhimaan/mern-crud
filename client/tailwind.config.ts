/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "blink-border": {
            '0%': { border: "2px solid #ef4444" },
            '50%': { border: "2px solid #ffffff"  },
            '100%': { border: "2px solid #ef5555"  }
        }
    },
    animation: {
        "blink-border": 'blink-border 0.8s',
    }
    },
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

