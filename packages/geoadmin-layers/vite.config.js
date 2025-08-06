import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                api: resolve(__dirname, 'src/api/index.ts'),
                parsers: resolve(__dirname, 'src/parsers/index.ts'),
                utils: resolve(__dirname, 'src/utils/index.ts'),
                validation: resolve(__dirname, 'src/validation/index.ts'),
                vue: resolve(__dirname, 'src/vue/index.ts'),
            },
            name: '@geoadmin/utils',
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [
        dts({
            bundleTypes: true,
        }),
    ],
    test: {
        environment: 'jsdom',
    },
})
