/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8f9fa',
          tertiary: '#f1f3f5',
        },
        ink: {
          DEFAULT: '#212529',
          secondary: '#495057',
          tertiary: '#868e96',
          faint: '#adb5bd',
        },
        danger: {
          DEFAULT: '#fa5252',
          dark: '#e03131',
        },
        success: {
          DEFAULT: '#40c057',
          dark: '#2f9e44',
        },
      },
      fontFamily: {
        sans: ['System'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
