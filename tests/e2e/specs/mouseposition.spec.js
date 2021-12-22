/// <reference types="cypress" />

import { CoordinateSystems } from '../../../src/utils/coordinateUtils'
import proj4 from 'proj4'
import setupProj4 from '../../../src/utils/setupProj4'
import { round } from '../../../src/utils/numberUtils'

setupProj4()

/** @param {CoordinateSystems} coordinateSystem */
function getMousePositionAndSelect(coordinateSystem) {
    cy.get('[data-cy="mouse-position-select"]').should('be.visible')
    cy.get('[data-cy="mouse-position-select"]').select(coordinateSystem.id)
}

function getMousePositionValue(x = 100, y = 100, coordStr = '671202, 6074296') {
    cy.get('[data-cy="map"]').click(x, y)
    // here we have to use a non data-cy selector as we have no control on this generated part
    // of the HTML by OpenLayers
    cy.get('[data-cy="mouse-position"] .mouse-position')
        .invoke('text')
        .then((text) => {
            expect(text).to.equal(coordStr)
        })
}

describe('Test mouse position', () => {
    context('Position in footer', () => {
        beforeEach(() => {
            cy.goToMapView('en', {
                E: 2600000,
                N: 1200000,
                z: 8,
            })
        })
        it('Shows LV95 coordinates by default', () => {
            getMousePositionValue(100, 100, '2435419.18, 1297425.86')
        })
        it('switches to LV03 when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.LV03)
            getMousePositionValue(100, 100, '435419.18, 297425.86')
        })
        it('switches to MGRS when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.MGRS)
            getMousePositionValue(100, 100, '31TFN 67815 97235 ')
        })
        it('switches to WebMercator when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.WGS84)
            getMousePositionValue(100, 100, '47° 48′ 23.71″ N 5° 14′ 28.92″ E')
        })
        it('goes back to LV95 display if selected again', () => {
            // Change display projection without moving the mouse
            getMousePositionAndSelect(CoordinateSystems.MGRS)
            getMousePositionAndSelect(CoordinateSystems.LV95)
            getMousePositionValue(100, 100, '2435419.18, 1297425.86')
        })
    })
    context('LocationPopUp when rightclick on the map', function () {
        it('Test the LocationPopUp is visible', () => {
            cy.goToMapView()
            // doing a right click
            cy.get('[data-cy="map"]').rightclick(200, 100)
            cy.get('[data-cy="location-popup"]').should('be.visible')
        })
        it('Uses the what3words in the popup', () => {
            cy.goToMapView()
            cy.get('[data-cy="map"]').rightclick(200, 100)
            cy.wait('@convert-to-w3w')
            cy.fixture('what3word.fixture').then((fakeW3w) => {
                cy.get('[data-cy="location-popup-w3w"]').contains(fakeW3w.words)
            })
        })
        it('Uses the elevation in the popup', () => {
            cy.goToMapView()
            cy.get('[data-cy="map"]').rightclick(200, 100)
            cy.wait('@coordinates-for-height')
            cy.fixture('height.fixture').then((fakeheight) => {
                cy.get('[data-cy="location-popup-height"]').contains(fakeheight.height)
            })
        })
        context('Coordinates system tests', () => {
            const lat = 45
            const lon = 8
            beforeEach(() => {
                // Viewport set to see the whole popup
                cy.viewport(500, 1500)
            })
            before(() => {
                cy.goToMapView('en', { lat, lon })
                cy.get('[data-cy="map"]').rightclick()
            })
            it('Uses the coordination system LV95 in the popup', () => {
                const LV95cord = proj4(proj4.WGS84, 'EPSG:2056', [lon, lat]).map((value) =>
                    round(value, 2)
                )
                cy.get('[data-cy="location-popup-coordinates-lv95"]').contains(
                    `${LV95cord[0]}, ${LV95cord[1]}`
                )
            })
            it('Uses the coordination system LV03 in the popup', () => {
                const LV03cord = proj4(proj4.WGS84, 'EPSG:21781', [lon, lat]).map((value) =>
                    round(value, 2)
                )
                cy.get('[data-cy="location-popup-coordinates-lv03"]').contains(
                    `${LV03cord[0]}, ${LV03cord[1]}`
                )
            })
            it('Uses the coordination system Plain WGS84 in the popup', () => {
                cy.get('[data-cy="location-popup-coordinates-plain-wgs84"]').contains(
                    `${lat}, ${lon}`
                )
            })
            it('Uses the coordination system WGS84 in the popup', () => {
                cy.get('[data-cy="location-popup-coordinates-wgs84"]').contains(
                    `${lat}° 00′ 00.00″ N ${lon}° 00′ 00.00″ E`
                )
            })
            it('Uses the coordination system UTM in the popup', () => {
                cy.get('[data-cy="location-popup-coordinates-utm"]').contains(
                    `32T 421'184 4'983'436`
                )
            })
            it('Uses the coordination system MGRS in the popup', () => {
                cy.get('[data-cy="location-popup-coordinates-mgrs"]').contains('32TMQ 21184 83436')
            })
            it('Test the link with bowl crosshair gives the right coordinates', () => {
                cy.get('[data-cy="location-popup-link-bowl-crosshair"] a').then((link) => {
                    expect(link[0].href).to.contains(`lat=${lat}`)
                    expect(link[0].href).to.contains(`lon=${lon}`)
                })
            })
        })
    })
})
