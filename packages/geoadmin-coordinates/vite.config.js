import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'

export default {
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.ts')],
            name: '@geoadmin/coordinates',
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
        setupFiles: ['setup-vitest.ts'],
    },
}
