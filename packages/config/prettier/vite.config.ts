import type { UserConfig } from 'vite'

import { resolve } from 'path'
import dts from 'unplugin-dts/vite'

const config: UserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'index.ts'),
            },
            name: '@swissgeo/config-prettier',
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

export default config
