import type { Layer } from '@swissgeo/layers'

import {
    allCoordinateSystems,
    CoordinateSystem,
    CustomCoordinateSystem,
    StandardCoordinateSystem,
} from '@swissgeo/coordinates'
import { coordinatesUtils, extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'
import { cloneDeep } from 'lodash'
import proj4 from 'proj4'
import { reproject } from 'reproject'

import type { EditableFeature, LayerFeature, SelectableFeature } from '@/api/features.api'
import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'

export default function setProjection(
    this: PositionStore,
    projection: CoordinateSystem | number | string,
    dispatcher: ActionDispatcher
): void {
    const oldProjection: CoordinateSystem = this.projection
    let matchingProjection: CoordinateSystem | undefined
    if (projection instanceof CoordinateSystem) {
        matchingProjection = projection
    } else if (typeof projection === 'number' || isNumber(projection)) {
        matchingProjection = allCoordinateSystems.find(
            (coordinateSystem) => coordinateSystem.epsgNumber === projection
        )
    } else {
        matchingProjection = allCoordinateSystems.find(
            (coordinateSystem) =>
                coordinateSystem.epsg === projection ||
                coordinateSystem.epsgNumber === parseInt(projection)
        )
    }
    if (matchingProjection) {
        if (matchingProjection.epsg === this.projection.epsg) {
            log.debug({
                title: 'Position store / setProjection',
                titleColor: LogPreDefinedColor.Red,
                messages: [
                    'Projection already set, ignoring',
                    this.projection,
                    matchingProjection,
                    dispatcher,
                ],
            })
            return
        }
        // reprojecting the center of the map
        this.center = proj4(oldProjection.epsg, matchingProjection.epsg, this.center)
        // adapting the zoom level (if needed)
        if (
            oldProjection instanceof StandardCoordinateSystem &&
            matchingProjection instanceof CustomCoordinateSystem
        ) {
            this.zoom = matchingProjection.transformStandardZoomLevelToCustom(this.zoom)
        } else if (
            oldProjection instanceof CustomCoordinateSystem &&
            matchingProjection instanceof StandardCoordinateSystem
        ) {
            this.zoom = oldProjection.transformCustomZoomLevelToStandard(this.zoom)
        }
        if (
            oldProjection instanceof CustomCoordinateSystem &&
            matchingProjection instanceof CustomCoordinateSystem &&
            oldProjection.epsg !== matchingProjection.epsg
        ) {
            // we have to revert the old projection zoom level to standard, and then transform it to the new projection custom zoom level
            this.zoom = oldProjection.transformCustomZoomLevelToStandard(
                matchingProjection.transformStandardZoomLevelToCustom(this.zoom)
            )
        }

        if (this.crossHairPosition) {
            this.crossHairPosition = proj4(
                oldProjection.epsg,
                matchingProjection.epsg,
                this.crossHairPosition
            )
        }

        this.projection = matchingProjection
    } else {
        log.error({
            title: 'Position store / setProjection',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Unsupported projection', projection, dispatcher],
        })
    }
    reprojectLayersFeatures.call(this, oldProjection, dispatcher)
}

function reprojectLayersFeatures(this: PositionStore, oldProjection: CoordinateSystem, dispatcher: ActionDispatcher): void {
    const newProjection = this.projection
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
    reprojectSelectedFeatures(oldProjection, newProjection, dispatcher)
    reprojectActiveLayersExtent(oldProjection, newProjection, dispatcher)
}

function reprojectActiveLayersExtent(
    oldProjection: CoordinateSystem,
    newProjection: CoordinateSystem, dispatcher: ActionDispatcher
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
    newProjection: CoordinateSystem, dispatcher: ActionDispatcher
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
        featureStore.setSelectedFeatures(reprojectedSelectedFeatures, dispatcher)
    }
}