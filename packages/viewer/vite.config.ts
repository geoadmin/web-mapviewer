import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import gitDescribe from 'git-describe'
import { dirname } from 'path'
import { fileURLToPath, URL } from 'url'
import {
    type ConfigEnv,
    defineConfig,
    normalizePath,
    type PluginOption,
    type UserConfig,
} from 'vite'
import ConditionalCompile from 'vite-plugin-conditional-compiler'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vueDevTools from 'vite-plugin-vue-devtools'
import tsconfigPaths from 'vite-tsconfig-paths'

import generateBuildInfo from './vite-plugins/vite-plugin-generate-build-info'

export type ViteModes = 'development' | 'integration' | 'production' | 'test'

const appVersion: string =
    // We take the version from APP_VERSION, and if not set from the git describe command
    process.env.APP_VERSION ??
    // NOTE: git-describe package adds sometimes `+` signs (what the real git describe command doesn't),
    // and the `+` sign on the URL is actually a space, so it should be percent encoded.
    // We therefore swap the '+' sign with '-' for simplification.
    `v${gitDescribe.gitDescribeSync().semverString?.replace('+', '-')}`

const __dirname: string = dirname(fileURLToPath(import.meta.url))
const cesiumFolder: string = `${__dirname}/node_modules/cesium/`
const cesiumSource: string = `${cesiumFolder}Source/`
const cesiumStaticDir: string = `./${appVersion}/cesium/`

const stagings: Record<ViteModes, string> = {
    development: 'dev',
    integration: 'int',
    production: 'prod',
    test: 'test',
}

/**
 * We use manual chunks to reduce the size of the final index.js file to improve startup
 * performance. Vendor libraries are separated for better caching, and utils are split
 * into a few logical chunks to keep sizes manageable without being overly aggressive.
 */
function manualChunks(id: string): string | undefined {
    // Separate large vendor dependencies into their own chunks for better caching
    if (id.includes('node_modules')) {
        // OpenLayers is very large, keep it separate
        if (id.includes('/ol/')) {
            return 'vendor-openlayers'
        }
        // Cesium is also very large
        if (id.includes('cesium')) {
            return 'vendor-cesium'
        }
        // Other heavy geospatial libraries
        if (id.includes('turf') || id.includes('proj4') || id.includes('geographiclib')) {
            return 'vendor-geo'
        }
        // Vue and related libraries
        if (id.includes('vue') || id.includes('vuex') || id.includes('pinia')) {
            return 'vendor-vue'
        }
        // All other vendors
        return 'vendor'
    }

    // Split utils into a few logical chunks
    if (id.includes('/src/utils/')) {
        // Heavy geospatial calculations with lots of OpenLayers geometry/style dependencies
        if (id.includes('geodesicManager') || id.includes('militaryGridProjection')) {
            return 'utils-geospatial'
        }

        // File format parsing utilities with parser libraries (KML, GPX, GeoJSON)
        if (id.includes('kmlUtils') || id.includes('gpxUtils') || id.includes('geoJsonUtils')) {
            return 'utils-formats'
        }

        // Everything else - core utilities, styles, layers, coordinates, etc.
        return 'utils-core'
    }
}

function generatePlugins(mode: ViteModes, isTesting: boolean = false): PluginOption[] {
    const plugins: PluginOption[] = []

    plugins.push(tsconfigPaths())

    if (process.env.USE_HTTPS) {
        plugins.push({
            ...basicSsl({
                /** Name of certification */
                name: 'localhost',
                /** Custom trust domains */
                domains: ['localhost', '192.168.*.*'],
                /** Custom certification directory */
                certDir: './devServer/cert',
            }),
            apply: 'serve',
        })
    }
    plugins.push(tailwindcss())
    plugins.push(
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) =>
                        tag === 'cesium-compass' || tag.startsWith('geoadmin-'),
                },
            },
        })
    )
    plugins.push(generateBuildInfo(stagings[mode], appVersion))

    // CesiumJS requires static files from the following 4 folders to be included in the build
    // https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/#install-with-npm
    plugins.push(
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
        })
    )

    plugins.push(ConditionalCompile() as PluginOption)

    if (!isTesting) {
        plugins.push(
            VitePWA({
                devOptions: {
                    enabled: true,
                    type: 'module',
                },

                strategies: 'injectManifest',
                srcDir: 'src',
                filename: 'service-workers.ts',
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
                injectRegister: false,
                injectManifest: {
                    // 5MB max (default is 2MB, some of our chunks and Cesium files are larger than that)
                    maximumFileSizeToCacheInBytes: 5 * 1000 * 1000,
                },

                pwaAssets: {
                    disabled: false,
                    config: true,
                },

                manifest: {
                    name: 'map.geo.admin.ch',
                    short_name: 'geoadmin',
                    description: 'Maps of Switzerland - Swiss Confederation - map.geo.admin.ch',
                    theme_color: '#ffffff',
                    icons: [
                        { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
                        { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
                    ],
                    related_applications: [
                        {
                            platform: 'play',
                            url: 'https://play.google.com/store/apps/details?id=ch.admin.swisstopo',
                        },
                        {
                            platform: 'itunes',
                            url: 'https://apps.apple.com/us/app/swisstopo/id1505986543',
                        },
                    ],
                },
            })
        )
    }
    // Vue dev tools only in development mode and if not testing
    // during testing the dev tools button can interfere with cypress clicks
    if (mode === 'development' && !isTesting) {
        plugins.push(vueDevTools())
    }

    return plugins
}

// https://vitejs.dev/config/
export default defineConfig((configEnv: ConfigEnv): UserConfig => {
    const { mode } = configEnv
    // "test" mode is essentially the "development" mode, but with a different plugin composition.
    // In test mode, we don't want the PWA plugin or the dev tools.
    // The app is also adding a couple of things to the "window" element when in test mode, so that Cypress can access it.
    const isTesting = mode === 'test'
    const definitiveMode: ViteModes = (isTesting ? 'development' : mode) as ViteModes
    return {
        base: './',
        build: {
            emptyOutDir: true,
            assetsDir: `${appVersion}/assets`,
            outDir: `./dist/${stagings[definitiveMode]}`,
            rollupOptions: {
                external: ['tailwindcss'],
                output: {
                    manualChunks,
                },
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    // Boostrap 5.3.x has too many deprecation warnings (10k+ on a single build)
                    // TODO: remove as soon as migration to TailwindCSS is done
                    quietDeps: true,
                    // @see https://github.com/vitejs/vite/issues/18164
                    verbose: true,
                    silenceDeprecations: ['import', 'color-functions'],
                },
            },
        },
        plugins: generatePlugins(definitiveMode, isTesting),
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                tests: fileURLToPath(new URL('./tests', import.meta.url)),
                cesium: normalizePath(cesiumFolder),
            },
        },
        // see https://vite.dev/config/#using-environment-variables-in-config
        define: {
            __APP_VERSION__: JSON.stringify(appVersion),
            __VITE_ENVIRONMENT__: JSON.stringify(definitiveMode),
            __CESIUM_STATIC_PATH__: JSON.stringify(cesiumStaticDir),
            __IS_TESTING_WITH_CYPRESS__: JSON.stringify(isTesting),
            // opting out explicitly of Option API to reduce the Vue bundle's size,
            // see https://vuejs.org/api/compile-time-flags#VUE_OPTIONS_API
            __VUE_OPTIONS_API__: 'false',
        },
        test: {
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            outputFile: 'tests/results/unit/unit-test-report.xml',
            silent: true,
            setupFiles: ['tests/setup-vitest.ts'],
            environment: 'jsdom',
        },
    }
})
