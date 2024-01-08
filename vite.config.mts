import vue from '@vitejs/plugin-vue'
import gitDescribe from 'git-describe'
import { dirname, resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import generateBuildInfo from './vite-plugins/vite-plugin-generate-build-info'

// We take the version from APP_VERSION but if not set, then take
// it from git describe command
let appVersion = process.env.APP_VERSION
if (!appVersion) {
    appVersion = 'v' + gitDescribe.gitDescribeSync().semverString
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const cesiumSource = `${__dirname}/node_modules/cesium/Source`
const cesiumWorkers = '../Build/Cesium/Workers'

// https://vitejs.dev/config/
export default defineConfig(({ _, mode }) => {
    return {
        base: './',
        build: {
            emptyOutDir: true,
            assetsDir: `${appVersion}/assets`,
            outDir: `./dist/${mode}`,
        },
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: (tag) => tag === 'cesium-compass',
                    },
                },
                script: {
                    // TODO remove this once updated vue to 3.4
                    defineModel: true,
                },
            }),
            generateBuildInfo(appVersion),
            // CesiumJS requires static files from the following 4 folders to be included in the build
            // https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/#install-with-npm
            viteStaticCopy({
                targets: [
                    {
                        src: normalizePath(`${cesiumSource}/${cesiumWorkers}`),
                        dest: `./`,
                    },
                    {
                        src: normalizePath(`${cesiumSource}/Assets/`),
                        dest: `./`,
                    },
                    {
                        src: normalizePath(`${cesiumSource}/Widgets/`),
                        dest: `./`,
                    },
                    {
                        src: normalizePath(`${cesiumSource}/ThirdParty/`),
                        dest: `./`,
                    },
                ],
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                tests: fileURLToPath(new URL('./tests', import.meta.url)),
                cesium: normalizePath(resolve(__dirname, 'node_modules/cesium')),
            },
        },
        define: {
            __APP_VERSION__: JSON.stringify(appVersion),
            VITE_ENVIRONMENT: JSON.stringify(mode),
        },
        test: {
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            reporter: ['default', 'junit'],
            outputFile: 'tests/results/unit/unit-test-report.xml',
            silent: true,
        }
    }
})
