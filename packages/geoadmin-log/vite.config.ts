import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
    return {
        build: {
            lib: {
                entry: {
                    index: resolve(__dirname, 'src/index.ts'),
                    Message: resolve(__dirname, 'src/Message.ts'),
                },
                name: '@geoadmin/log',
            },
            rollupOptions: {
                output: {
                    exports: 'named',
                },
            },
            minify: mode !== 'development',
        },
        plugins: [
            dts({
                outDir: 'dist',
            }),
        ],
    }
})
