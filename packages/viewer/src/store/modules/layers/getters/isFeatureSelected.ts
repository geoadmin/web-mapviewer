import type { LayersStore } from '@/store/modules/layers/types/layers'
import type { ClickInfo } from '@/store/modules/map'

import useFeaturesStore from '@/store/modules/features'

export function isFeatureSelected(this: LayersStore): (clickInfo?: ClickInfo) => boolean {
    return (clickInfo?: ClickInfo): boolean => {
        const featuresStore = useFeaturesStore()
        const selectedFeatures = featuresStore.selectedFeatures
        // when clicked on the map and no feature is selected we don't want to re run the identify features
        return clickInfo?.coordinate.length === 2 && selectedFeatures.length > 0
    }
}
