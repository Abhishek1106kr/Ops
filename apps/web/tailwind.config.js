/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#09090B',
        darkCard: '#18181B',
        darkCardHover: '#202024',
        darkBorder: '#27272A',
        brandPurple: '#4F46E5',
        brandCyan: '#06B6D4',
        brandEmerald: '#22C55E',
        brandRose: '#EF4444',
        brandAmber: '#F59E0B',
        brandText: '#FAFAFA',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        glow: '0 0 15px rgba(124, 58, 237, 0.15)',
      },
    },
  },
  plugins: [],
}
