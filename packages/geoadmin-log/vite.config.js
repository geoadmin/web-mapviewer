import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default {
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
    },
    plugins: [
        dts({
            outDir: 'dist',
        }),
    ],
}
