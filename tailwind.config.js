/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../app.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["PixelifySans_400"],
        "pixel-bold": ["PixelifySans_700"],
      },
    },
  },
  plugins: [],
}

