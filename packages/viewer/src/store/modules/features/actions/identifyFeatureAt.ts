import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

import { extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { SelectableFeature } from '@/api/features.api'
import type { FeaturesStore } from '@/store/modules/features/types/features'
import type { ActionDispatcher } from '@/store/types'

import { IdentifyMode } from '@/store/modules/features/types/IdentifyMode.enum'
import getFeatureCountForCoordinate from '@/store/modules/features/utils/getFeatureCountForCoordinate'
import identifyOnAllLayers from '@/store/modules/features/utils/identifyOnAllLayers'
import useI18nStore from '@/store/modules/i18n'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

/**
 * Identify features in layers at the given coordinate.
 *
 * @param layers List of layers for which we want to know if features are present at given
 *   coordinates
 * @param vectorFeatures List of existing vector features at given coordinate. That should be added
 *   to the selected features after identification has been run on the backend.
 * @param coordinate A point ([x,y]), or a rectangle described by a flat extent ([minX, maxX, minY,
 *   maxY]). 10 features will be requested for a point, 50 for a rectangle.
 * @param identifyMode The mode in which the identify should be run.
 * @param dispatcher
 */
export default async function identifyFeatureAt(
    this: FeaturesStore,
    layers: Layer[],
    coordinate: SingleCoordinate | FlatExtent,
    vectorFeatures: SelectableFeature<false>[],
    identifyMode: IdentifyMode,
    dispatcher: ActionDispatcher
): Promise<void>

/**
 * Identify features in layers at the given coordinate.
 *
 * @param layers List of layers for which we want to know if features are present at given
 *   coordinates
 * @param vectorFeatures List of existing vector features at given coordinate. That should be added
 *   to the selected features after identification has been run on the backend.
 * @param coordinate A point ([x,y]), or a rectangle described by a flat extent ([minX, maxX, minY,
 *   maxY]). 10 features will be requested for a point, 50 for a rectangle.
 * @param dispatcher
 */
export default async function identifyFeatureAt(
    this: FeaturesStore,
    layers: Layer[],
    coordinate: SingleCoordinate | FlatExtent,
    vectorFeatures: SelectableFeature<false>[],
    dispatcher: ActionDispatcher
): Promise<void>

export default async function identifyFeatureAt(
    this: FeaturesStore,
    layers: Layer[],
    coordinate: SingleCoordinate | FlatExtent,
    vectorFeatures: SelectableFeature<false>[],
    identifyModeOrDispatcher: IdentifyMode | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): Promise<void> {
    const dispatcher = dispatcherOrNothing ?? (identifyModeOrDispatcher as ActionDispatcher)
    const identifyMode = dispatcherOrNothing
        ? (identifyModeOrDispatcher as IdentifyMode)
        : IdentifyMode.New

    const featureCount = getFeatureCountForCoordinate(coordinate)

    const i18nStore = useI18nStore()
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    try {
        const backendFeatures = await identifyOnAllLayers({
            layers,
            coordinate,
            resolution: positionStore.resolution,
            mapExtent: extentUtils.flattenExtent(positionStore.extent),
            screenWidth: uiStore.width,
            screenHeight: uiStore.height,
            lang: i18nStore.lang,
            projection: positionStore.projection,
            featureCount,
        })
        const features = [...vectorFeatures, ...backendFeatures]
        if (features.length > 0) {
            if (identifyMode === IdentifyMode.New) {
                this.setSelectedFeatures(features, { paginationSize: featureCount }, dispatcher)
            } else if (identifyMode === IdentifyMode.Toggle) {
                // Toggle features: remove if already selected, add if not
                const oldFeatures = this.selectedLayerFeatures
                const newFeatures = features
                // Use feature.id for comparison
                const oldFeatureIds = new Set(oldFeatures.map((f) => f.id))
                const newFeatureIds = new Set(newFeatures.map((f) => f.id))
                // features that are present on the map AND in the identify-request result are meant to be toggled
                const deselectedFeatures = oldFeatures.filter((f) => newFeatureIds.has(f.id))
                const newlyAddedFeatures = newFeatures.filter((f) => !oldFeatureIds.has(f.id))
                if (
                    // Do not add new features if one existing feature was toggled off. Doing so would confuse
                    // the user, as it would look like the CTRL+Click had no effect (a new feature was added at
                    // the same spot as the one that was just toggled off)
                    deselectedFeatures.length > 0
                ) {
                    // Set features to all existing features minus those that were toggled off
                    this.setSelectedFeatures(
                        oldFeatures.filter((f) => !deselectedFeatures.includes(f)),
                        {
                            paginationSize: featureCount,
                        },
                        dispatcher
                    )
                } else if (newlyAddedFeatures.length > 0) {
                    // no feature was "deactivated" we can add the newly selected features
                    this.setSelectedFeatures(
                        newlyAddedFeatures.concat(oldFeatures),
                        {
                            paginationSize: featureCount,
                        },
                        dispatcher
                    )
                } else {
                    this.clearAllSelectedFeatures(dispatcher)
                }
            }
        } else {
            this.clearAllSelectedFeatures(dispatcher)
        }
    } catch (error) {
        log.error({
            title: 'Features store / identifyFeatureAt',
            titleColor: LogPreDefinedColor.Purple,
            messages: ['Error while identifying features', error],
        })
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error('Unknown error while identifying features', { cause: error })
        }
    }
}
