/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./views/**/*.ejs'],
  theme: {
    extend: {
      scrollbar: {
        thumb: 'rounded-full bg-gray-400',
        track: 'rounded-full bg-gray-100',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
