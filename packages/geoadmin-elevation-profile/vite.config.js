import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import dts from 'vite-plugin-dts'
import vueDevTools from 'vite-plugin-vue-devtools'


export default {
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.ts')],
            name: '@geoadmin/elevation-profile',
        },
        rollupOptions: {
            external: ['vue', 'tailwindcss'],
            output: {
                exports: 'named',
                globals: {
                    vue: 'Vue',
                }
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
        dts(),
    ],
}
