/// <reference types="cypress" />

import proj4 from 'proj4'

import { CoordinateSystems } from '../../../src/utils/coordinateUtils'
import { round } from '../../../src/utils/numberUtils'
import setupProj4 from '../../../src/utils/setupProj4'

setupProj4()

/** @param {CoordinateSystems} coordinateSystem */
function getMousePositionAndSelect(coordinateSystem) {
    cy.get('[data-cy="mouse-position-select"]').should('be.visible')
    cy.get('[data-cy="mouse-position-select"]').select(coordinateSystem.id)
}

const defaultCenter = [47.5, 7.5]

function checkMousePositionStringValue(coordStr = `${defaultCenter[0]}, ${defaultCenter[1]}`) {
    cy.get('[data-cy="map"]').click()
    cy.get('[data-cy="mouse-position"]').should('contain.text', coordStr)
}

function checkMousePositionNumberValue(expectedX = defaultCenter[0], expectedY = defaultCenter[1]) {
    cy.get('[data-cy="map"]').click()
    cy.get('[data-cy="mouse-position"]')
        .invoke('text')
        .then((text) => {
            const [x, y] = text.split(',').map((textValue) => parseFloat(textValue))
            expect(x).to.be.closeTo(expectedX, 0.1)
            expect(y).to.be.closeTo(expectedY, 0.1)
        })
}

describe('Test mouse position', () => {
    context('Position in footer', () => {
        beforeEach(() => {
            cy.viewport('ipad-2')
            cy.goToMapView('en', {
                lat: defaultCenter[0],
                lon: defaultCenter[1],
                z: 12,
            })
        })
        it('Shows LV95 coordinates by default', () => {
            checkMousePositionNumberValue(2604624.64, 1261029.16)
        })
        it('switches to LV03 when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.LV03)
            checkMousePositionNumberValue(604624.6, 261029.21)
        })
        it('switches to MGRS when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.MGRS)
            checkMousePositionStringValue('32TLT 87030 61820')
        })
        it('switches to WebMercator when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.WGS84)
            checkMousePositionStringValue('47° 30′ 00.00″ N 7° 30′ 00.00″ E')
        })
        it('goes back to LV95 display if selected again', () => {
            // Change display projection without moving the mouse
            getMousePositionAndSelect(CoordinateSystems.MGRS)
            getMousePositionAndSelect(CoordinateSystems.LV95)
            checkMousePositionNumberValue(2604624.64, 1261029.16)
        })
    })
    context('LocationPopUp when rightclick on the map', function () {
        const lat = 45
        const lon = 8
        beforeEach(() => {
            // Viewport set to see the whole popup
            cy.viewport(500, 1500)
            cy.goToMapView('en', { lat, lon })
            cy.get('[data-cy="map"]').rightclick()
        })
        it('Test the LocationPopUp is visible', () => {
            cy.get('[data-cy="location-popup"]').should('be.visible')
        })
        it('Uses the what3words in the popup', () => {
            cy.wait('@convert-to-w3w')
            cy.fixture('what3word.fixture').then((fakeW3w) => {
                cy.get('[data-cy="location-popup-w3w"]').contains(fakeW3w.words)
            })
        })
        it('Uses the elevation in the popup', () => {
            cy.wait('@coordinates-for-height')
            cy.fixture('height.fixture').then((fakeheight) => {
                cy.get('[data-cy="location-popup-height"]').contains(fakeheight.height)
            })
        })
        context('Coordinates system tests', () => {
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
