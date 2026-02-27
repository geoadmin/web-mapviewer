import type { UserConfig } from 'vite'

import { resolve } from 'path'
import dts from 'unplugin-dts/vite'

const config: UserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'index.ts'),
            },
            name: '@swissgeo/config-eslint',
        },
        rollupOptions: {
            // Mark ESLint-related packages as external so Vite doesn't try to bundle them.
            // These packages use Node.js built-ins and can't be bundled for browser use.
            // This is safe because the config is only used in Node.js during linting.
            external: [
                /^@eslint\/.*/,
                /^@typescript-eslint\/.*/,
                /^@vue\/.*/,
                /^eslint.*/,
                /^typescript-eslint/,
                'globals',
            ],
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
