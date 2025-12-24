import type { ViteUserConfig } from 'vitest/config'

import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: ViteUserConfig = defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                api: resolve(__dirname, 'src/api/index.ts'),
                parsers: resolve(__dirname, 'src/parsers/index.ts'),
                utils: resolve(__dirname, 'src/utils/index.ts'),
                validation: resolve(__dirname, 'src/validation/index.ts'),
                vue: resolve(__dirname, 'src/vue/index.ts'),
            },
            name: '@swissgeo/layers',
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                exports: 'named',
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
        vue(),
        dts({
            bundleTypes: true,
            processor: 'vue',
        }),
    ],
    test: {
        environment: 'jsdom',
        pool: 'threads',
    },
})

export default config
