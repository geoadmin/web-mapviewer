import type { UserConfig } from 'vite'

import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
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
            // Externalize peer dependencies so they use the host application's instances
            external: [
                'axios',
                'ol',
                'pako',
                'proj4',
                '@swissgeo/layers',
                '@swissgeo/layers/utils',
                '@swissgeo/log',
                '@swissgeo/staging-config',
            ],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
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
