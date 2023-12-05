import proj4 from 'proj4'

import { EditableFeature, LayerFeature } from '@/api/features.api'
import { projExtent } from '@/utils/coordinates/coordinateUtils'
import log from '@/utils/logging'

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
                state.features.selectedFeatures.forEach((selectedFeature) => {
                    if (selectedFeature instanceof LayerFeature) {
                        reprojectedSelectedFeatures.push(
                            new LayerFeature(
                                selectedFeature.layer,
                                selectedFeature.id,
                                selectedFeature.name,
                                selectedFeature.htmlPopup,
                                reprojectCoordinates(selectedFeature.coordinates),
                                projExtent(oldProjection, newProjection, selectedFeature.extent),
                                selectedFeature.geometry
                            )
                        )
                    } else if (selectedFeature.isEditable) {
                        reprojectedSelectedFeatures.push(
                            new EditableFeature(
                                selectedFeature.id,
                                reprojectCoordinates(selectedFeature.coordinates),
                                selectedFeature.time,
                                selectedFeature.description,
                                selectedFeature.featureType,
                                selectedFeature.textColor,
                                selectedFeature.textSize,
                                selectedFeature.fillColor,
                                selectedFeature.icon,
                                selectedFeature.iconSize
                            )
                        )
                    } else {
                        log.debug('do not know what to do with this feature', selectedFeature)
                    }
                })
                if (reprojectedSelectedFeatures.length > 0) {
                    store.dispatch('setSelectedFeatures', reprojectedSelectedFeatures)
                }
            }
        },
    })
}

export default reprojectSelectedFeaturesOnProjectionChangePlugin
