import {
    swisstopoPyramidZoomToMercatorZoomMatrix,
    translateMercatorZoomToSwisstopoPyramidZoom,
    translateSwisstopoPyramidZoomToMercatorZoom,
} from '@/utils/zoomLevelUtils'
import { describe, expect, it } from 'vitest'

describe('Unit test functions from zoomLevelUtils.js', () => {
    describe('translateSwisstopoPyramidZoomToMercatorZoom', () => {
        it('transforms rounded value correctly', () => {
            // most zoom levels on mf-geoadmin3 were forced as integer, so we have to make sure we translate them correctly
            // there is 14 zoom levels described in mf-geoadmin3
            for (let swisstopoZoom = 0; swisstopoZoom <= 14; swisstopoZoom++) {
                expect(translateSwisstopoPyramidZoomToMercatorZoom(swisstopoZoom)).to.eq(
                    swisstopoPyramidZoomToMercatorZoomMatrix[swisstopoZoom]
                )
            }
        })
        it('floors any floating swisstopo zoom given before searching for the equivalent', () => {
            for (let swisstopoZoom = 0; swisstopoZoom <= 14; swisstopoZoom++) {
                for (let above = swisstopoZoom; above < swisstopoZoom + 1; above += 0.1) {
                    expect(translateSwisstopoPyramidZoomToMercatorZoom(above)).to.eq(
                        swisstopoPyramidZoomToMercatorZoomMatrix[swisstopoZoom]
                    )
                }
            }
        })
    })
    describe('translateMercatorZoomToSwisstopoPyramidZoom', () => {
        it('transforms exact value correctly', () => {
            Object.entries(swisstopoPyramidZoomToMercatorZoomMatrix).forEach(
                ([swisstopoZoom, mercatorZoom]) => {
                    expect(translateMercatorZoomToSwisstopoPyramidZoom(mercatorZoom)).to.eq(
                        parseInt(swisstopoZoom)
                    )
                }
            )
        })
        it('finds the closest swisstopo zoom from the mercator zoom given', () => {
            const acceptableDeltaInMercatorZoomLevel = 0.15
            // generating ranges of mercator zoom that matches the steps of the matrix
            const rangeOfMercatorZoomToTest = Object.entries(
                swisstopoPyramidZoomToMercatorZoomMatrix
            ).map(([lv95Zoom, mercatorZoom]) => {
                const swisstopoZoom = parseInt(lv95Zoom)
                if (swisstopoZoom === 0) {
                    return {
                        start: 0,
                        end:
                            swisstopoPyramidZoomToMercatorZoomMatrix[0] -
                            acceptableDeltaInMercatorZoomLevel,
                        expected: 0,
                    }
                }
                if (swisstopoZoom >= 14) {
                    return {
                        start: 21,
                        end: 30,
                        expected: swisstopoZoom,
                    }
                }
                const nextZoomLevel = swisstopoPyramidZoomToMercatorZoomMatrix[swisstopoZoom + 1]
                return {
                    start: mercatorZoom + acceptableDeltaInMercatorZoomLevel,
                    end: nextZoomLevel,
                    expected: swisstopoZoom + 1,
                }
            })
            rangeOfMercatorZoomToTest.forEach((range) => {
                for (
                    let zoomLevel = range.start;
                    zoomLevel <= range.end;
                    zoomLevel += acceptableDeltaInMercatorZoomLevel
                ) {
                    expect(translateMercatorZoomToSwisstopoPyramidZoom(zoomLevel)).to.eq(
                        parseInt(range.expected),
                        `Mercator zoom ${zoomLevel} was not translated to LV95 correctly`
                    )
                }
            })
        })
    })
})
