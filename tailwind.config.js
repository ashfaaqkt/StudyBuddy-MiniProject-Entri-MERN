/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#e6fffb',
                    100: '#bff9f0',
                    200: '#7ef2e3',
                    300: '#39dac7',
                    400: '#14b8a6',
                    500: '#0f9b8a',
                    600: '#0f766e',
                    700: '#0b5f59',
                },
                ember: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                },
                ink: {
                    900: '#0b0f14',
                    800: '#0f1720',
                    700: '#15212d',
                },
                mist: {
                    200: '#e5e7eb',
                    400: '#9ca3af',
                    600: '#6b7280',
                },
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
            boxShadow: {
                glow: '0 20px 60px -30px rgba(20, 184, 166, 0.7)',
                soft: '0 20px 45px -30px rgba(15, 23, 32, 0.8)',
            },
        },
    },
    plugins: [],
}
