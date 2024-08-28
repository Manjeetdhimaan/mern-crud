/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "blink-border": {
          "0%": { border: "2px solid #ef4444" },
          "50%": { border: "2px solid #ffffff" },
          "100%": { border: "2px solid #ef5555" },
        },
        "scale" : {
          "0%": {
            opacity: "0.5",
            transform: "scale(1.5)"
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)"
          }
        }
      },
      animation: {
        "blink-border": "blink-border 0.8s",
        "scale": "scale 0.4s"
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-none": {
          "scrollbar-width": "none", // Firefox specific property
          "&::-webkit-scrollbar": {
            display: "none", // Webkit browsers
          },
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin", // Firefox specific property
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
