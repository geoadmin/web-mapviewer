import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import dts from 'vite-plugin-dts'

export default {
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.ts')],
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
            outDir: 'dist',
        }),
    ],
}
