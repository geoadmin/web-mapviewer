import type { EditableFeature, LayerFeature, SelectableFeature } from '@/api/features.api'
import type { FeaturesForLayer } from '@/store/modules/features'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import { sendFeatureInformationToIFrameParent } from '@/api/iframePostMessageEvent.api'
import { DEFAULT_FEATURE_COUNT_SINGLE_POINT } from '@/config/map.config'
import useProfileStore from '@/store/modules/profile.store'

/**
 * Tells the map to highlight a list of features (place a round marker at their location). Those
 * features are currently shown by the tooltip. If in drawing mode, this function tells the store
 * which features are selected (it does not select the features by itself)
 *
 * @param payload
 * @param payload.features A list of feature we want to highlight/select on the map
 * @param payload.paginationSize How many features were requested, will help set if a layer can have
 *   more data or not (if its feature count is a multiple of paginationSize)
 * @param dispatcher
 */
export default function setSelectedFeatures(
    this: FeaturesStore,
    payload: { features: SelectableFeature<boolean>[]; paginationSize?: number },
    dispatcher: ActionDispatcher
) {
    const { features, paginationSize = DEFAULT_FEATURE_COUNT_SINGLE_POINT } = payload
    // clearing up any relevant selected features stuff
    if (this.highlightedFeatureId) {
        this.highlightedFeatureId = undefined
    }
    const profileStore = useProfileStore()
    if (profileStore.feature) {
        profileStore.setProfileFeature({ feature: undefined }, dispatcher)
    }
    const layerFeaturesByLayerId: FeaturesForLayer[] = []
    let drawingFeatures: EditableFeature[] = []
    if (Array.isArray(features)) {
        const layerFeatures = features.filter((feature) => !feature.isEditable) as LayerFeature[]
        drawingFeatures = features.filter((feature) => feature.isEditable) as EditableFeature[]
        layerFeatures.forEach((feature) => {
            if (
                !layerFeaturesByLayerId.some(
                    (featureForLayer) => featureForLayer.layerId === feature.layer.id
                )
            ) {
                layerFeaturesByLayerId.push({
                    layerId: feature.layer.id,
                    features: [],
                    featureCountForMoreData: paginationSize,
                })
            }
            const featureForLayer = layerFeaturesByLayerId.find(
                (featureForLayer) => featureForLayer.layerId === feature.layer.id
            )
            if (featureForLayer) {
                featureForLayer.features.push(feature)
            }
        })
        layerFeaturesByLayerId.forEach((layerFeatures) => {
            // if less feature than the pagination size are present, we can already tell there won't be more data to load
            layerFeatures.featureCountForMoreData =
                layerFeatures.features.length % paginationSize === 0 ? paginationSize : 0
        })

        // as described by this example on our documentation: https://codepen.io/geoadmin/pen/yOBzqM?editors=0010
        // our app should send a message (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
        // when a feature is selected while embedded, so that the parent can get the selected feature(s) ID(s)
        sendFeatureInformationToIFrameParent(layerFeatures)
    }
    this.selectedFeaturesByLayerId = layerFeaturesByLayerId
    this.selectedEditableFeatures = [...drawingFeatures]
}
