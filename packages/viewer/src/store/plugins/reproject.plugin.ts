import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { coordinatesUtils, extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { cloneDeep } from 'lodash'
import { reproject } from 'reproject'

import type { EditableFeature, LayerFeature, SelectableFeature } from '@/api/features.api'
import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import useFeaturesStore from '@/store/modules/features.store'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore, { PositionStoreActions } from '@/store/modules/position.store'
import { isEnumValue } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'reproject-layers-on-projection-change.plugin' }

let oldProjection: CoordinateSystem = DEFAULT_PROJECTION

function reprojectActiveLayersExtent(
    oldProjection: CoordinateSystem,
    newProjection: CoordinateSystem
): void {
    const layersStore = useLayersStore()
    const updatedLayers: Layer[] = layersStore.activeLayers
        .filter((layer) => layer.extent)
        .map((layer: Layer) => {
            const updatedLayer = cloneDeep(layer)
            updatedLayer.extent = extentUtils.projExtent(
                oldProjection,
                newProjection,
                updatedLayer.extent!
            )
            return updatedLayer
        })
    if (updatedLayers.length > 0) {
        layersStore.updateLayers(updatedLayers, dispatcher)
    }
}

function reprojectSelectedFeatures(
    oldProjection: CoordinateSystem,
    newProjection: CoordinateSystem
): void {
    const featureStore = useFeaturesStore()

    const reprojectedSelectedFeatures: SelectableFeature<boolean>[] = []
    featureStore.selectedFeatures.forEach((selectedFeature: SelectableFeature<boolean>) => {
        if (!selectedFeature.isEditable) {
            const layerFeature = cloneDeep(selectedFeature) as LayerFeature
            layerFeature.coordinates = coordinatesUtils.reprojectAndRound(
                oldProjection,
                newProjection,
                selectedFeature.coordinates
            )
            if (layerFeature.extent) {
                layerFeature.extent = extentUtils.projExtent(
                    oldProjection,
                    newProjection,
                    layerFeature.extent
                )
            }
            if (layerFeature.geometry) {
                layerFeature.geometry = reproject(
                    layerFeature.geometry,
                    oldProjection.epsg,
                    newProjection.epsg
                )
            }
            reprojectedSelectedFeatures.push(layerFeature)
        } else if (selectedFeature.isEditable) {
            const editableFeature = cloneDeep(selectedFeature) as EditableFeature
            editableFeature.coordinates = coordinatesUtils.reprojectAndRound(
                oldProjection,
                newProjection,
                selectedFeature.coordinates
            )
            reprojectedSelectedFeatures.push(editableFeature)
        } else {
            log.debug({
                title: 'Reproject pinia plugin',
                titleColor: LogPreDefinedColor.Yellow,
                messages: ['do not know what to do with this feature', selectedFeature],
            })
        }
    })
    if (reprojectedSelectedFeatures.length > 0) {
        featureStore.setSelectedFeatures(
            {
                features: reprojectedSelectedFeatures,
            },
            dispatcher
        )
    }
}

/**
 * Plugin that will reproject selected features and layers' extent after it detects that the
 * projection was changed
 */
const reprojectPlugin: PiniaPlugin = (context: PiniaPluginContext): void => {
    const positionStore = usePositionStore()

    const { store } = context

    store.$onAction(({ after, name }) => {
        if (isEnumValue<PositionStoreActions>(PositionStoreActions.SetProjection, name)) {
            oldProjection = positionStore.projection
        }
        after(() => {
            if (isEnumValue<PositionStoreActions>(PositionStoreActions.SetProjection, name)) {
                const newProjection = positionStore.projection
                log.debug({
                    title: 'Reproject pinia plugin',
                    titleColor: LogPreDefinedColor.Yellow,
                    messages: [
                        `starting to reproject the app from ${oldProjection.epsg} to ${newProjection.epsg}`,
                    ],
                })
                if (oldProjection.epsg === newProjection.epsg) {
                    log.info({
                        title: 'Reproject pinia plugin',
                        titleColor: LogPreDefinedColor.Yellow,
                        messages: [
                            `The old projection ${oldProjection.epsg} and new projection ${newProjection.epsg} are the same, no need to reproject the layer extent`,
                        ],
                    })
                    return
                }
                reprojectSelectedFeatures(oldProjection, newProjection)
                reprojectActiveLayersExtent(oldProjection, newProjection)
            }
        })
    })
}

export default reprojectPlugin
