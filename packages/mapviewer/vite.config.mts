import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import gitDescribe from 'git-describe'
import { dirname } from 'path'
import { fileURLToPath, URL } from 'url'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vueDevTools from 'vite-plugin-vue-devtools'

import generateBuildInfo from './vite-plugins/vite-plugin-generate-build-info'

// We take the version from APP_VERSION but if not set, then take
// it from git describe command
let appVersion = process.env.APP_VERSION
if (!appVersion) {
    // NOTE: git-describe package add sometimes `+` signs (what the real git describe command don't)
    // and the `+` sign on the URL is actually a space, so it should be percent encoded.
    // Therefore we change the + sign into '-' for simplification.
    appVersion = 'v' + gitDescribe.gitDescribeSync().semverString.replace('+', '-')
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const cesiumFolder = `${__dirname}/../../node_modules/cesium/`
const cesiumSource = `${cesiumFolder}Source/`
const cesiumStaticDir = `./${appVersion}/cesium/`

const stagings = {
    development: 'dev',
    integration: 'int',
    production: 'prod',
}

/**
 * We use manual chunks to reduce the size of the final index.js file to improve startup
 * performance.
 *
 * @param id
 * @returns
 */
function manualChunks(id) {
    // Put all files from the src/utils into the chunk named utils.js
    if (id.includes('/src/utils/')) {
        return 'utils'
    }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // We use "test" only to decide if we want to add Vue dev tools or not (we don't want them when testing).
    // It otherwise is "development" mode...
    const definitiveMode = mode === 'test' ? 'development' : mode
    return {
        base: './',
        build: {
            emptyOutDir: true,
            assetsDir: `${appVersion}/assets`,
            outDir: `./dist/${stagings[definitiveMode]}`,
            rollupOptions: {
                output: {
                    manualChunks,
                },
            },
        },
        plugins: [
            {
                ...(process.env.USE_HTTPS
                    ? basicSsl({
                          /** Name of certification */
                          name: 'localhost',
                          /** Custom trust domains */
                          domains: ['localhost', '192.168.*.*'],
                          /** Custom certification directory */
                          certDir: './devServer/cert',
                      })
                    : {}),
                apply: 'serve',
            },
            tailwindcss(),
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: (tag) =>
                            tag === 'cesium-compass' || tag.startsWith('geoadmin-'),
                    },
                },
            }),
            generateBuildInfo(stagings[definitiveMode], appVersion),
            // CesiumJS requires static files from the following 4 folders to be included in the build
            // https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/#install-with-npm
            viteStaticCopy({
                targets: [
                    {
                        src: normalizePath(`${cesiumFolder}/Build/Cesium/Workers`),
                        dest: cesiumStaticDir,
                    },
                    {
                        src: normalizePath(`${cesiumSource}/Assets/`),
                        dest: cesiumStaticDir,
                    },
                    {
                        src: normalizePath(`${cesiumSource}/Widgets/`),
                        dest: cesiumStaticDir,
                    },
                    {
                        src: normalizePath(`${cesiumSource}/ThirdParty/`),
                        dest: cesiumStaticDir,
                    },
                ],
            }),
            mode === 'development' ? vueDevTools() : {},
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                tests: fileURLToPath(new URL('./tests', import.meta.url)),
                cesium: normalizePath(cesiumFolder),
            },
        },
        define: {
            __APP_VERSION__: JSON.stringify(appVersion),
            VITE_ENVIRONMENT: JSON.stringify(definitiveMode),
            __CESIUM_STATIC_PATH__: JSON.stringify(cesiumStaticDir),
            __VUE_OPTIONS_API__: 'false',
        },
        test: {
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            reporter: ['default', 'junit'],
            outputFile: 'tests/results/unit/unit-test-report.xml',
            silent: true,
            setupFiles: ['tests/setup-vitest.ts'],
            environment: 'jsdom',
        },
    }
})
