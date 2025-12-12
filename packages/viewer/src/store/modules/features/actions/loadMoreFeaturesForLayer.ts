import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoAdminLayer } from '@swissgeo/layers'

import { extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { FeaturesStore } from '@/store/modules/features/types'
import type { ActionDispatcher } from '@/store/types'

import { identifyOnGeomAdminLayer } from '@/api/features.api'
import useI18nStore from '@/store/modules/i18n'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

/**
 * Loads (if possible) more features for the given layer.
 *
 * Only GeoAdmin layers support this for the time being. For external layer, as we use
 * GetFeatureInfo from WMS, there's no such capabilities (we would have to switch to a WFS approach
 * to gain access to similar things).
 */
export default function loadMoreFeaturesForLayer(
    this: FeaturesStore,
    layer: GeoAdminLayer,
    coordinate: SingleCoordinate | FlatExtent,
    dispatcher: ActionDispatcher
) {
    const featuresAlreadyLoaded = this.selectedFeaturesByLayerId.find(
        (featureForLayer) => featureForLayer.layerId === layer.id
    )
    if (featuresAlreadyLoaded && featuresAlreadyLoaded.featureCountForMoreData > 0) {
        const i18nStore = useI18nStore()
        const positionStore = usePositionStore()
        const uiStore = useUIStore()

        identifyOnGeomAdminLayer({
            layer,
            coordinate,
            resolution: positionStore.resolution,
            mapExtent: extentUtils.flattenExtent(positionStore.extent),
            screenWidth: uiStore.width,
            screenHeight: uiStore.height,
            lang: i18nStore.lang,
            projection: positionStore.projection,
            offset: featuresAlreadyLoaded.features.length,
            featureCount: featuresAlreadyLoaded.featureCountForMoreData,
        })
            .then((moreFeatures) => {
                const featuresForLayer = this.selectedFeaturesByLayerId.find(
                    (featureForLayer) => featureForLayer.layerId === layer.id
                )
                if (!featuresForLayer) {
                    return
                }
                const canLoadMore =
                    moreFeatures.length > 0 &&
                    moreFeatures.length % featuresAlreadyLoaded.featureCountForMoreData === 0

                featuresForLayer.features.push(...moreFeatures)
                featuresForLayer.featureCountForMoreData = canLoadMore
                    ? featuresAlreadyLoaded.featureCountForMoreData
                    : 0
            })
            .catch((error) => {
                log.error({
                    title: 'Feature store / loadMoreFeaturesForLayer',
                    titleColor: LogPreDefinedColor.Purple,
                    messages: ['Error while identifying features', error],
                })
            })
    } else {
        log.error({
            title: 'Feature store / loadMoreFeaturesForLayer',
            titleColor: LogPreDefinedColor.Purple,
            messages: [
                'No more features can be loaded for layer',
                layer,
                'at coordinate',
                coordinate,
            ],
        })
    }
}
