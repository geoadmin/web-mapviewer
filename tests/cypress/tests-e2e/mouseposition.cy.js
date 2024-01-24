/// <reference types="cypress" />

import proj4 from 'proj4'

import { BREAKPOINT_TABLET, DEFAULT_PROJECTION } from '@/config'
import {
    LV03Format,
    LV95Format,
    MGRSFormat,
    UTMFormat,
    WGS84Format,
} from '@/utils/coordinates/coordinateFormat'
import { LV03, LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'

/** @param {CoordinateFormat} format */
function getMousePositionAndSelect(format) {
    cy.get('[data-cy="mouse-position-select"]').should('be.visible')
    cy.get('[data-cy="mouse-position-select"]').select(format.id)
}

/**
 * Extracts an LV coordinate from a formatted string.
 *
 * @param {String} text A string containing an LV95 or LV03 coordinate.
 */
function parseLV(text) {
    const matches = text.match(/([-\d'.]+),\s*([-\d'.]+)$/)
    expect(matches).to.be.an('array', `Cannot parse LV coordinate from ${text}`)
    expect(matches.length).to.be.eq(3, `Cannot parse LV coordinate from ${text}`)
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

describe('Test mouse position and interactions', () => {
    const center = DEFAULT_PROJECTION.bounds.center.map((val) => val + 1000)
    const centerLV95 = proj4(DEFAULT_PROJECTION.epsg, LV95.epsg, center)
    const centerLV03 = proj4(DEFAULT_PROJECTION.epsg, LV03.epsg, center)
    const centerWGS84 = proj4(DEFAULT_PROJECTION.epsg, WGS84.epsg, center)
    const centerMGRS = MGRSFormat.format(center, DEFAULT_PROJECTION)

    context('Tablet/desktop tests', () => {
        before(() => {
            cy.skipTestsIf(
                Cypress.config('viewportWidth') < BREAKPOINT_TABLET,
                'This test will only be run on tablet and bigger viewports'
            )
        })
        beforeEach(() => {
            cy.goToMapView({
                center: center.join(','),
                z: DEFAULT_PROJECTION.getDefaultZoom() + 3,
            })
        })
        it('shows coordinate under the mouse cursor in the footer, according to the selected projection format', () => {
            checkMousePositionNumberValue(centerLV95[0], centerLV95[1], parseLV)

            getMousePositionAndSelect(LV03Format)
            checkMousePositionNumberValue(centerLV03[0], centerLV03[1], parseLV)

            getMousePositionAndSelect(MGRSFormat)
            checkMousePositionStringValue(centerMGRS)

            getMousePositionAndSelect(WGS84Format)
            checkMousePositionStringValue(WGS84Format.format(center, DEFAULT_PROJECTION, true))

            // Change display projection without moving the mouse
            getMousePositionAndSelect(MGRSFormat)
            getMousePositionAndSelect(LV95Format)
            checkMousePositionNumberValue(centerLV95[0], centerLV95[1], parseLV)
        })
    })
    context('Mobile only tests', () => {
        before(() => {
            cy.skipTestsIf(
                Cypress.config('viewportWidth') >= BREAKPOINT_TABLET,
                'This test will only be run on mobile'
            )
        })
        beforeEach(() => {
            cy.goToMapView({
                center: center.join(','),
                z: DEFAULT_PROJECTION.getDefaultZoom() + 3,
            })
        })
        it('shows the LocationPopUp when rightclick occurs on the map', () => {
            let shortUrl = 'https://s.geo.admin.ch/0000000'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl, success: true },
            }).as('shortlink')

            // location popup need a bit of room on the Y axis, otherwise it is half hidden (and Cypress complains)
            cy.viewport(320, 1000)
            cy.get('[data-cy="map"]').rightclick()

            cy.get('[data-cy="location-popup"]').should('be.visible')
            cy.log('the LocationPopUp is visible')

            cy.openDrawingMode()
            cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')
            cy.get('[data-cy="location-popup"]').should('not.exist')
            cy.log('the location popup has been hidden when entering drawing mode')

            cy.get('[data-cy="drawing-toolbox-close-button"]').click()
            // closing the menu if mobile
            cy.clickOnMenuButtonIfMobile()
            cy.get('[data-cy="map"]').rightclick()

            cy.wait('@convert-to-w3w')
            cy.fixture('what3word.fixture').then((fakeW3w) => {
                cy.get('[data-cy="location-popup-w3w"]').contains(fakeW3w.words)
            })
            cy.log('it uses the what3words API in the location popup')

            cy.wait('@coordinates-for-height')
            cy.fixture('service-alti/height.fixture').then((fakeheight) => {
                cy.get('[data-cy="location-popup-height"]').contains(fakeheight.height)
            })
            cy.log('it uses the elevation API in the location popup')

            const [lon, lat] = centerWGS84
            cy.get('[data-cy="location-popup-lv95"]')
                .invoke('text')
                .then(parseLV)
                .then(checkXY(...centerLV95))
            cy.log('it shows coordinates, correctly re-projected into LV95, in the popup')

            cy.get('[data-cy="location-popup-lv03"]')
                .invoke('text')
                .then(parseLV)
                .then(checkXY(...centerLV03))
            cy.log('it shows coordinates, correctly re-projected into LV03, in the popup')

            cy.get('[data-cy="location-popup-wgs84"]').contains(
                `${lat.toFixed(6)}, ${lon.toFixed(6)}`
            )
            cy.log('it shows correct plain WGS coordinates in the popup')

            cy.get('[data-cy="location-popup-extra-value-wgs84"]').contains(
                WGS84Format.format(center, DEFAULT_PROJECTION)
            )
            cy.log(
                'it uses the correct format to show a second line with WGS84 coordinates in the popup'
            )

            cy.get('[data-cy="location-popup-utm"]').contains(
                UTMFormat.format(center, DEFAULT_PROJECTION)
            )
            cy.log('it shows correct UTM coordinates in the popup')

            cy.get('[data-cy="location-popup-mgrs"]').contains(
                MGRSFormat.format(center, DEFAULT_PROJECTION)
            )
            cy.log('it shows correct MGRS coordinates in the popup')

            cy.get('[data-cy="location-popup-share-tab-button"]').realClick()

            cy.get(`[data-cy="share-shortlink-email"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-qrcode"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-facebook"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-twitter"]`).should('be.visible')
            cy.get('[data-cy="map"]').rightclick()

            shortUrl = 'https://s.geo.admin.ch/1111111'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl, success: true },
            }).as('shortlink')
            cy.get('[data-cy="map"]').trigger('mousemove', 0, 0, { force: true })
            cy.get('[data-cy="location-popup-share-tab-button"]').realClick()
            cy.get('[data-cy="menu-share-input-copy-button"]').should(
                'contain.value',
                'https://s.geo.admin.ch/1111111'
            )
            cy.log('link updated when new position selected')

            shortUrl = 'https://s.geo.admin.ch/2222222'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl, success: true },
            }).as('shortlink')
            cy.clickOnMenuButtonIfMobile()
            cy.clickOnLanguage('de')
            cy.clickOnMenuButtonIfMobile()
            cy.get('[data-cy="menu-share-input-copy-button"]').should(
                'contain.value',
                'https://s.geo.admin.ch/2222222'
            )
            cy.log('link updated when new language  selected')

            shortUrl = 'https://s.geo.admin.ch/3333333'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl, success: true },
            }).as('shortlink')

            cy.get('[data-cy="map"]').dblclick(120, 240)
            cy.get('[data-cy="map"]').rightclick()
            cy.get('[data-cy="location-popup-share-tab-button"]').focus()
            cy.get('[data-cy="location-popup-share-tab-button"]').click()
            cy.get('[data-cy="location-popup-share-tab-button"]').realClick()
            cy.get('[data-cy="location-popup-share-tab-check"]').should('have.class', 'fa-check')
            cy.readClipboardValue().then((clipboardText) => {
                expect(clipboardText).to.be.equal('https://s.geo.admin.ch/3333333')
            })
            cy.log('link copied to clipboard if share tab is pressed ')

            cy.get('[data-cy="map"]').rightclick()
            cy.wait('@shortlink').then((interception) => {
                expect(interception.request.body.url).be.a('string')
                const query = interception.request.body.url.split('?')[1]
                const params = new URLSearchParams(query)
                const position = params.get('center').split(',').map(parseFloat)
                checkXY(...position)
                expect(params.get('crosshair')).not.to.be.empty
            })
            cy.log('a link with crosshair and correct position is sent to shortlink')

            cy.get(`[data-cy="share-shortlink-email"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-qrcode"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-facebook"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-twitter"]`).should('be.visible')

            shortUrl = 'https://s.geo.admin.ch/4444444'
            cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: shortUrl, success: true },
            }).as('shortlink-bg-void')
            cy.writeStoreValue('setBackground', null)
            cy.wait('@shortlink-bg-void').then((interception) => {
                expect(interception.request.body.url).be.a('string')
                const query = interception.request.body.url.split('?')[1]
                const params = new URLSearchParams(query)
                expect(params.get('bgLayer')).to.be.equal('void')
            })
            cy.get('[data-cy="menu-share-input-copy-button"]').should(
                'have.value',
                'https://s.geo.admin.ch/4444444'
            )
            cy.log('the shortlink was updated when the app changed')
        })
    })
})
