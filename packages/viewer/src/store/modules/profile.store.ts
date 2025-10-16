import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { bbox, lineString } from '@turf/turf'
import cloneDeep from 'lodash/cloneDeep'
import { defineStore } from 'pinia'

import type { SelectableFeature } from '@/api/features.api'
import type { ActionDispatcher } from '@/store/types'

export function canFeatureShowProfile(feature?: SelectableFeature<boolean>): boolean {
    return (
        !!feature?.geometry &&
        ['MultiLineString', 'LineString', 'Polygon', 'MultiPolygon'].includes(
            feature?.geometry?.type
        )
    )
}

function canPointsBeStitched(
    p1: SingleCoordinate,
    p2: SingleCoordinate,
    tolerance: number = 10.0
): boolean {
    return (
        (p1[0] === p2[0] && p1[1] === p2[1]) ||
        Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)) <= tolerance
    )
}

function stitchMultiLineStringRecurse(
    currentLine: SingleCoordinate[],
    remainingLines: SingleCoordinate[][],
    previouslyUsedIndexes: number[] = [],
    tolerance: number = 10.0
): { result: SingleCoordinate[]; usedIndex: number[] } {
    let currentLineBeingStitched: SingleCoordinate[] = [...currentLine]
    let someStitchHappened: boolean = false
    const usedIndex: number[] = [...previouslyUsedIndexes]

    remainingLines.forEach((line, index) => {
        // if line was already used elsewhere, skip it
        if (usedIndex.includes(index)) {
            return
        }

        const firstPoint: SingleCoordinate = currentLineBeingStitched[0]!
        const lastPoint: SingleCoordinate =
            currentLineBeingStitched[currentLineBeingStitched.length - 1]!
        const lineFirstPoint: SingleCoordinate = line[0]!
        const lineLastPoint: SingleCoordinate = line[line.length - 1]!

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
 * @param lines Elements of the MultiLineString.
 * @param tolerance How far away (in meters) two points can be and still be considered
 *   "stitch-candidate"
 * @returns Elements stitched togethers, if possible, or simply left as is if not.
 */
export function stitchMultiLine(
    lines: SingleCoordinate[][],
    tolerance: number = 10.0
): SingleCoordinate[][] {
    const results: SingleCoordinate[][] = []
    const globalUsedIndexes: number[] = []
    lines.forEach((line: SingleCoordinate[], index: number) => {
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

export interface ProfileState {
    feature?: SelectableFeature<boolean>
    simplifyGeometry: boolean
    /**
     * Tells which part of a MultiLineString or Polygon is to be shown as the profile. Will also be
     * used jointly with the currentMultiFeatureIndex when dealing with MultiPolygons
     */
    currentFeatureGeometryIndex: number
}

export enum ProfileStoreActions {
    SetCurrentFeatureSegmentIndex = 'setCurrentFeatureSegmentIndex',
    SetProfileFeature = 'setProfileFeature',
}

const useProfileStore = defineStore('profile', {
    state: (): ProfileState => ({
        feature: undefined,
        simplifyGeometry: true,
        currentFeatureGeometryIndex: 0,
    }),
    getters: {
        /** @returns True if the profile feature is a LineString or Polygon */
        isProfileFeatureMultiFeature(): boolean {
            return (
                !!this.feature?.geometry &&
                ['MultiPolygon', 'MultiLineString'].includes(this.feature?.geometry?.type)
            )
        },

        /**
         * Checks if the profile feature is a MultiPolygon describing multiple "rings" (aka polygons
         * with holes, or disjointed parts)
         */
        hasProfileFeatureMultipleGeometries(): boolean {
            return (
                !!this.feature?.geometry &&
                this.feature.geometry?.type === 'MultiPolygon' &&
                this.feature.geometry.coordinates.length > 1
            )
        },

        currentProfileCoordinates(): SingleCoordinate[] | undefined {
            if (!this.feature || !this.feature?.geometry) {
                return
            }
            if (this.feature.geometry.type === 'MultiPolygon') {
                // if the geometry is a MultiPolygon, we need to flatten it one level, so it can get processed as the other types
                return this.feature.geometry.coordinates.flat(1)[
                    this.currentFeatureGeometryIndex
                ] as SingleCoordinate[]
            }
            if (
                this.feature.geometry.type === 'MultiLineString' ||
                this.feature.geometry.type === 'Polygon'
            ) {
                return this.feature.geometry.coordinates[
                    this.currentFeatureGeometryIndex
                ] as SingleCoordinate[]
            }
            if (this.feature.geometry.type === 'LineString') {
                return this.feature.geometry.coordinates as SingleCoordinate[]
            }
            return
        },

        currentProfileExtent(): FlatExtent | undefined {
            if (!this.currentProfileCoordinates) {
                return
            }
            return bbox(lineString(this.currentProfileCoordinates)) as FlatExtent
        },
    },
    actions: {
        /**
         * Sets the current feature segment index. This is used to highlight the current segment of
         * a feature is inspecting the feature profile.
         */
        [ProfileStoreActions.SetCurrentFeatureSegmentIndex](
            index: number,
            dispatcher: ActionDispatcher
        ) {
            this.currentFeatureGeometryIndex = index ?? 0
        },

        /**
         * Sets the GeoJSON geometry for which we want a profile and request this profile from the
         * backend (if the geometry is valid)
         *
         * Only GeoJSON LineString and Polygon types are supported to request a profile.
         *
         * @param payload
         * @param payload.feature A feature which has a LineString or Polygon geometry, and for
         *   which we want to show a height profile (or `null` if the profile should be
         *   cleared/hidden)
         * @param payload.simplifyGeometry If set to true, the geometry of the feature will be
         *   simplified before being sent to the profile backend. This is useful in case the data
         *   comes from an unfiltered GPS source (GPX track). Not simplifying the track could lead
         *   to a coastal paradox (meaning the hiking time will be way of the charts because of all
         *   the small jumps due to GPS errors)
         * @param dispatcher
         */
        [ProfileStoreActions.SetProfileFeature](
            payload: { feature?: SelectableFeature<boolean>; simplifyGeometry?: boolean },
            dispatcher: ActionDispatcher
        ) {
            const { feature, simplifyGeometry = false } = payload
            if (!feature) {
                this.feature = undefined
            } else if (canFeatureShowProfile(feature)) {
                // the feature comes from vuex, so if we mutate it directly it raises an error
                const profileFeature = cloneDeep(feature)
                if (!profileFeature.geometry) {
                    return
                }
                if (profileFeature.geometry.type === 'MultiLineString') {
                    // attempting to simplify the multiline into fewer "geometries"
                    profileFeature.geometry.coordinates = stitchMultiLine(
                        profileFeature.geometry.coordinates as SingleCoordinate[][],
                        // empirically tested with Veloland layer, gives the best results without a tradeoff
                        50.0 /* m */
                    )
                }
                this.feature = profileFeature
            } else {
                log.warn({
                    title: 'Profile store / setProfileFeature',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Geometry type not supported to show a profile, ignoring', feature],
                })
            }
            this.simplifyGeometry = simplifyGeometry
        },
    },
})

export default useProfileStore
