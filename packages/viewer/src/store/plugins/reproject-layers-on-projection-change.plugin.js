import { extentUtils } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import proj4 from 'proj4'

import EditableFeature from '@/api/features/EditableFeature.class'
import LayerFeature from '@/api/features/LayerFeature.class'

const dispatcher = { dispatcher: 'reproject-layers-on-projection-change.plugin' }

let oldProjection = null
/**
 * Plugin that will reproject selected features and layers after it detects that the projection was
 * changed
 *
 * @param {Vuex.Store} store
 */
const reprojectLayersOnProjectionChangePlugin = (store) => {
    store.subscribeAction({
        before: (action, state) => {
            if (action.type === 'setProjection') {
                oldProjection = state.position.projection
            }
        },
        after: (action, state) => {
            if (action.type === 'setProjection') {
                const newProjection = state.position.projection

                log.debug(
                    `starting to reproject the app from ${oldProjection.epsg} to ${newProjection.epsg}`
                )
                const reprojectCoordinates = (coordinates = []) => {
                    if (isDepthOne(coordinates) && typeof coordinates[0] === 'number') {
                        return proj4(oldProjection.epsg, newProjection.epsg, coordinates).map(
                            (value) => newProjection.roundCoordinateValue(value)
                        )
                    }
                    return coordinates.map((coordinate) => reprojectCoordinates(coordinate))
                }
                const reprojectGeometry = (geometry) => {
                    if (!geometry || typeof geometry !== 'object') {
                        return geometry
                    }

                    const reprojectedGeometry = { ...geometry }

                    if (Array.isArray(geometry.coordinates)) {
                        reprojectedGeometry.coordinates = reprojectCoordinates(geometry.coordinates)
                    }

                    return reprojectedGeometry
                }

                // re-projecting selected features with the new projection
                const reprojectedSelectedFeatures = []
                store.getters.selectedFeatures.forEach((selectedFeature) => {
                    if (selectedFeature instanceof LayerFeature) {
                        reprojectedSelectedFeatures.push(
                            new LayerFeature({
                                layer: selectedFeature.layer,
                                id: selectedFeature.id,
                                title: selectedFeature.title,
                                data: selectedFeature.data,
                                coordinates: reprojectCoordinates(selectedFeature.coordinates),
                                extent: extentUtils.projExtent(
                                    oldProjection,
                                    newProjection,
                                    selectedFeature.extent
                                ),
                                geometry: reprojectGeometry(selectedFeature.geometry),
                            })
                        )
                    } else if (selectedFeature.isEditable) {
                        reprojectedSelectedFeatures.push(
                            new EditableFeature({
                                ...selectedFeature,
                                coordinates: reprojectCoordinates(selectedFeature.coordinates),
                            })
                        )
                    } else {
                        log.debug('do not know what to do with this feature', selectedFeature)
                    }
                })
                if (reprojectedSelectedFeatures.length > 0) {
                    store.dispatch('setSelectedFeatures', {
                        features: reprojectedSelectedFeatures,
                        ...dispatcher,
                    })
                }

                reprojectLayerExtent(oldProjection, newProjection, state.layers.activeLayers, store)
            }
        },
    })
}

/**
 * Reproject the extent of the active layers after it detects that the projection was changed
 *
 * @param {Object} oldProjection - The old projection object
 * @param {Object} newProjection - The new projection object
 * @param {Array} activeLayers - The active layers array
 * @param {Vuex.Store} store - The Vuex store instance
 */
function reprojectLayerExtent(oldProjection, newProjection, activeLayers, store) {
    log.debug(
        `starting to reproject the layer extent from ${oldProjection.epsg} to ${newProjection.epsg}`
    )
    if (oldProjection.epsg === newProjection.epsg) {
        log.debug(
            `The old projection ${oldProjection.epsg} and new projection ${newProjection.epsg} are the same, no need to reproject the layer extent`
        )
        return
    }
    // re-projecting the extent of the active layers with the new projection
    const updatedLayers = activeLayers.reduce((layers, currentLayer) => {
        if (!currentLayer.extent) {
            return layers
        }
        const newExtent = extentUtils.projExtent(
            oldProjection,
            newProjection,
            extentUtils.flattenExtent(currentLayer.extent)
        )
        layers.push({
            ...currentLayer,
            extent: newExtent,
        })
        return layers
    }, [])
    if (updatedLayers.length > 0) {
        store.dispatch('updateLayers', {
            layers: updatedLayers,
            ...dispatcher,
        })
    }
}

/**
 * Verify if the parameter is an array of depth one
 *
 * @param {Array | any} arr
 * @returns {boolean} If the arr is an array of depth one
 */
function isDepthOne(arr) {
    if (!Array.isArray(arr)) {
        return false
    }
    return arr.every((item) => !Array.isArray(item))
}

export default reprojectLayersOnProjectionChangePlugin
