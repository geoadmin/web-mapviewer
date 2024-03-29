import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { allStylingColors, allStylingSizes } from '@/utils/featureStyleUtils'

const getSelectedFeatureWithId = (state, featureId) => {
    return state.selectedFeatures.find((selectedFeature) => selectedFeature.id === featureId)
}

export default {
    state: {
        /** @type Array<SelectableFeature> */
        selectedFeatures: [],
        highlightedFeatureId: null,
    },
    getters: {
        editFeature(state) {
            return state.selectedFeatures.find((feature) => feature.isEditable)
        },
    },
    actions: {
        /**
         * Tells the map to highlight a list of features (place a round marker at their location).
         * Those features are currently shown by the tooltip. If in drawing mode, this functions
         * tells the store which features are selected (it does not select the features by itself)
         *
         * @param commit
         * @param {SelectableFeature[]} features A list of feature we want to highlight/select on
         *   the map
         */
        setSelectedFeatures({ commit }, { features, dispatcher }) {
            commit('setHighlightedFeatureId', {
                highlightedFeatureId: null,
                dispatcher,
            })
            if (Array.isArray(features)) {
                commit('setSelectedFeatures', { features, dispatcher })
            }
        },
        /** Removes all selected features from the map */
        clearAllSelectedFeatures({ commit }, { dispatcher }) {
            commit('setSelectedFeatures', { features: [], dispatcher })
            commit('setHighlightedFeatureId', {
                highlightedFeatureId: null,
                dispatcher,
            })
        },
        setHighlightedFeatureId({ commit }, { highlightedFeatureId = null, dispatcher }) {
            commit('setHighlightedFeatureId', { highlightedFeatureId, dispatcher })
        },
        /** Removes a specific feature from the selected features list. Is not used in drawing mode. */
        removeSelectedFeature({ commit, state }, { feature, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature) {
                commit('setSelectedFeatures', {
                    features: state.selectedFeatures.splice(
                        state.selectedFeatures.indexOf(selectedFeature),
                        1
                    ),
                    dispatcher,
                })
            }
        },
        /**
         * In drawing mode, informs the store about the new coordinates of the feature. (It does not
         * move the feature.) Only change the coordinates if the feature is editable and part of the
         * currently selected features.
         *
         * Coordinates is an array of coordinate. Marker and text feature have only one entry in
         * this array while line and measure store each points describing them in this coordinates
         * array
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {Number[][]} coordinates
         */
        changeFeatureCoordinates({ commit, state }, { feature, coordinates, geodesicCoordinates }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable && Array.isArray(coordinates)) {
                commit('changeFeatureCoordinates', {
                    feature: selectedFeature,
                    coordinates,
                    geodesicCoordinates,
                })
            }
        },

        changeFeatureGeometry({ commit, state }, { feature, geometry }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable && geometry) {
                commit('changeFeatureGeometry', {
                    feature: selectedFeature,
                    geometry,
                })
            }
        },
        /**
         * Changes the title of the feature. Only change the title if the feature is editable and
         * part of the currently selected features
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {String} title
         */
        changeFeatureTitle({ commit, state }, { feature, title, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTitle', { feature: selectedFeature, title, dispatcher })
            }
        },
        /**
         * Changes the description of the feature. Only change the description if the feature is
         * editable and part of the currently selected features
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {String} description
         */
        changeFeatureDescription({ commit, state }, { feature, description, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureDescription', {
                    feature: selectedFeature,
                    description,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the color used to fill the feature. Only change the color if the feature is
         * editable, part of the currently selected features and that the given color is a valid
         * color from {@link FeatureStyleColor}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleColor} color
         */
        changeFeatureColor({ commit, state }, { feature, color, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === color.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureColor', {
                    feature: selectedFeature,
                    color: wantedColor,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the text size of the feature. Only change the text size if the feature is
         * editable, part of the currently selected features and that the given size is a valid size
         * from {@link FeatureStyleSize}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleSize} textSize
         */
        changeFeatureTextSize({ commit, state }, { feature, textSize, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedSize = allStylingSizes.find((size) => size.textScale === textSize.textScale)
            if (wantedSize && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTextSize', {
                    feature: selectedFeature,
                    textSize: wantedSize,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the text color of the feature. Only change the text color if the feature is
         * editable, part of the currently selected features and that the given color is a valid
         * color from {@link FeatureStyleColor}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleColor} textColor
         */
        changeFeatureTextColor({ commit, state }, { feature, textColor, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === textColor.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTextColor', {
                    feature: selectedFeature,
                    textColor: wantedColor,
                    dispatcher,
                })
            }
        },
        /**
         * Changes the icon of the feature. Only change the icon if the feature is editable, part of
         * the currently selected features, is a marker type feature and that the given icon is
         * valid (non-null)
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {Icon} icon
         */
        changeFeatureIcon({ commit, state }, { feature, icon, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (
                icon &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.MARKER
            ) {
                commit('changeFeatureIcon', { feature: selectedFeature, icon, dispatcher })
            }
        },
        /**
         * Changes the icon size of the feature. Only change the icon size if the feature is
         * editable, part of the currently selected features, is a marker type feature and that the
         * given size is a valid size from {@link FeatureStyleSize}
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {FeatureStyleSize} iconSize
         */
        changeFeatureIconSize({ commit, state }, { feature, iconSize, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedSize = allStylingSizes.find((size) => size.textScale === iconSize.textScale)
            if (
                wantedSize &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.MARKER
            ) {
                commit('changeFeatureIconSize', {
                    feature: selectedFeature,
                    iconSize: wantedSize,
                    dispatcher,
                })
            }
        },

        /**
         * In drawing mode , tells the state if a given feature is being dragged.
         *
         * @param {EditableFeature} feature
         * @param {Boolean} isDragged
         */
        changeFeatureIsDragged({ commit, state }, { feature, isDragged, dispatcher }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureIsDragged', {
                    feature: selectedFeature,
                    isDragged: !!isDragged,
                    dispatcher,
                })
            }
        },
    },
    mutations: {
        setSelectedFeatures(state, { features }) {
            state.selectedFeatures = [...features]
        },
        setHighlightedFeatureId(state, { highlightedFeatureId }) {
            state.highlightedFeatureId = highlightedFeatureId
        },
        changeFeatureCoordinates(state, { feature, coordinates, geodesicCoordinates }) {
            feature.coordinates = coordinates
            feature.geodesicCoordinates = geodesicCoordinates
        },
        changeFeatureGeometry(state, { feature, geometry }) {
            feature.geometry = geometry
        },
        changeFeatureTitle(state, { feature, title }) {
            feature.title = title
        },
        changeFeatureDescription(state, { feature, description }) {
            feature.description = description
        },
        changeFeatureColor(state, { feature, color }) {
            feature.fillColor = color
        },
        changeFeatureTextSize(state, { feature, textSize }) {
            feature.textSize = textSize
        },
        changeFeatureTextColor(state, { feature, textColor }) {
            feature.textColor = textColor
        },
        changeFeatureIcon(state, { feature, icon }) {
            feature.icon = icon
        },
        changeFeatureIconSize(state, { feature, iconSize }) {
            feature.iconSize = iconSize
        },
        changeFeatureIsDragged(state, { feature, isDragged }) {
            feature.isDragged = isDragged
        },
    },
}
