import type { EditableFeature, LayerFeature } from '@/api/features.api'
import type { ClickInfo } from '@/store/modules/map'

export function isNoFeatureSelected(clickInfo: ClickInfo | undefined, selectedFeatures: (LayerFeature | EditableFeature)[]): boolean {
    // when clicked on the map and no feature is selected we don't want to re run the identify features
    if (!clickInfo || clickInfo.coordinate.length !== 2 || selectedFeatures.length === 0) {
        return true
    }
    return false
}
