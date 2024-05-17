/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disables all preflight styles
  },
  // purge: 
  // {enabled: true,
  //   content: [
  //     "./src/**/*.html", "./src/**/*.ts"
  //   ],
  //   safelist: ['mat-expansion-panel', 'mat-expansion-indicator'],},
}
