/// <reference types="vite/client" />

// see https://vite.dev/guide/env-and-mode#intellisense-for-typescript

interface ImportMetaEnv {
    readonly VITE_API_SERVICE_ALTI_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
