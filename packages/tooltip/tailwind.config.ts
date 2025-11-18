import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
    // to ease cohabitation with Bootstrap, can be removed once we've migrated away from Bootstrap
    important: true,
}

export default config
