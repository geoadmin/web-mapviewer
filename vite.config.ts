import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    return {
        base: './',
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                tests: fileURLToPath(new URL('./tests', import.meta.url)),
            },
        },
        define: {
            // Getting package.json version in order to expose it to the app
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
            VITE_ENVIRONMENT: JSON.stringify(mode),
        },
        test: {
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        },
    }
})
