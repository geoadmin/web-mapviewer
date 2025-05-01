import { getPointResolution } from 'ol/proj'
import { computed } from 'vue'
import { useStore } from 'vuex'

import {
    PRINT_DEFAULT_DPI,
    PRINT_DIMENSIONS,
    PRINT_MARGIN_IN_MILLIMETERS,
} from '@/config/print.config'

const inchToMillimeter = 25.4

export default function usePrintSizedView() {
    const store = useStore()

    const printLayout = computed(() => store.state.print.config.layout ?? 'A4_L')
    const layoutIdentifier = computed(() => printLayout.value.replace('_L', '').replace('_P', ''))
    const printDPI = computed(() => store.state.print.config.dpi ?? PRINT_DEFAULT_DPI)
    const isLayerLandscape = computed(() => printLayout.value.endsWith('_L'))

    const mapCenter = computed(() => store.state.position.center)
    const mapResolution = computed(() => store.getters.resolution)
    const currentProjection = computed(() => store.state.position.projection)

    const layoutDimensions = computed(() => {
        const dimensions = PRINT_DIMENSIONS[layoutIdentifier.value]
        if (!isLayerLandscape.value) {
            return dimensions.toReversed()
        }
        return dimensions
    })
    const printContainerSize = computed(() => {
        if (!layoutDimensions.value) {
            return null
        }
        return {
            width: Math.round((layoutDimensions.value[0] * printDPI.value) / inchToMillimeter),
            height: Math.round((layoutDimensions.value[1] * printDPI.value) / inchToMillimeter),
        }
    })
    const printContainerStyle = computed(() => {
        if (!printContainerSize.value) {
            return null
        }
        return {
            width: `${printContainerSize.value.width}px`,
            height: `${printContainerSize.value.height}px`,
            padding: `${(PRINT_MARGIN_IN_MILLIMETERS * printDPI.value) / inchToMillimeter}px`,
        }
    })

    const printResolution = computed(
        () =>
            mapResolution.value /
            getPointResolution(
                currentProjection.value.epsg,
                printDPI.value / inchToMillimeter,
                mapCenter.value
            )
    )

    return {
        printLayout,
        printLayoutDimension: layoutDimensions,
        printDPI,
        printContainerSize,
        printContainerStyle,
        printResolution,
    }
}
