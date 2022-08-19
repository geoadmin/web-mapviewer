/// <reference types="cypress" />

import { CoordinateSystems } from '@/utils/coordinateUtils'
import setupProj4 from '@/utils/setupProj4'
import { Decoder } from '@nuintun/qrcode'
import proj4 from 'proj4'

setupProj4()

/** @param {CoordinateSystems} coordinateSystem */
function getMousePositionAndSelect(coordinateSystem) {
    cy.get('[data-cy="mouse-position-select"]').should('be.visible')
    cy.get('[data-cy="mouse-position-select"]').select(coordinateSystem.id)
}

const defaultCenter = [47.5, 7.5]

/**
 * Extracts an LV coordinate from a formatted string.
 *
 * @param {String} text A string containing an LV95 or LV03 coordinate.
 */
function parseLV(text) {
    const matches = text.match(/([-\d'.]+), ([-\d'.]+)$/)
    return matches
        .slice(1)
        .map((value) => value.replace(/'/g, ''))
        .map(parseFloat)
}

/**
 * Checks if a coordinate is close to the expected values.
 *
 * @param {Number} expectedX The expected x value.
 * @param {Number} expectedY The expected y value.
 */
function checkXY(expectedX, expectedY) {
    return function (coordinate) {
        const [x, y] = coordinate
        expect(x).to.be.closeTo(expectedX, 0.1)
        expect(y).to.be.closeTo(expectedY, 0.1)
    }
}

function checkMousePositionStringValue(coordStr) {
    cy.get('[data-cy="map"]').click()
    cy.get('[data-cy="mouse-position"]').should('contain.text', coordStr)
}

function checkMousePositionNumberValue(expectedX, expectedY, parser) {
    cy.get('[data-cy="map"]').click()
    cy.get('[data-cy="mouse-position"]')
        .invoke('text')
        .then(parser)
        .then(checkXY(expectedX, expectedY))
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
            checkMousePositionNumberValue(2604624.64, 1261029.16, parseLV)
        })
        it('switches to LV03 when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.LV03)
            checkMousePositionNumberValue(604624.6, 261029.21, parseLV)
        })
        it('switches to MGRS when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.MGRS)
            checkMousePositionStringValue('32TLT 87030 61820')
        })
        it('switches to WebMercator when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(CoordinateSystems.WGS84)
            let dd = defaultCenter.map((value) => value.toFixed(5)).join(', ')
            checkMousePositionStringValue(`47° 30′ N 7° 30′ E (${dd})`)
        })
        it('goes back to LV95 display if selected again', () => {
            // Change display projection without moving the mouse
            getMousePositionAndSelect(CoordinateSystems.MGRS)
            getMousePositionAndSelect(CoordinateSystems.LV95)
            checkMousePositionNumberValue(2604624.64, 1261029.16, parseLV)
        })
    })
    context.skip('LocationPopUp when rightclick on the map', function () {
        const lat = 45
        const lon = 8
        beforeEach(() => {
            // Viewport set to see the whole popup
            cy.viewport(320, 1000)
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
            cy.fixture('service-alti/height.fixture').then((fakeheight) => {
                cy.get('[data-cy="location-popup-height"]').contains(fakeheight.height)
            })
        })
        context('Coordinates system test', () => {
            it('Uses the coordination system LV95 in the popup', () => {
                const LV95cord = proj4(proj4.WGS84, 'EPSG:2056', [lon, lat])
                cy.get('[data-cy="location-popup-coordinates-lv95"]')
                    .invoke('text')
                    .then(parseLV)
                    .then(checkXY(...LV95cord))
            })
            it('Uses the coordination system LV03 in the popup', () => {
                const LV03cord = proj4(proj4.WGS84, 'EPSG:21781', [lon, lat])
                cy.get('[data-cy="location-popup-coordinates-lv03"]')
                    .invoke('text')
                    .then(parseLV)
                    .then(checkXY(...LV03cord))
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
                    `421'184 4'983'436 (32T)`
                )
            })
            it('Uses the coordination system MGRS in the popup', () => {
                cy.get('[data-cy="location-popup-coordinates-mgrs"]').contains('32TMQ 21184 83436')
            })
            it('Tests the link with bowl crosshair gives the right coordinates', () => {
                cy.get('[data-cy="location-popup-link-bowl-crosshair"]')
                    .invoke('val')
                    .then((value) => {
                        const search = value.split('?')[1]
                        const params = new URLSearchParams(search)
                        return [parseFloat(params.get('lon')), parseFloat(params.get('lat'))]
                    })
                    .then(checkXY(lon, lat))
            })
            it('The QR code points to the right coordinates and has a crosshair', () => {
                const decoder = new Decoder()
                cy.get('[data-cy="location-popup-qr-code"').then(($element) => {
                    decoder
                        .scan($element.attr('src'))
                        .then((result) => {
                            const search = result.data.split('?')[1]
                            const params = new URLSearchParams(search)
                            expect(params.get('crosshair')).to.not.be.empty
                            return [parseFloat(params.get('lon')), parseFloat(params.get('lat'))]
                        })
                        .then(checkXY(lon, lat))
                })
            })
            it('The QR code updates when the layer config changes', () => {
                const decoder = new Decoder()
                cy.get('[data-cy="location-popup-qr-code"').then(($element) => {
                    decoder.scan($element.attr('src')).then((result) => {
                        result.data.includes('bgLayer=ch.swisstopo.pixelkarte-farbe')
                    })
                })
                cy.get('[data-cy="background-selector').click()
                cy.get('[data-cy="background-selector-void').click()
                cy.get('[data-cy="location-popup-qr-code"').then(($element) => {
                    decoder.scan($element.attr('src')).then((result) => {
                        result.data.includes('bgLayer=void')
                    })
                })
            })
        })
    })
})
