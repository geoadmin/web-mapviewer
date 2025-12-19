import type { UserConfig } from 'vite'

import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: UserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                utils: resolve(__dirname, 'src/utils/index.ts'),
            },
            name: '@swissgeo/api',
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
        tsconfigPaths(),
        dts({
            bundleTypes: true,
        }),
    ],
}

export default config
