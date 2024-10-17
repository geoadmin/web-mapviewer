import proj4 from 'proj4'

import EditableFeature from '@/api/features/EditableFeature.class'
import LayerFeature from '@/api/features/LayerFeature.class'
import { projExtent } from '@/utils/extentUtils'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'reproject-selected-features-on-projection-change.plugin' }

let oldProjection = null
/**
 * Plugin that will reproject selected features after it detects that the projection was changed
 *
 * @param {Vuex.Store} store
 */
const reprojectSelectedFeaturesOnProjectionChangePlugin = (store) => {
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
                    if (coordinates.length === 2 && typeof coordinates[0] === 'number') {
                        return proj4(oldProjection.epsg, newProjection.epsg, coordinates).map(
                            (value) => newProjection.roundCoordinateValue(value)
                        )
                    }
                    return coordinates.map((coordinate) => reprojectCoordinates(coordinate))
                }

                // re-projecting selected features with the new projection
                const reprojectedSelectedFeatures = []
                store.getters.selectedFeatures.forEach((selectedFeature) => {
                    if (selectedFeature instanceof LayerFeature) {
                        reprojectedSelectedFeatures.push(
                            new LayerFeature({
                                layer: selectedFeature.layer,
                                id: selectedFeature.id,
                                name: selectedFeature.name,
                                data: selectedFeature.data,
                                coordinates: reprojectCoordinates(selectedFeature.coordinates),
                                extent: projExtent(
                                    oldProjection,
                                    newProjection,
                                    selectedFeature.extent
                                ),
                                geometry: selectedFeature.geometry,
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
            }
        },
    })
}

export default reprojectSelectedFeaturesOnProjectionChangePlugin
