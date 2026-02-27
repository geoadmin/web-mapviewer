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
