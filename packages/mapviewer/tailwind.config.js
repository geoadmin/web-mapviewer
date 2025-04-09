/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    // to ease cohabitation with Bootstrap, can be removed once we've migrated away from Bootstrap
    important: true,
}
