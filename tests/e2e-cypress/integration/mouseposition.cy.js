/// <reference types="cypress" />

import { DEFAULT_PROJECTION } from '@/config'
import {
    LV03Format,
    LV95Format,
    MGRSFormat,
    WGS84Format,
} from '@/utils/coordinates/coordinateFormat'
import { LV03, LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import setupProj4 from '@/utils/setupProj4'
import proj4 from 'proj4'

setupProj4()

/** @param {CoordinateFormat} format */
function getMousePositionAndSelect(format) {
    cy.get('[data-cy="mouse-position-select"]').should('be.visible')
    cy.get('[data-cy="mouse-position-select"]').select(format.id)
}

const defaultCenter = [7.5, 47.5]

/**
 * Extracts an LV coordinate from a formatted string.
 *
 * @param {String} text A string containing an LV95 or LV03 coordinate.
 */
function parseLV(text) {
    const matches = text.match(/([-\d'.]+),\s*([-\d'.]+)$/)
    expect(matches).be.an('array', `Cannot parse LV coordinate from ${text}`)
    expect(matches.length).not.be.eq(0, `Cannot parse LV coordinate from ${text}`)
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
    cy.waitUntilState((state) => {
        return state.map.clickInfo !== null
    })
    cy.get('[data-cy="mouse-position"]').should('contain.text', coordStr)
}

function checkMousePositionNumberValue(expectedX, expectedY, parser) {
    cy.get('[data-cy="map"]').click()
    cy.waitUntilState((state) => {
        return state.map.clickInfo !== null
    })
    cy.get('[data-cy="mouse-position"]')
        .invoke('text')
        .then(parser)
        .then(checkXY(expectedX, expectedY))
}

describe('Test mouse position', () => {
    context('Position in footer', () => {
        beforeEach(() => {
            cy.viewport('ipad-2')
            cy.goToMapView({
                center: proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, defaultCenter),
                z: 12,
            })
            // waiting for OL to be loaded before testing
            cy.get('[data-cy="ol-map"]').should('be.visible')
        })
        it('Shows LV95 coordinates by default', () => {
            checkMousePositionNumberValue(2604624.64, 1261029.16, parseLV)
        })
        it('switches to LV03 when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(LV03Format)
            checkMousePositionNumberValue(604624.6, 261029.21, parseLV)
        })
        it('switches to MGRS when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(MGRSFormat)
            checkMousePositionStringValue('32TLT 87030 61820')
        })
        it('switches to WebMercator when this SRS is selected in the UI', () => {
            getMousePositionAndSelect(WGS84Format)
            let dd = defaultCenter
                .slice()
                .reverse()
                .map((value) => value.toFixed(WGS84.acceptableDecimalPoints))
                .join(', ')
            checkMousePositionStringValue(`47° 30′ N 7° 30′ E (${dd})`)
        })
        it('goes back to LV95 display if selected again', () => {
            // Change display projection without moving the mouse
            getMousePositionAndSelect(MGRSFormat)
            getMousePositionAndSelect(LV95Format)
            checkMousePositionNumberValue(2604624.64, 1261029.16, parseLV)
        })
    })
    context('Fullscreen trigger', function () {
        it('Activates fullscreen when nothing is under the cursor', () => {
            cy.goToMapView()
            cy.activateFullscreen()
            cy.readStoreValue('getters.isPhoneMode').then((isPhoneMode) => {
                if (isPhoneMode) {
                    cy.get('[data-cy="map"]').click('center')
                    cy.waitUntilState((state) => !state.ui.fullscreenMode)
                }
            })
        })
    })
    context('LocationPopUp when rightclick on the map', function () {
        const lat = 45
        const lon = 8
        const center = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [lon, lat])
        beforeEach(() => {
            // Viewport set to see the whole popup
            cy.intercept(`**/api/qrcode/generate**`, {
                fixture: 'service-qrcode/position-popup.png',
            }).as('qrcode')
            cy.intercept(`**/api/icons/*`, { statusCode: 200 }).as('icons')
            cy.viewport(320, 1000)
            cy.goToMapView({ center })
            cy.get('[data-cy="map"]').rightclick()
            cy.waitUntilState((state) => {
                return state.map.clickInfo !== null
            })
        })
        it('Test the LocationPopUp is visible', () => {
            cy.get('[data-cy="location-popup"]').should('be.visible')
        })
        it('Test that LocationPopUp is hidden on entering drawing mode', () => {
            cy.get('[data-cy="location-popup"]').should('be.visible')
            cy.openDrawingMode()
            cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')
            cy.get('[data-cy="location-popup"]').should('not.exist')
        })
        it('Test that it prevents direct activation of the full screen', () => {
            cy.get('[data-cy="location-popup"]').should('be.visible')
            cy.get('[data-cy="map"]').click(150, 150)
            cy.get('[data-cy="location-popup"]').should('not.exist')
            cy.activateFullscreen()
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
                const LV95cord = proj4(WGS84.epsg, LV95.epsg, [lon, lat])
                cy.get('[data-cy="location-popup-coordinates-lv95"]')
                    .invoke('text')
                    .then(parseLV)
                    .then(checkXY(...LV95cord))
            })
            it('Uses the coordination system LV03 in the popup', () => {
                const LV03cord = proj4(WGS84.epsg, LV03.epsg, [lon, lat])
                cy.get('[data-cy="location-popup-coordinates-lv03"]')
                    .invoke('text')
                    .then(parseLV)
                    .then(checkXY(...LV03cord))
            })
            it('Uses the coordination system Plain WGS84 in the popup', () => {
                cy.get('[data-cy="location-popup-coordinates-plain-wgs84"]').contains(
                    `${lat.toFixed(WGS84.acceptableDecimalPoints)}, ${lon.toFixed(
                        WGS84.acceptableDecimalPoints
                    )}`
                )
            })
            it('Uses the coordination system WGS84 in the popup', () => {
                cy.get('[data-cy="location-popup-coordinates-wgs84"]').contains(
                    `${lat}° N ${lon}° E`
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
        })
    })
    context('LocationPopUp when rightclick on the map - shortlink and qrcode', function () {
        const lat = 45
        const lon = 8
        const center = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [lon, lat])
        beforeEach(() => {
            cy.viewport(320, 1000)
            cy.goToMapView({ center })
        })
        it('Tests that a link with crosshair and correct position is sent to shortlink', () => {
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: 'https://s.geo.admin.ch/0000000', success: true },
            }).as('shortlink')
            cy.get('[data-cy="map"]').rightclick()
            cy.wait('@shortlink').then((interception) => {
                expect(interception.request.body.url).be.a('string')
                const query = interception.request.body.url.split('?')[1]
                const params = new URLSearchParams(query)
                const position = params.get('center').split(',').map(parseFloat)
                checkXY(...position)
                expect(params.get('crosshair')).not.to.be.empty
            })
        })
        it('Tests that the shortlink updates when the layer config changes', () => {
            const shortUrl1 = 'https://s.geo.admin.ch/0000000'
            cy.intercept('POST', /^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl1, success: true },
            }).as('shortlink')
            cy.intercept(`**/api/qrcode/generate**`, {
                fixture: 'service-qrcode/position-popup.png',
            }).as('qrcode')

            cy.get('[data-cy="map"]').rightclick()
            cy.wait('@shortlink').then((interception) => {
                expect(interception.request.body.url).be.a('string')
                const query = interception.request.body.url.split('?')[1]
                const params = new URLSearchParams(query)
                cy.fixture('topics.fixture').then((data) => {
                    const [defaultTopic] = data.topics
                    expect(params.get('bgLayer')).to.be.equal(defaultTopic.defaultBackground)
                })
            })
            cy.get('[data-cy="location-popup-link-input"]').should('have.value', shortUrl1)

            const shortUrl2 = 'https://s.geo.admin.ch/1111111'
            cy.intercept('POST', /^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl2, success: true },
            }).as('shortlink-bg-void')
            cy.writeStoreValue('setBackground', null)
            cy.wait('@shortlink-bg-void').then((interception) => {
                expect(interception.request.body.url).be.a('string')
                const query = interception.request.body.url.split('?')[1]
                const params = new URLSearchParams(query)
                expect(params.get('bgLayer')).to.be.equal('void')
            })
            cy.get('[data-cy="location-popup-link-input"]').should('have.value', shortUrl2)
        })
        it('Tests that a shortlink is passed to qrcode', () => {
            const shortUrl = 'https://s.geo.admin.ch/0000000'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl, success: true },
            }).as('shortlink')
            cy.intercept(`**/api/qrcode/generate**`, {
                fixture: 'service-qrcode/position-popup.png',
            }).as('qrcode')
            cy.get('[data-cy="map"]').rightclick()
            cy.wait('@qrcode').then((interception) => {
                expect(interception.request.url).not.to.be.empty
                expect(interception.request.url).to.include('?')
                const query = interception.request.url.split('?')[1]
                const params = new URLSearchParams(query)
                expect(params.get('url')).to.be.equal(shortUrl)
            })
        })
        it('Tests that the QR code updates when the layer config changes', () => {
            const shortUrl1 = 'https://s.geo.admin.ch/0000000'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl1, success: true },
            }).as('shortlink')
            cy.intercept(`**/api/qrcode/generate**`, {
                fixture: 'service-qrcode/position-popup.png',
            }).as('qrcode')
            cy.get('[data-cy="map"]').rightclick()
            cy.wait('@qrcode').then((interception) => {
                expect(interception.request.url).not.to.be.empty
                expect(interception.request.url).to.include('?')
                const query = interception.request.url.split('?')[1]
                const params = new URLSearchParams(query)
                expect(params.get('url')).to.be.equal(shortUrl1)
            })
            cy.get('[data-cy="location-popup-qr-code"').then(($element) => {
                expect($element.attr('src')).not.to.be.empty
            })

            const shortUrl2 = 'https://s.geo.admin.ch/1111111'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl2, success: true },
            }).as('shortlink')
            cy.writeStoreValue('setBackground', null)
            cy.wait('@qrcode').then((interception) => {
                expect(interception.request.url).not.to.be.empty
                expect(interception.request.url).to.include('?')
                const query = interception.request.url.split('?')[1]
                const params = new URLSearchParams(query)
                expect(params.get('url')).to.be.equal(shortUrl2)
            })
            cy.get('[data-cy="location-popup-qr-code"').then(($element) => {
                expect($element.attr('src')).not.to.be.empty
            })
        })
    })
})
