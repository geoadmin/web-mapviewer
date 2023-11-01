import getFeature, { EditableFeature, LayerFeature } from '@/api/features.api'
import log from '@/utils/logging'
import proj4 from 'proj4'

/**
 * Plugin that will reproject selected features after it detects that the projection was changed
 *
 * @param {Vuex.Store} store
 */
const reprojectSelectedFeaturesOnProjectionChangePlugin = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setProjection') {
            const newProjection = mutation.payload
            const oldProjection = state.position.projection

            log.debug(
                `starting to reproject the app from ${oldProjection.epsg} to ${newProjection.epsg}`
            )
            const reprojectCoordinates = (coordinates = []) =>
                proj4(oldProjection.epsg, newProjection.epsg, coordinates)

            // re-requesting selected features with the new projection
            const reprojectedSelectedFeatures = []
            const allGetFeaturePromises = []
            state.features.selectedFeatures.forEach((selectedFeature) => {
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
    })
}

export default reprojectSelectedFeaturesOnProjectionChangePlugin
