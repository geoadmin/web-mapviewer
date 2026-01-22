import type { UserConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import { normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname: string = dirname(fileURLToPath(import.meta.url))
const config: UserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                css: resolve(__dirname, 'src/scss/index.scss'),
            },
            name: '@swissgeo/theme',
        },
        rollupOptions: {
            external: [
                '@fortawesome/fontawesome-svg-core',
                'bootstrap',
                'tailwindcss',
                'stylelint',
            ],
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
                    src: normalizePath(`${__dirname}/src/scss/*`),
                    dest: './scss/',
                },
                {
                    src: normalizePath(`${__dirname}/src/fonts/*`),
                    dest: './fonts/',
                },
            ],
        }),
        dts({
            bundleTypes: true,
            exclude: ['/fonts'],
        }),
    ],
}

export default config
