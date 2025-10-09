import type { Layer } from "@swissgeo/layers"

export default function useBackgroundSelectorProps() {
    return {
        backgroundLayers: {
            type: Array as () => Array<Layer | undefined>,
            default: () => [],
        },
        currentBackgroundLayer: {
            type: Object as () => Layer | undefined,
            default: null,
        },
    }
}