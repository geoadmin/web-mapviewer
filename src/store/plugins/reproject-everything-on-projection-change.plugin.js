import getFeature, { EditableFeature, LayerFeature } from '@/api/features.api'
import log from '@/utils/logging'
import proj4 from 'proj4'

let oldProjection = null
let selectedFeaturesBeforeProjectionChange = []

/**
 * Plugin that will reproject anything that needs to be reprojected as soon as it detects that the
 * projection was changed
 *
 * @param {Vuex.Store} store
 */
const reprojectEverythingOnProjectionChangePlugin = (store) => {
    store.subscribeAction({
        before: (action, state) => {
            if (action.type === 'setProjection') {
                oldProjection = state.position.projection
                selectedFeaturesBeforeProjectionChange = [...state.features.selectedFeatures]
                if (selectedFeaturesBeforeProjectionChange.length > 0) {
                    store.dispatch('clearAllSelectedFeatures')
                }
            }
        },
        after: (action, state) => {
            if (action.type === 'setProjection') {
                const newProjection = state.position.projection

                log.debug(
                    `starting to reproject the app from ${oldProjection.epsg} to ${newProjection.epsg}`
                )
                const reprojectCoordinates = (coordinates = []) =>
                    proj4(oldProjection.epsg, newProjection.epsg, coordinates)

                // re-requesting selected features with the new projection
                const reprojectedSelectedFeatures = []
                const allGetFeaturePromises = []
                selectedFeaturesBeforeProjectionChange.forEach((selectedFeature) => {
                    if (selectedFeature instanceof LayerFeature) {
                        allGetFeaturePromises.push(
                            getFeature(
                                selectedFeature.layer,
                                selectedFeature.featureId,
                                newProjection,
                                state.i18n.currentLang
                            ).then((feature) => reprojectedSelectedFeatures.push(feature))
                        )
                    } else if (selectedFeature.isEditable) {
                        const reprojectedFeatureCoordinates = selectedFeature.coordinates.map(
                            (coordinate) => reprojectCoordinates(coordinate)
                        )
                        reprojectedSelectedFeatures.push(
                            new EditableFeature(
                                selectedFeature.id,
                                reprojectedFeatureCoordinates,
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
                Promise.all(allGetFeaturePromises).then(() => {
                    store.dispatch('setSelectedFeatures', reprojectedSelectedFeatures)
                })
            }
        },
    })
}

export default reprojectEverythingOnProjectionChangePlugin
