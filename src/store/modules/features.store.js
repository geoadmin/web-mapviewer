import { EditableFeatureTypes } from '@/api/features.api'
import { allStylingColors, allStylingSizes } from '@/utils/featureStyleUtils'

const getSelectedFeatureWithId = (state, featureId) => {
    return state.selectedFeatures.find((selectedFeature) => selectedFeature.id === featureId)
}

export default {
    state: {
        /** @type Array<Feature> */
        selectedFeatures: [],
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
         * @param {Feature[]} features A list of feature we want to highlight/select on the map
         */
        setSelectedFeatures({ commit }, features) {
            if (Array.isArray(features)) {
                commit('setSelectedFeatures', features)
            }
        },
        /** Removes all selected features from the map */
        clearAllSelectedFeatures({ commit }) {
            commit('setSelectedFeatures', [])
        },
        /** Removes a specific feature from the selected features list. Is not used in drawing mode. */
        removeSelectedFeature({ commit, state }, feature) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature) {
                commit(
                    'setSelectedFeatures',
                    state.selectedFeatures.splice(
                        state.selectedFeatures.indexOf(selectedFeature),
                        1
                    )
                )
            }
        },
        /**
         * In drawing mode, informs the store about the new coordinates of the feature. (It does not
         * move the feature.) Only change the coordinates if the feature is editable and part of the
         * currently selected features.
         *
         * Coordinates is an array of coordinate. Marker and text feature have only one entry in
         * this array while line and measure store each points describing them in this coordinates array
         *
         * @param commit
         * @param state
         * @param {EditableFeature} feature
         * @param {Number[][]} coordinates
         */
        changeFeatureCoordinates({ commit, state }, { feature, coordinates }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable && Array.isArray(coordinates)) {
                commit('changeFeatureCoordinates', {
                    feature: selectedFeature,
                    coordinates,
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
        changeFeatureTitle({ commit, state }, { feature, title }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTitle', { feature: selectedFeature, title })
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
        changeFeatureDescription({ commit, state }, { feature, description }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureDescription', { feature: selectedFeature, description })
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
        changeFeatureColor({ commit, state }, { feature, color }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === color.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureColor', { feature: selectedFeature, color: wantedColor })
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
        changeFeatureTextSize({ commit, state }, { feature, textSize }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedSize = allStylingSizes.find((size) => size.textScale === textSize.textScale)
            if (wantedSize && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTextSize', { feature: selectedFeature, textSize: wantedSize })
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
        changeFeatureTextColor({ commit, state }, { feature, textColor }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === textColor.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureTextColor', {
                    feature: selectedFeature,
                    textColor: wantedColor,
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
        changeFeatureIcon({ commit, state }, { feature, icon }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (
                icon &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.MARKER
            ) {
                commit('changeFeatureIcon', { feature: selectedFeature, icon })
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
        changeFeatureIconSize({ commit, state }, { feature, iconSize }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            const wantedSize = allStylingSizes.find((size) => size.textScale === iconSize.textScale)
            if (
                wantedSize &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.MARKER
            ) {
                commit('changeFeatureIconSize', { feature: selectedFeature, iconSize: wantedSize })
            }
        },

        /**
         * In drawing mode , tells the state if a given feature is being dragged.
         *
         * @param {EditableFeature} feature
         * @param {Boolean} isDragged
         */
        changeFeatureIsDragged({ commit, state }, { feature, isDragged }) {
            const selectedFeature = getSelectedFeatureWithId(state, feature.id)
            if (selectedFeature && selectedFeature.isEditable) {
                commit('changeFeatureIsDragged', {
                    feature: selectedFeature,
                    isDragged: !!isDragged,
                })
            }
        },
    },
    mutations: {
        setSelectedFeatures(state, features) {
            state.selectedFeatures = [...features]
        },
        changeFeatureCoordinates(state, { feature, coordinates }) {
            feature.coordinates = coordinates
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
