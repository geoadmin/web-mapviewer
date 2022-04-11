export class Feature {
    constructor(coordinate, title, description, isEditable) {
        this.coordinate = [...coordinate]
        this.title = title
        this.description = description
        this.isEditable = !!isEditable
    }
}

export default {
    state: {
        /** @type Array<Feature> */
        selectedFeatures: [],
    },
    getters: {},
    actions: {
        /**
         * Tells the map to highlight a list of features (place a round marker at their location).
         * Those features are currently shown by the tooltip.
         *
         * @param commit
         * @param {Feature[]} features A list of feature we want to highlight/select on the map
         */
        setSelectedFeatures: ({ commit }, features) => {
            if (Array.isArray(features)) {
                commit('setSelectedFeatures', features)
            }
        },
        /** Removes all selected features from the map */
        clearSelectedFeatures: ({ commit }) => commit('setSelectedFeatures', []),
    },
    mutations: {
        setSelectedFeatures: (state, features) => (state.selectedFeatures = features),
    },
}
