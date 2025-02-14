import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default {
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.ts')],
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
