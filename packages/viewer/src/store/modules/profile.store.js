import log from '@swissgeo/log'
import { bbox, lineString } from '@turf/turf'
import cloneDeep from 'lodash/cloneDeep'

/** @param {SelectableFeature} feature */
export function canFeatureShowProfile(feature) {
    return ['MultiLineString', 'LineString', 'Polygon', 'MultiPolygon'].includes(
        feature?.geometry?.type
    )
}

function canPointsBeStitched(p1, p2, tolerance = 10.0) {
    return (
        (p1[0] === p2[0] && p1[1] === p2[1]) ||
        Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)) <= tolerance
    )
}

/**
 * @param {SingleCoordinate[]} currentLine
 * @param {SingleCoordinate[][]} remainingLines
 * @param {number[]} previouslyUsedIndexes
 * @param {number} tolerance
 * @returns {Object}
 */
function stitchMultiLineStringRecurse(
    currentLine,
    remainingLines,
    previouslyUsedIndexes = [],
    tolerance = 10.0
) {
    let currentLineBeingStitched = [...currentLine]
    let someStitchHappened = false
    const usedIndex = [...previouslyUsedIndexes]

    remainingLines.forEach((line, index) => {
        // if line was already used elsewhere, skip it
        if (usedIndex.includes(index)) {
            return
        }

        const firstPoint = currentLineBeingStitched[0]
        const lastPoint = currentLineBeingStitched[currentLineBeingStitched.length - 1]
        const lineFirstPoint = line[0]
        const lineLastPoint = line[line.length - 1]

        if (canPointsBeStitched(firstPoint, lineLastPoint, tolerance)) {
            currentLineBeingStitched = [...line, ...currentLineBeingStitched]
            someStitchHappened = true
            usedIndex.push(index)
        } else if (canPointsBeStitched(firstPoint, lineFirstPoint, tolerance)) {
            currentLineBeingStitched = [...line.toReversed(), ...currentLineBeingStitched]
            someStitchHappened = true
            usedIndex.push(index)
        } else if (canPointsBeStitched(lastPoint, lineFirstPoint, tolerance)) {
            currentLineBeingStitched = [...currentLineBeingStitched, ...line]
            someStitchHappened = true
            usedIndex.push(index)
        } else if (canPointsBeStitched(lastPoint, lineLastPoint, tolerance)) {
            currentLineBeingStitched = [...currentLineBeingStitched, ...line.toReversed()]
            someStitchHappened = true
            usedIndex.push(index)
        }
    })

    if (someStitchHappened) {
        return stitchMultiLineStringRecurse(currentLineBeingStitched, remainingLines, usedIndex)
    }

    return { result: currentLineBeingStitched, usedIndex }
}

/**
 * Stitch together connected LineStrings in a MultiLineString geometry.
 *
 * @param {SingleCoordinate[][]} lines Elements of the MultiLineString.
 * @param {number} tolerance How far away (in meters) two points can be and still be considered
 *   "stitch-candidate"
 * @returns {SingleCoordinate[][]} Elements stitched togethers, if possible, or simply left as is if
 *   not.
 */
export function stitchMultiLine(lines, tolerance = 10.0) {
    const results = []
    const globalUsedIndexes = []
    lines.forEach((line, index) => {
        // if line was already used, we can skip it (it's already included in some other line)
        if (globalUsedIndexes.includes(index)) {
            return
        }
        const { result, usedIndex } = stitchMultiLineStringRecurse(
            line,
            lines,
            [index, ...globalUsedIndexes],
            tolerance
        )
        globalUsedIndexes.push(...usedIndex)
        results.push(result)
    })
    return results
}

export default {
    state: {
        feature: null,
        simplifyGeometry: true,
        /**
         * The index of the current feature segment to highlight in the profile
         *
         * @type {Number}
         */
        currentFeatureSegmentIndex: 0,
    },
    getters: {
        /**
         * @param {State} state
         * @returns {boolean} True if the profile feature is a LineString or Polygon
         */
        isProfileFeatureMultiFeature(state) {
            return ['MultiPolygon', 'MultiLineString'].includes(state.feature?.geometry?.type)
        },
        currentProfileCoordinates(state, getters) {
            if (!state.feature) {
                return null
            }
            if (getters.isProfileFeatureMultiFeature) {
                return state.feature.geometry.coordinates[state.currentFeatureSegmentIndex]
            }
            if (state.feature.geometry.type === 'Polygon') {
                return state.feature.geometry.coordinates[0]
            }
            return state.feature.geometry.coordinates
        },
        /**
         * @param state
         * @param getters
         * @returns {number[] | null}
         */
        currentProfileExtent(state, getters) {
            if (!state.feature) {
                return null
            }
            return bbox(lineString(getters.currentProfileCoordinates))
        },
    },
    actions: {
        /**
         * Sets the current feature segment index. This is used to highlight the current segment of
         * a feature is inspecting the feature profile.
         *
         * @param commit
         * @param {Number} index The index of the segment to highlight
         */
        setCurrentFeatureSegmentIndex({ commit }, { index = 0, dispatcher }) {
            commit('setCurrentFeatureSegmentIndex', { index, dispatcher })
        },
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
                // the feature comes from vuex, so if we mutate it directly it raises an error
                const profileFeature = cloneDeep(feature)
                if (profileFeature.geometry.type === 'MultiLineString') {
                    // attempting to simplify the multiline into fewer "segments"
                    profileFeature.geometry.coordinates = stitchMultiLine(
                        profileFeature.geometry.coordinates,
                        // empirically tested with Veloland layer, gives the best results without a tradeoff
                        50.0 /* m */
                    )
                }
                // if the geometry is a MultiPolygon, we need to flatten it one level, so it can get processed as segments
                if (profileFeature.geometry.type === 'MultiPolygon') {
                    profileFeature.geometry.coordinates = profileFeature.geometry.coordinates.flat(1)
                }
                commit('setProfileFeature', { feature: profileFeature, dispatcher })
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
        setCurrentFeatureSegmentIndex(state, { index }) {
            state.currentFeatureSegmentIndex = index
        },
    },
}
