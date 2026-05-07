import type { UserConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tsconfigPaths from 'vite-tsconfig-paths'

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
                'ol',
            ],
        },
        sourcemap: true,
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
            '@': resolve(__dirname, 'src'),
        },
    },
    plugins: [
        tsconfigPaths(),
        tailwindcss(),
        dts({
            bundleTypes: true,
        }),
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
            // can create some race-conditioned error with the fonts folder if left to the default "writeBundle" hook.
            hook: 'closeBundle',
        }),
    ],
}

export default config
