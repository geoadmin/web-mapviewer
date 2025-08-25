import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import vueDevTools from 'vite-plugin-vue-devtools'

export default {
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.ts')],
            name: '@swissgeo/tooltip',
        },
        rollupOptions: {
            external: ['vue', 'tailwindcss'],
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
        tailwindcss(),
        vue(),
        vueDevTools(),
        dts({
            bundleTypes: true,
            processor: 'vue',
        }),
    ],
}
