/// <reference types="vite/client" />

import type { Staging } from '@swissgeo/staging-config'

interface ImportMetaEnv {
    readonly DEV: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare global {
    // stuff declared directly in the vite.config.mts (see define block)
    // see https://vite.dev/config/shared-options.html#define
    declare const __VITE_ENVIRONMENT__: Staging | undefined
    declare const __APP_VERSION__: string
    declare const __CESIUM_STATIC_PATH__: string
    declare const __IS_TESTING_WITH_CYPRESS__: boolean

    namespace NodeJS {
        /** All the flags used in our package.json scripts/target to change how the build behaves */
        interface ProcessEnv {
            /** App version from the package.json file */
            APP_VERSION: string
            /** Tells if the build is a test build (Cypress, Unit tests) */
            TEST: boolean
            /** Should this build/serve use HTTPS */
            USE_HTTPS: boolean
        }
    }
}
