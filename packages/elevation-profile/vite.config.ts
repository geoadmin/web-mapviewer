import type { ConfigEnv, PluginOption, UserConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vueDevTools from 'vite-plugin-vue-devtools'
import tsconfigPaths from 'vite-tsconfig-paths'

export type ViteModes = 'development' | 'production'

const cesiumSource = 'node_modules/cesium/Build/Cesium'
const cesiumBaseUrl = 'cesiumStatic'

function generatePlugins(mode: ViteModes): PluginOption[] {
    const plugins: PluginOption[] = []

    plugins.push(tsconfigPaths())
    plugins.push(tailwindcss())
    plugins.push(vue())
    if (mode === 'development') {
        plugins.push(vueDevTools())
        // our DevApp.vue component uses Cesium, so we need to configure Vite to be able
        // to deliver Cesium asset's
        // see https://cesium.com/blog/2024/02/13/configuring-vite-or-webpack-for-cesiumjs/#static-files
        plugins.push(
            viteStaticCopy({
                targets: [
                    { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
                    { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
                    { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
                    { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl },
                ],
            })
        )
    }
    plugins.push(
        dts({
            bundleTypes: true,
            processor: 'vue',
        })
    )
    return plugins
}

export default defineConfig((configEnv: ConfigEnv): UserConfig => {
    const { mode } = configEnv

    return {
        build: {
            lib: {
                entry: [resolve(__dirname, 'src/index.ts')],
                name: '@swissgeo/elevation-profile',
            },
            sourcemap: true,
            rollupOptions: {
                external: ['vue', 'tailwindcss', '@swissgeo/log'],
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
        define: {
            CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
        },
        plugins: generatePlugins(mode as ViteModes),
    }
})
