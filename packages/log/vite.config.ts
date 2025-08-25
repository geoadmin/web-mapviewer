import { resolve } from 'path'
import dts from 'unplugin-dts/vite'

export default {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                Message: resolve(__dirname, 'src/Message.ts'),
            },
            name: '@swissgeo/log',
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        },
    },
    plugins: [
        dts({
            bundleTypes: true,
        }),
    ],
}
