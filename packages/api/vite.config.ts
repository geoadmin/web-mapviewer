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
            // Externalize peer dependencies so they use the host application's instances
            external: ['axios', 'ol', 'proj4', '@swissgeo/log'],
            output: {
                exports: 'named',
                globals: {
                    axios: 'axios',
                    ol: 'ol',
                    proj4: 'proj4',
                },
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
