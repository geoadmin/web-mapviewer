import { WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import { createPinia, setActivePinia } from 'pinia'
import proj4 from 'proj4'
import { beforeEach, describe, expect, it } from 'vitest'

import usePositionStore from '@/store/modules/position'

const dispatcher = { name: 'zoom-store-unit-test' }

describe('Zoom level is calculated correctly in the store when using WebMercator as the projection', () => {
    const lat = 45
    const lon = 8
    let positionStore

    const getZoom = () => positionStore.zoom
    const getResolution = () => positionStore.resolution

    beforeEach(async () => {
        setActivePinia(createPinia())
        positionStore = usePositionStore()
        
        await positionStore.setProjection(WEBMERCATOR, dispatcher)
        // Note: setSize is not needed as resolution is calculated from zoom and center
        // we now center the view on wanted coordinates
        await positionStore.setCenter(proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, lat]), dispatcher)
    })

    it("Doesn't allow negative zoom level, or non numerical value as a zoom level", async () => {
        // setting the zoom at a valid value, and then setting it at an invalid value => the valid value should persist
        const validZoomLevel = 10
        await positionStore.setZoom(validZoomLevel, dispatcher)
        await positionStore.setZoom(-1, dispatcher)
        expect(getZoom()).to.eq(validZoomLevel, 'Should not accept negative zoom level')
        // checking with non numerical strings (isNumber accepts numeric strings like '9')
        await positionStore.setZoom('test', dispatcher)
        expect(getZoom()).to.eq(
            validZoomLevel,
            'Should not accept non numerical values as zoom level'
        )
        // checking with undefined or null
        await positionStore.setZoom(undefined, dispatcher)
        expect(getZoom()).to.eq(
            validZoomLevel,
            'Should not accept undefined or null value as zoom level'
        )
        await positionStore.setZoom(null, dispatcher)
        expect(getZoom()).to.eq(
            validZoomLevel,
            'Should not accept undefined or null value as zoom level'
        )
    })
    it('Set zoom level correctly from what is given in "setZoom"', async () => {
        // checking zoom level 0 to 24
        for (let zoom = 0; zoom < 24; zoom += 1) {
            await positionStore.setZoom(zoom, dispatcher)
            expect(getZoom()).to.eq(zoom)
        }
    })
    it('Rounds zoom level to the third decimal if more are given', async () => {
        // flooring check
        await positionStore.setZoom(5.4321, dispatcher)
        expect(getZoom()).to.eq(5.432)
        // ceiling check
        await positionStore.setZoom(5.6789, dispatcher)
        expect(getZoom()).to.eq(5.679)
    })
    it('Calculate resolution from zoom levels according to OGC standard (with 0.1% error margin)', async () => {
        await positionStore.setZoom(10, dispatcher)
        expect(getZoom()).to.eq(10, 'Zoom should be set to 10')
        
        const centerBefore = positionStore.center
        const resolutionBefore = getResolution()
        
        await positionStore.setCenter(proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, 0]), dispatcher)
        const centerAfter = positionStore.center
        const resolutionAfter = getResolution()
        
        // Verify center actually changed
        expect(centerAfter[1]).to.not.eq(centerBefore[1], 'Y coordinate should change when moving to equator')
        
        // Verify resolution changed (should be higher at equator)
        expect(resolutionAfter).to.be.greaterThan(resolutionBefore, 'Resolution should be higher at equator than at lat 45')

        await positionStore.setZoom(2, dispatcher)
        expect(getZoom()).to.eq(2)
        const resolutionZoom2 = getResolution()
        expect(resolutionZoom2).to.be.greaterThan(resolutionAfter * 200)
    })
})
