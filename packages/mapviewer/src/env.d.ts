/// <reference types="vite/client" />
import type { Geometry } from 'geojson'
import type { Pinia } from 'pinia'
import type { Router, RouterHistory } from 'vue-router'

// stuff declared directly in the vite.config.mts (see define block)
// see https://vite.dev/config/shared-options.html#define
declare const __VITE_ENVIRONMENT__: 'development' | 'integration' | 'production'
declare const __APP_VERSION__: string
declare const __CESIUM_STATIC_PATH__: string
declare const __IS_TESTING_WITH_CYPRESS__: boolean

interface ImportMetaEnv {
    // stuff from .env.{staging} files
    readonly VITE_API_BASE_URL: string
    readonly VITE_API_SERVICE_ALTI_BASE_URL: string
    readonly VITE_API_SERVICE_SEARCH_BASE_URL: string
    readonly VITE_DATA_BASE_URL: string
    readonly VITE_WMTS_BASE_URL: string
    readonly VITE_WMS_BASE_URL: string
    readonly VITE_API_SERVICES_BASE_URL: string
    readonly VITE_API_SERVICE_KML_BASE_URL: string
    readonly VITE_APP_API_SERVICE_SHORTLINK_BASE_URL: string
    readonly VITE_APP_3D_TILES_BASE_URL: string
    readonly VITE_APP_VECTORTILES_BASE_URL: string
    readonly VITE_APP_SERVICE_PROXY_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare global {
    /** All the things we expose to Cypress */
    interface Window {
        store: Pinia
        vueRouterHistory: RouterHistory
        vueRouter: Router
    }
}

declare module '*.png' {
    const src: string
    export default src
}

// TODO remove after https://github.com/geoblocks/mapfishprint/pull/45 has been merged and released
declare module '@geoblocks/mapfishprint' {
    /** Either icons or classes should be defined */
    interface MFPLegend {
        name: string
        dpi?: number
        icons?: string[]
        classes?: MFPLegend[]
    }

    interface MFPAttributes {
        legend: MFPLegend
        copyright?: string
        url?: string
        qrimage: string
        printDate: string
    }

    interface MFPSpec {
        outputFilename?: string
    }
}

declare module 'reproject' {
    function reproject(
        input: Geometry,
        from: string,
        to: string,
        projs?: Record<string, string>
    ): Geometry
}
