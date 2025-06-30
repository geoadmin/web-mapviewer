/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />

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

declare module 'virtual:pwa-register/vue' {
    import type { RegisterSWOptions } from 'vite-plugin-pwa/types'
    import type { Ref } from 'vue'

    export type { RegisterSWOptions }

    export function useRegisterSW(options?: RegisterSWOptions): {
        needRefresh: Ref<boolean>
        offlineReady: Ref<boolean>
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>
    }
}
