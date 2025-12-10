import { ref } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import useCesiumStore from '@/store/modules/cesium'
import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import useGeolocationStore from '@/store/modules/geolocation'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import usePrintStore from '@/store/modules/print'
import useProfileStore from '@/store/modules/profile'
import useSearchStore from '@/store/modules/search'
import useShareStore from '@/store/modules/share'
import useTopicsStore from '@/store/modules/topics'
import useUIStore from '@/store/modules/ui'
import { FeatureInfoPositions } from '@/store/modules/ui/types/featureInfoPositions.enum'

/**
 * Composable for resetting the application to its default state while preserving language, topic,
 * and background layer.
 *
 * This provides a centralized way to reset the app without requiring a full page reload, using
 * Pinia store resets and the store-to-URL sync mechanism.
 */
export function useAppReset() {
    const isResetting = ref(false)

    const cesiumStore = useCesiumStore()
    const drawingStore = useDrawingStore()
    const featuresStore = useFeaturesStore()
    const geolocationStore = useGeolocationStore()
    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()
    const mapStore = useMapStore()
    const positionStore = usePositionStore()
    const printStore = usePrintStore()
    const profileStore = useProfileStore()
    const searchStore = useSearchStore()
    const shareStore = useShareStore()
    const topicsStore = useTopicsStore()
    const uiStore = useUIStore()

    /**
     * Resets the application to its default state.
     *
     * What gets preserved:
     *
     * - Current language
     * - Current topic
     * - Current topic's default layers
     * - Background layer (topic's default)
     *
     * What gets reset:
     *
     * - User-added layers
     * - Drawing features
     * - Selected features
     * - Map interactions (clicks, pins, popups)
     * - Position/camera
     * - Print settings
     * - Profile data
     * - Search results
     * - Share links
     * - UI state (compare slider, time slider, feature info)
     *
     * @param dispatcher - The action dispatcher for tracking the source of store mutations
     */
    function resetApp(dispatcher: ActionDispatcher) {
        // Show loading indicator
        isResetting.value = true

        // Preserve the values we want to keep
        const langToKeep = i18nStore.lang
        const topicToKeep = topicsStore.current
        const defaultBackgroundLayerId =
            topicsStore.currentTopic?.defaultBackgroundLayer?.id ??
            layersStore.currentBackgroundLayerId

        // Clear user-added data through store actions (but NOT layers - we'll reset those via topic change)
        drawingStore.clearDrawingFeatures(dispatcher)
        featuresStore.clearAllSelectedFeatures(dispatcher)
        mapStore.clearClick(dispatcher)
        mapStore.clearPinnedLocation(dispatcher)
        mapStore.clearPreviewPinnedLocation(dispatcher)
        mapStore.clearLocationPopupCoordinates(dispatcher)
        shareStore.clearShortLinks(dispatcher)

        // Reset stores that don't contain critical config or viewport dimensions
        cesiumStore.$reset()
        geolocationStore.$reset()
        positionStore.$reset()
        printStore.$reset()
        profileStore.$reset()
        searchStore.$reset()

        uiStore.setCompareSliderActive(false, dispatcher)
        uiStore.setTimeSliderActive(false, dispatcher)
        uiStore.setFeatureInfoPosition(FeatureInfoPositions.None, dispatcher)

        // Restore preserved values - this will trigger URL sync through store plugins
        // Language is preserved
        if (i18nStore.lang !== langToKeep) {
            i18nStore.setLang(langToKeep, dispatcher)
        }

        // Changing topic will automatically:
        // 1. Load the topic's default layers (layersToActivate)
        // 2. Set the default background layer
        // This effectively resets the layers to the topic's defaults
        if (topicsStore.current !== topicToKeep) {
            topicsStore.changeTopic(topicToKeep, dispatcher)
        } else {
            // If we're already on the target topic, we need to manually reload it with default layers
            topicsStore.loadTopic({ changeLayers: true }, dispatcher)
        }

        // Ensure the correct background layer is set (in case it's different from topic default)
        if (layersStore.currentBackgroundLayerId !== defaultBackgroundLayerId) {
            layersStore.setBackground(defaultBackgroundLayerId, dispatcher)
        }

        // Hide loading indicator after a short delay to ensure stores have updated
        setTimeout(() => {
            isResetting.value = false
        }, 500)
    }

    return {
        isResetting,
        resetApp,
    }
}
