export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff77a9', // 泡泡粉
        secondary: '#a259ff', // 泡泡紫
      },
      fontFamily: {
        brand: ['Poppins', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(162,89,255,0.10)',
        btn: '0 2px 8px 0 rgba(255,119,169,0.15)',
      },
    },
  },
  plugins: [],
} 