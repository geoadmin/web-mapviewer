import type { ViteUserConfig } from 'vitest/config'

import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'

const config: ViteUserConfig = {
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.ts')],
            name: '@swissgeo/coordinates',
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
        dts({
            bundleTypes: true,
        }),
    ],
    test: {
        setupFiles: ['setup-vitest.ts'],
    },
}

export default config
