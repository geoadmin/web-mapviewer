import { expect } from 'chai'
import proj4 from 'proj4'
import { beforeEach, describe, it } from 'vitest'

import store from '@/store'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'

describe('Zoom level is calculated correctly in the store when using WebMercator as the projection', () => {
    const screenSize = 100
    const lat = 45
    const lon = 8

    const getZoom = () => store.state.position.zoom
    const getResolution = () => store.getters.resolution

    beforeEach(async () => {
        await store.dispatch('setProjection', { projection: WEBMERCATOR, dispatcher: 'unit-test' })
        // first we setup a fake screen of 100px by 100px
        await store.dispatch('setSize', {
            width: screenSize,
            height: screenSize,
        })
        // we now then center the view on wanted coordinates
        await store.dispatch('setCenter', {
            center: proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, lat]),
        })
    })

    it("Doesn't allow negative zoom level, or non numerical value as a zoom level", async () => {
        // setting the zoom at a valid value, and then setting it at an invalid value => the valid value should persist
        const validZoomLevel = 10
        await store.dispatch('setZoom', { zoom: validZoomLevel, dispatcher: 'unit-test' })
        await store.dispatch('setZoom', { zoom: -1, dispatcher: 'unit-test' })
        expect(getZoom()).to.eq(validZoomLevel, 'Should not accept negative zoom level')
        // checking with non numerical (but representing a number)
        await store.dispatch('setZoom', {
            zoom: '' + (validZoomLevel - 1),
            dispatcher: 'unit-test',
        })
        expect(getZoom()).to.eq(
            validZoomLevel,
            'Should not accept non numerical values as zoom level'
        )
        await store.dispatch('setZoom', { zoom: 'test', dispatcher: 'unit-test' })
        expect(getZoom()).to.eq(
            validZoomLevel,
            'Should not accept non numerical values as zoom level'
        )
        // checking with undefined or null
        await store.dispatch('setZoom', { zoom: undefined, dispatcher: 'unit-test' })
        expect(getZoom()).to.eq(
            validZoomLevel,
            'Should not accept undefined or null value as zoom level'
        )
        await store.dispatch('setZoom', { zoom: null, dispatcher: 'unit-test' })
        expect(getZoom()).to.eq(
            validZoomLevel,
            'Should not accept undefined or null value as zoom level'
        )
    })
    it('Set zoom level correctly from what is given in "setZoom"', async () => {
        // checking zoom level 0 to 24
        for (let zoom = 0; zoom < 24; zoom += 1) {
            await store.dispatch('setZoom', { zoom, dispatcher: 'unit-test' })
            expect(getZoom()).to.eq(zoom)
        }
    })
    it('Rounds zoom level to the third decimal if more are given', async () => {
        // flooring check
        await store.dispatch('setZoom', { zoom: 5.4321, dispatcher: 'unit-test' })
        expect(getZoom()).to.eq(5.432)
        // ceiling check
        await store.dispatch('setZoom', { zoom: 5.6789, dispatcher: 'unit-test' })
        expect(getZoom()).to.eq(5.679)
    })
    it('Calculate resolution from zoom levels according to OGC standard (with 0.1% error margin)', async () => {
        await store.dispatch('setZoom', { zoom: 10, dispatcher: 'unit-test' })
        // see https://wiki.openstreetmap.org/wiki/Zoom_levels
        // at zoom level 10, resolution should be of about 152.746 meter per pixel adjusted to latitude
        const resolutionAtZoom10 = 152.746
        // we tolerate a 0.1% error margin
        let toleratedDelta = resolutionAtZoom10 / 1000.0
        expect(getResolution()).to.approximately(
            resolutionAtZoom10 * Math.cos((lat * Math.PI) / 180.0),
            toleratedDelta
        )

        // we move to the equator so that resolution values should then match tables
        await store.dispatch('setCenter', { center: proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, 0]) })
        expect(getResolution()).to.approximately(resolutionAtZoom10, toleratedDelta)

        await store.dispatch('setZoom', { zoom: 2, dispatcher: 'unit-test' })
        const resolutionAtZoom2 = 39103
        // we tolerate a 0.1% error margin
        toleratedDelta = resolutionAtZoom2 / 1000.0
        expect(getZoom()).to.eq(2)
        // at zoom level 2, resolution should be of about 39'103 meter per pixel at equator
        expect(getResolution()).to.approximately(resolutionAtZoom2, toleratedDelta)
        // let's go back to latitude 45 and check resolution again
        await store.dispatch('setCenter', {
            center: proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, lat]),
        })
        expect(getResolution()).to.approximately(
            resolutionAtZoom2 * Math.cos((lat * Math.PI) / 180.0),
            toleratedDelta
        )
    })

    // const startingZoomLevel = 11;
    // const readZoomLevel = () => cy.window().its('store.state.position.zoom');
    //
    // beforeEach(() => {
    //     cy.visit(`/?zoom=${startingZoomLevel}`);
    // });
    //
    // it('Reads zoom level from the URL', () => {
    //     readZoomLevel().should('eq', startingZoomLevel);
    //     const anotherZoomLevel = 5;
    //     cy.visit(`/?zoom=${anotherZoomLevel}`);
    //     readZoomLevel().should('eq', anotherZoomLevel);
    // });
    //
    // it('Adds zoom level to the URL', () => {
    //     cy.url().should('contain', `zoom=${startingZoomLevel}`);
    //     cy.get('[data-cy="zoom-in"]').click();
    //     cy.url().should('contain', `zoom=${startingZoomLevel + 1}`);
    // });
    //
    // it('Will zoom the map when zoom button is clicked', () => {
    //     readZoomLevel().should('eq', startingZoomLevel);
    //     cy.get('[data-cy="zoom-in"]').click();
    //     readZoomLevel().should('eq', startingZoomLevel + 1);
    //     cy.get('[data-cy="zoom-out"]').click();
    //     readZoomLevel().should('eq', startingZoomLevel);
    // });
})
