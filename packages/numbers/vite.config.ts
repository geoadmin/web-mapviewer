import type { UserConfig } from 'vite'

import { resolve } from 'path'
import dts from 'unplugin-dts/vite'

const config: UserConfig = {
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.ts')],
            name: '@swissgeo/numbers',
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
            external: ['@swissgeo/log'],
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
