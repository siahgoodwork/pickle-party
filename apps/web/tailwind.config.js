/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{html,js,ts,tsx,jsx}"],
  safelist: [
    "mt-1",
    "mt-2",
    "col-span-3",
    "col-span-4",
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-rows-1",
    "grid-rows-2",
    "grid-rows-3",
    "grid-rows-4",
    "flex",
    "flex-col",
    "flex-row",
    "flex-wrap",
    "flex-nowrap",
    "opacity-25",
    "opacity-100",
    "w-[20%]",
    "w-[25%]",
  ],
  theme: {
    extend: {
      colors: {
        "pickle-beige": "#ffefd5",
        "pickle-green": "#52822c",
        "pickle-purple": "#5f2771",
      },
      fontFamily: {
        vcr: ["VCR", "monospace"],
        alt: ["Alt_Mono", "monospace"],
        bebas: ["Bebas Neue", "sans-serif"],
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
