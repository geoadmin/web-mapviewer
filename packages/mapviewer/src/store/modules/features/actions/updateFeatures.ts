import type { LayerFeature } from '@swissgeo/api'
import type { GeoAdminLayer } from '@swissgeo/layers'

import { featuresAPI } from '@swissgeo/api'
import { extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { FeaturesStore } from '@/store/modules/features/types'
import type { ActionDispatcher } from '@/store/types'

import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

export default function updateFeatures(this: FeaturesStore, dispatcher: ActionDispatcher) {
    const featuresPromises: Promise<LayerFeature>[] = []

    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()
    const mapStore = useMapStore()
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    const layersConfig: GeoAdminLayer[] = layersStore.config as GeoAdminLayer[]

    this.selectedLayerFeatures.forEach((feature) => {
        // we avoid requesting the drawings and external layers, they're not handled here
        const currentFeatureLayer: GeoAdminLayer | undefined = layersConfig.find(
            (layer) => layer.id === feature.layer.id
        )
        if (currentFeatureLayer) {
            featuresPromises.push(
                featuresAPI.getFeature(currentFeatureLayer, feature.id, positionStore.projection, {
                    lang: i18nStore.lang,
                    screenWidth: uiStore.width,
                    screenHeight: uiStore.height,
                    mapExtent: extentUtils.flattenExtent(positionStore.extent),
                    coordinate: mapStore.clickInfo?.coordinate,
                })
            )
        }
    })
    if (featuresPromises.length > 0) {
        Promise.allSettled(featuresPromises)
            .then((responses) => {
                const features: LayerFeature[] = responses
                    .filter((response) => response.status === 'fulfilled')
                    .map((response) => response.value)

                // Updating existing features with the newly fetched content
                features.forEach((feature) => {
                    const featuresWithMatchingLayer = this.selectedFeaturesByLayerId.find(
                        (featureForLayer) => featureForLayer.layerId === feature.layer.id
                    )
                    if (featuresWithMatchingLayer) {
                        featuresWithMatchingLayer.features = featuresWithMatchingLayer.features.map(
                            (existingFeature) => {
                                if (existingFeature.id === feature.id) {
                                    return feature
                                }
                                return existingFeature
                            }
                        )
                    }
                })
            })
            .catch((error) => {
                if (error instanceof Error) {
                    log.error({
                        title: 'Feature store',
                        titleColor: LogPreDefinedColor.Purple,
                        messages: [
                            'Error while attempting to update already selected features',
                            error,
                        ],
                    })
                }
            })
    }
}
