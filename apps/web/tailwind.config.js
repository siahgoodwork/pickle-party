/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{html,js,ts,tsx,jsx}"],
  safelist: ["mt-1", "mt-2", "col-span-3", "col-span-4"],
  theme: {
    extend: {
      colors: {
        "pickle-beige": "#ffefd5",
        "pickle-green": "#52822c",
        "pickle-purple": "#5f2771",
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
