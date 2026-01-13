/**
 * This composable provides lazy-loading for the Cesium library to reduce initial bundle size and
 * memory usage for 2D-only tests.
 */

import type * as CesiumTypes from 'cesium'
import type { Ref } from 'vue'

import { ref } from 'vue'

// Cache the loaded Cesium module to avoid re-importing
let cesiumModule: typeof CesiumTypes | null = null
let cesiumLoadingPromise: Promise<typeof CesiumTypes> | null = null

/**
 * Lazy-loads the Cesium library and returns it. Uses a cache to ensure the library is only loaded
 * once per session.
 *
 * @returns Promise that resolves to the Cesium module
 */
export async function loadCesium(): Promise<typeof CesiumTypes> {
    // Return cached module if already loaded
    if (cesiumModule) {
        return cesiumModule
    }

    // Return existing promise if currently loading (prevents duplicate imports)
    if (cesiumLoadingPromise) {
        return cesiumLoadingPromise
    }

    // Start loading Cesium
    cesiumLoadingPromise = import('cesium').then((module) => {
        cesiumModule = module
        cesiumLoadingPromise = null
        return module
    })

    return cesiumLoadingPromise
}

/**
 * Composable that provides Cesium lazy-loading functionality with reactive state.
 *
 * @returns Object with loadCesium function and loading state
 */
export function useCesium() {
    const isLoading: Ref<boolean> = ref(false)
    const isLoaded: Ref<boolean> = ref(!!cesiumModule)

    // Loads Cesium and updates reactive state
    async function load(): Promise<typeof CesiumTypes> {
        if (cesiumModule) {
            return cesiumModule
        }

        isLoading.value = true
        try {
            const module = await loadCesium()
            isLoaded.value = true
            return module
        } finally {
            isLoading.value = false
        }
    }

    return {
        loadCesium: load,
        isLoading,
        isLoaded,
    }
}

/**
 * Type-only exports for use in component type annotations. These don't cause the actual Cesium
 * library to be imported at build time.
 */
export type { CesiumTypes }
