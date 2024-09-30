import { describe, expect, it } from 'vitest'

import { LV03, LV95 } from '@/utils/coordinates/coordinateSystems'
import {
    LV95_RESOLUTIONS,
    swissPyramidZoomToStandardZoomMatrix,
} from '@/utils/coordinates/SwissCoordinateSystem.class'

describe.skip('Unit test functions from SwissCoordinateSystem', () => {
    describe('transformCustomZoomLevelToStandard', () => {
        it('transforms rounded value correctly', () => {
            // most zoom levels on mf-geoadmin3 were forced as integer, so we have to make sure we translate them correctly
            // there is 14 zoom levels described in mf-geoadmin3
            for (let swisstopoZoom = 0; swisstopoZoom <= 14; swisstopoZoom++) {
                expect(LV95.transformCustomZoomLevelToStandard(swisstopoZoom)).to.eq(
                    swissPyramidZoomToStandardZoomMatrix[swisstopoZoom]
                )
                expect(LV03.transformCustomZoomLevelToStandard(swisstopoZoom)).to.eq(
                    swissPyramidZoomToStandardZoomMatrix[swisstopoZoom]
                )
            }
        })
        it('floors any floating swisstopo zoom given before searching for the equivalent', () => {
            for (let swisstopoZoom = 0; swisstopoZoom <= 14; swisstopoZoom++) {
                for (let above = swisstopoZoom; above < swisstopoZoom + 1; above += 0.1) {
                    expect(LV95.transformCustomZoomLevelToStandard(above)).to.eq(
                        swissPyramidZoomToStandardZoomMatrix[swisstopoZoom]
                    )
                    expect(LV03.transformCustomZoomLevelToStandard(above)).to.eq(
                        swissPyramidZoomToStandardZoomMatrix[swisstopoZoom]
                    )
                }
            }
        })
    })
    describe('transformStandardZoomLevelToCustom', () => {
        it('transforms exact value correctly', () => {
            swissPyramidZoomToStandardZoomMatrix.forEach((mercatorZoom, swisstopoZoom) => {
                expect(LV95.transformStandardZoomLevelToCustom(mercatorZoom)).to.eq(
                    parseInt(swisstopoZoom)
                )
                expect(LV03.transformStandardZoomLevelToCustom(mercatorZoom)).to.eq(
                    parseInt(swisstopoZoom)
                )
            })
        })
        it('finds the closest swisstopo zoom from the mercator zoom given', () => {
            const acceptableDeltaInMercatorZoomLevel = 0.15
            // generating ranges of mercator zoom that matches the steps of the matrix
            const rangeOfMercatorZoomToTest = swissPyramidZoomToStandardZoomMatrix.map(
                (mercatorZoom, lv95Zoom) => {
                    if (lv95Zoom === 0) {
                        return {
                            start: 0,
                            end:
                                swissPyramidZoomToStandardZoomMatrix[0] -
                                acceptableDeltaInMercatorZoomLevel,
                            expected: 0,
                        }
                    }
                    if (lv95Zoom >= 14) {
                        return {
                            start: 21,
                            end: 30,
                            expected: lv95Zoom,
                        }
                    }
                    const nextZoomLevel = swissPyramidZoomToStandardZoomMatrix[lv95Zoom + 1]
                    return {
                        start: mercatorZoom + acceptableDeltaInMercatorZoomLevel,
                        end: nextZoomLevel,
                        expected: lv95Zoom + 1,
                    }
                }
            )
            rangeOfMercatorZoomToTest.forEach((range) => {
                for (
                    let zoomLevel = range.start;
                    zoomLevel <= range.end;
                    zoomLevel += acceptableDeltaInMercatorZoomLevel
                ) {
                    expect(LV95.transformStandardZoomLevelToCustom(zoomLevel)).to.eq(
                        parseInt(range.expected),
                        `Mercator zoom ${zoomLevel} was not translated to LV95 correctly`
                    )
                    expect(LV03.transformStandardZoomLevelToCustom(zoomLevel)).to.eq(
                        parseInt(range.expected),
                        `Mercator zoom ${zoomLevel} was not translated to LV03 correctly`
                    )
                }
            })
        })
    })
    describe('getZoomForResolutionAndY', () => {
        it('returns zoom=0 if the resolution is too great', () => {
            expect(LV95.getZoomForResolutionAndCenter(LV95_RESOLUTIONS[0] + 1)).to.eq(0)
            expect(LV03.getZoomForResolutionAndCenter(LV95_RESOLUTIONS[0] + 1)).to.eq(0)
        })
        it('returns zoom correctly while resolution is exactly on a threshold', () => {
            for (let i = 0; i < LV95_RESOLUTIONS.length - 1; i++) {
                expect(LV95.getZoomForResolutionAndCenter(LV95_RESOLUTIONS[i])).to.eq(i)
                expect(LV03.getZoomForResolutionAndCenter(LV95_RESOLUTIONS[i])).to.eq(i)
            }
        })
        it('returns zoom correctly while resolution is in between the two thresholds', () => {
            for (let i = 0; i < LV95_RESOLUTIONS.length - 2; i++) {
                for (
                    let resolution = LV95_RESOLUTIONS[i] - 1;
                    resolution > LV95_RESOLUTIONS[i + 1];
                    resolution--
                ) {
                    expect(LV95.getZoomForResolutionAndCenter(resolution)).to.eq(
                        i + 1,
                        `resolution ${resolution} was misinterpreted`
                    )
                    expect(LV03.getZoomForResolutionAndCenter(resolution)).to.eq(
                        i + 1,
                        `resolution ${resolution} was misinterpreted`
                    )
                }
            }
        })
        it('returns the max zoom available, event if the resolution is smaller than expected', () => {
            const smallestResolution = LV95_RESOLUTIONS[LV95_RESOLUTIONS.length - 1]
            expect(LV95.getZoomForResolutionAndCenter(smallestResolution - 0.1)).to.eq(
                LV95_RESOLUTIONS.indexOf(smallestResolution)
            )
            expect(LV03.getZoomForResolutionAndCenter(smallestResolution - 0.1)).to.eq(
                LV95_RESOLUTIONS.indexOf(smallestResolution)
            )
        })
    })
})
