import type { ViteUserConfig } from 'vitest/config'

import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: ViteUserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                css: resolve(__dirname, 'src/scss/index.scss'),
            },
            name: '@swissgeo/theme',
        },
        rollupOptions: {
            external: ['tailwindcss', 'bootstrap'],
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Boostrap 5.3.x has too many deprecation warnings (10k+ on a single build)
                quietDeps: true,
                silenceDeprecations: ['import', 'color-functions'],
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
        viteStaticCopy({
            targets: [
                {
                    src: 'src/scss/*',
                    dest: './scss/',
                },
                {
                    src: 'src/fonts/FrutigerLight/*',
                    dest: './fonts/FrutigerLight/',
                },
            ],
        }),
        dts({
            bundleTypes: true,
        }),
    ],
    test: {
        environment: 'jsdom',
    },
}

export default config
