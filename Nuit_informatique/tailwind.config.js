/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'retro-dark': '#1a1a1a', // Example dark color, adjust as needed
                'retro-gray': '#333333', // Example gray
                'retro-green': '#4ade80', // Example green (Tailwind green-400)
            },
            fontFamily: {
                'pixel': ['"Press Start 2P"', 'cursive'],
            },
            keyframes: {
                'pulse-scale': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                },
                'warning': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.3)', opacity: '0.7' },
                },
            },
            animation: {
                'pulse-scale': 'pulse-scale 1.5s ease-in-out infinite',
                'warning': 'warning 0.8s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
