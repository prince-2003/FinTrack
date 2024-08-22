/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./views/**/*.ejs'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function({ addComponents }) {
      const newComponents = {
        '.active-link': {
          backgroundColor: '#3ccf4e',
          color: '#002226',
          fontWeight: '800'
        },
      };
      addComponents(newComponents);
    }),
  ],
};
