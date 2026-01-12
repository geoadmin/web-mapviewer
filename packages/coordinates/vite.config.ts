import type { ViteUserConfig } from 'vitest/config'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import vueDevTools from 'vite-plugin-vue-devtools'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: ViteUserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                ol: resolve(__dirname, 'src/ol.ts'),
            },
            name: '@swissgeo/coordinates',
        },
        sourcemap: true,
        rollupOptions: {
            output: {
                exports: 'named',
                name: '@swissgeo/coordinates',
                globals: {
                    vue: 'Vue',
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
        tailwindcss(),
        vue(),
        vueDevTools(),
        dts({
            bundleTypes: true,
        }),
    ],
    test: {
        setupFiles: ['setup-vitest.ts'],
    },
}

export default config
