import type { UserConfig } from 'vite'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'

const config: UserConfig = {
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
            },
            name: '@swissgeo/staging-config',
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
}

export default config
