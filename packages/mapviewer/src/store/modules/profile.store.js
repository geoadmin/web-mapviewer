import log from '@geoadmin/log'

/** @param {SelectableFeature} feature */
export function canFeatureShowProfile(feature) {
    return ['MultiLineString', 'LineString', 'Polygon', 'MultiPolygon'].includes(
        feature?.geometry?.type
    )
}

export default {
    state: {
        feature: null,
        simplifyGeometry: true,
    },
    getters: {},
    actions: {
        /**
         * Sets the GeoJSON geometry for which we want a profile and request this profile from the
         * backend (if the geometry is valid)
         *
         * Only GeoJSON LineString and Polygon types are supported to request a profile.
         *
         * @param {SelectableFeature | null} feature A feature which has a LineString or Polygon
         *   geometry, and for which we want to show a height profile (or `null` if the profile
         *   should be cleared/hidden)
         * @param {Boolean} simplifyGeometry If set to true, the geometry of the feature will be
         *   simplified before being sent to the profile backend. This is useful in case the data
         *   comes from an unfiltered GPS source (GPX track), and not simplifying the track could
         *   lead to a coastal paradox (meaning the hiking time will be way of the charts because of
         *   all the small jumps due to GPS errors)
         * @param dispatcher
         */
        setProfileFeature({ commit }, { feature = null, simplifyGeometry = false, dispatcher }) {
            if (feature === null) {
                commit('setProfileFeature', { feature: null, dispatcher })
            } else if (canFeatureShowProfile(feature)) {
                commit('setProfileFeature', { feature: feature, dispatcher })
            } else {
                log.warn('Geometry type not supported to show a profile, ignoring', feature)
            }
            commit('setProfileSimplifyGeometry', {
                simplifyGeometry: !!simplifyGeometry,
                dispatcher,
            })
        },
    },
    mutations: {
        setProfileFeature(state, { feature }) {
            state.feature = feature
        },
        setProfileSimplifyGeometry(state, { simplifyGeometry }) {
            state.simplifyGeometry = simplifyGeometry
        },
    },
}
