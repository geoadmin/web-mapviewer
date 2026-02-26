import type { SelectableFeature } from '@swissgeo/api'
import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

import { coordinatesUtils, extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { cloneDeep } from 'lodash'
import { reproject } from 'reproject'

import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'

export function reprojectLayersFeatures(
    projection: CoordinateSystem,
    oldProjection: CoordinateSystem,
    dispatcher: ActionDispatcher
): void {
    log.debug({
        title: 'Position store / reproject',
        titleColor: LogPreDefinedColor.Yellow,
        messages: [
            `starting to reproject the app from ${oldProjection.epsg} to ${projection.epsg}`,
        ],
    })
    if (oldProjection.epsg === projection.epsg) {
        log.info({
            title: 'Position store / reproject',
            titleColor: LogPreDefinedColor.Yellow,
            messages: [
                `The old projection ${oldProjection.epsg} and new projection ${projection.epsg} are the same, no need to reproject the layer extent`,
            ],
        })
        return
    }
    reprojectSelectedFeatures(oldProjection, projection, dispatcher)
    reprojectActiveLayersExtent(oldProjection, projection, dispatcher)
}

function reprojectActiveLayersExtent(
    oldProjection: CoordinateSystem,
    newProjection: CoordinateSystem,
    dispatcher: ActionDispatcher
): void {
    const layersStore = useLayersStore()
    const updatedLayers = layersStore.activeLayers
        .filter((layer) => layer.extent)
        .map((layer) => {
            const updatedLayer = cloneDeep(layer)
            updatedLayer.extent = extentUtils.projExtent(
                oldProjection,
                newProjection,
                updatedLayer.extent
            )
            return updatedLayer
        }) as Layer[]
    if (updatedLayers.length > 0) {
        layersStore.updateLayers(updatedLayers, dispatcher)
    }
}

function reprojectSelectedFeatures(
    oldProjection: CoordinateSystem,
    newProjection: CoordinateSystem,
    dispatcher: ActionDispatcher
): void {
    const featureStore = useFeaturesStore()

    const reprojectedSelectedFeatures: SelectableFeature<boolean>[] = []
    featureStore.selectedFeatures.forEach((selectedFeature: SelectableFeature<boolean>) => {
        if (!selectedFeature.isEditable) {
            const layerFeature = cloneDeep(selectedFeature)
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
            const editableFeature = cloneDeep(selectedFeature)
            editableFeature.coordinates = coordinatesUtils.reprojectAndRound(
                oldProjection,
                newProjection,
                selectedFeature.coordinates
            )
            reprojectedSelectedFeatures.push(editableFeature)
        } else {
            log.debug({
                title: 'Position store / reproject',
                titleColor: LogPreDefinedColor.Yellow,
                messages: ['do not know what to do with this feature', selectedFeature],
            })
        }
    })
    if (reprojectedSelectedFeatures.length > 0) {
        featureStore.setSelectedFeatures(reprojectedSelectedFeatures, dispatcher)
    }
}
