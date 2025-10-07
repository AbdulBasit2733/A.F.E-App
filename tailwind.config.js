/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // The key is the class name (e.g., `font-spacemono`)
        // The value is an array of font names you used in `useFonts`.
        spacemono: ["SpaceMono-Regular"],
        "poppins-bold": ["Poppins-Bold"],
        "poppins-regular": ["Poppins-Regular"],
      },
      colors: {
        primary: "#6566fc",
      },
    },
  },
  plugins: [],
};
