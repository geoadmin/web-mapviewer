import vueI18n from '@intlify/unplugin-vue-i18n/vite'
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
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.includes('-'),
                },
            },
        }),
        vueDevTools(),
        vueI18n(),
        tailwindcss(),
        dts({
            outDir: 'dist',
        }),
    ],
}
