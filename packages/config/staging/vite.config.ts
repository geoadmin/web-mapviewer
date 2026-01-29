import type { UserConfig } from 'vite'

import { resolve } from 'path'
import dts from 'unplugin-dts/vite'

const config: UserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                constants: resolve(__dirname, 'src/constants/index.ts'),
            },
            name: '@swissgeo/staging-config',
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    plugins: [
        dts({
            bundleTypes: true,
        }),
    ],
}

export default config
