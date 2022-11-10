import { fileURLToPath, URL } from 'url'
import { gitDescribeSync } from 'git-describe'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import generateBuildInfo from './vite-plugins/generate-build-info'

const appVersion = 'v' + gitDescribeSync().semverString

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    return {
        base: './',
        plugins: [vue(), generateBuildInfo(appVersion)],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                tests: fileURLToPath(new URL('./tests', import.meta.url)),
            },
        },
        define: {
            __APP_VERSION__: JSON.stringify(appVersion),
            VITE_ENVIRONMENT: JSON.stringify(mode),
        },
        test: {
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        },
    }
})
