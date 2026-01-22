import type { UserConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import vueDevTools from 'vite-plugin-vue-devtools'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: UserConfig = {
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
            // Externalize peer dependencies so they use the host application's instances
            external: ['proj4', 'ol', 'ol/proj/proj4', '@swissgeo/log'],
            output: {
                exports: 'named',
                name: '@swissgeo/coordinates',
                globals: {
                    vue: 'Vue',
                    proj4: 'proj4',
                    ol: 'ol',
                    'ol/proj/proj4': 'ol/proj/proj4',
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
}

export default config
