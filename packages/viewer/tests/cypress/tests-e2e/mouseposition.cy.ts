/// <reference types="cypress" />

import { LV03, LV95, registerProj4, WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import { getServiceShortLinkBaseUrl } from '@/config/baseUrl.config'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import { BREAKPOINT_TABLET } from '@/config/responsive.config'
import {
    LV03Format,
    LV95Format,
    MGRSFormat,
    UTMFormat,
    WGS84Format,
} from '@/utils/coordinates/coordinateFormat'
import type { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'

registerProj4(proj4)

/** Selects a mouse position display format */
function getMousePositionAndSelect(format: CoordinateFormat) {
    cy.get('[data-cy="mouse-position-select"]').should('be.visible')
    cy.get('[data-cy="mouse-position-select"]').select(format.id)
}

/**
 * Extracts an LV coordinate from a formatted string.
 *
 * @param text A string containing an LV95 or LV03 coordinate.
 */
function parseLV(text: string): number[] {
    const matches = text.match(/([-\d'.]+),\s*([-\d'.]+)$/)
    expect(matches).to.be.an('array', `Cannot parse LV coordinate from ${text}`)
    expect(matches?.length).to.be.eq(3, `Cannot parse LV coordinate from ${text}`)
    return (matches as RegExpMatchArray)
        .slice(1)
        .map((value) => value.replace(/'/g, ''))
        .map(parseFloat)
}

/**
 * Checks if a coordinate is close to the expected values.
 *
 * @param expectedX The expected x value.
 * @param expectedY The expected y value.
 */
function checkXY(expectedX: number, expectedY: number) {
    return function (coordinate: number[]) {
        const [x, y] = coordinate
        expect(x).to.be.closeTo(expectedX, 0.1)
        expect(y).to.be.closeTo(expectedY, 0.1)
    }
}

function checkMousePositionStringValue(coordStr: string) {
    cy.get('[data-cy="map"]').click()
    cy.waitUntilState((state) => {
        return state.map.clickInfo !== null
    })
    cy.get('[data-cy="mouse-position"]').should('contain.text', coordStr)
}

function checkMousePositionNumberValue(
    expectedX: number,
    expectedY: number,
    parser: (_text: string) => number[]
) {
    cy.get('[data-cy="map"]').click()
    cy.waitUntilState((state) => {
        return state.map.clickInfo !== null
    })
    cy.get('[data-cy="mouse-position"]')
        .invoke('text')
        .then(parser)
        .then(checkXY(expectedX, expectedY))
}

/**
 * Will skip this test (or all tests if this is run inside a context/describe) when the
 * condition is true.
 *
 * @param condition
 * @param message A message to log in case tests are skipped
 */
function skipTestsIf(condition: boolean, message?: string) {
    if (condition) {
        if (message) {
            Cypress.log({
                name: 'skipTestsIf',
                message,
            })
        }
        const mochaContext = (cy.state('runnable')).ctx
        mochaContext?.skip()
    }
}

describe('Test mouse position and interactions', () => {
    const center = DEFAULT_PROJECTION.bounds.center.map((val: number) => val + 1000)
    const centerLV95 = proj4(DEFAULT_PROJECTION.epsg, LV95.epsg, center) as [number, number]
    const centerLV03 = proj4(DEFAULT_PROJECTION.epsg, LV03.epsg, center) as [number, number]
    const centerWGS84 = proj4(DEFAULT_PROJECTION.epsg, WGS84.epsg, center) as [number, number]
    const centerMGRS = MGRSFormat.format(center, DEFAULT_PROJECTION)

    context('Tablet/desktop tests', () => {
        before(() => {
            const viewportWidth = Cypress.config('viewportWidth')
            skipTestsIf(
                viewportWidth < BREAKPOINT_TABLET,
                'This test will only be run on tablet and bigger viewports'
            )
        })
        beforeEach(() => {
            cy.goToMapView({
                queryParams: {
                    center: center.join(','),
                    z: DEFAULT_PROJECTION.getDefaultZoom() + 3,
                },
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
            const viewportWidth = Cypress.config('viewportWidth')
            skipTestsIf(
                viewportWidth >= BREAKPOINT_TABLET,
                'This test will only be run on mobile'
            )
        })
        beforeEach(() => {
            cy.goToMapView({
                queryParams: {
                    center: center.join(','),
                    z: DEFAULT_PROJECTION.getDefaultZoom() + 2.23,
                },
            })
        })
        it('shows the LocationPopUp when rightclick occurs on the map', () => {
            function stubShortLinkResponse(shortLinkStub: string) {
                cy.intercept(`${getServiceShortLinkBaseUrl()}**`, {
                    body: { shorturl: shortLinkStub, success: true },
                }).as('shortlink')
            }
            // Verify that double click on the map zooms in to a full integer zoom level
            cy.url().should('include', 'z=3.23')
            cy.get('[data-cy="ol-map"]').should('be.visible').dblclick()
            cy.url().should('include', 'z=4')

            const fakeLV03Coordinate: [number, number] = [1234.56, 7890.12]
            cy.intercept('**/lv95tolv03**', { coordinates: fakeLV03Coordinate }).as('reframe')
            stubShortLinkResponse('https://s.geo.admin.ch/000000')

            // location popup need a bit of room on the Y axis, otherwise it is half hidden (and Cypress complains)
            cy.viewport(320, 1000)
            cy.get('[data-cy="map"]').rightclick()
            cy.wait('@convert-to-w3w')
            cy.wait('@coordinates-for-height')

            cy.get('[data-cy="location-popup"]').should('be.visible')
            cy.log('the LocationPopUp is visible')

            cy.openDrawingMode()
            cy.readStoreValue('state.drawing.drawingOverlay.show').should('be.true')
            cy.get('[data-cy="location-popup"]').should('not.exist')
            cy.log('the location popup has been hidden when entering drawing mode')

            cy.closeDrawingMode()

            // closing the menu if mobile
            cy.closeMenuIfMobile()

            cy.get('[data-cy="ol-map"]').should('be.visible').rightclick()

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

            cy.wait('@reframe')
            cy.get('[data-cy="location-popup-lv03"]')
                .invoke('text')
                .then(parseLV)
                .then(checkXY(...fakeLV03Coordinate))
            cy.log('it shows coordinates, correctly re-projected into LV03, in the popup')

            cy.get('[data-cy="location-popup-wgs84"]').contains(
                `${lat.toFixed(6)}, ${lon.toFixed(6)}`
            )
            cy.log('it shows correct plain WGS coordinates in the popup')

            cy.get('[data-cy="location-popup-wgs84-extra-value"]').contains(
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

            cy.log('Test that it creates a shortlink when opening the share tab')
            cy.get('[data-cy="location-popup-share-tab-button"]').click()

            cy.log('Test that the shortlink is made with crosshair and correct position')
            cy.wait('@shortlink').should((interception) => {
                const url = interception.request.body.url
                expect(url).be.a('string')
                const query = url.split('?')[1]
                const params = new URLSearchParams(query)
                const centerParam = params.get('center')
                expect(centerParam).to.be.a('string')
                cy.assertDefined(centerParam)
                const position = centerParam.split(',').map(parseFloat)
                checkXY(...(position as [number, number]))
                expect(params.get('crosshair')).not.to.be.empty
            })
            cy.log('Test that the shortlink is copied to clipboard if share tab is pressed')
            cy.readClipboardValue().should((clipboardText) => {
                expect(clipboardText).to.be.equal('https://s.geo.admin.ch/000000')
            })

            cy.get(`[data-cy="share-shortlink-email"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-qrcode"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-facebook"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-twitter"]`).should('be.visible')
            cy.get(`[data-cy="share-shortlink-whatsapp"]`).should('be.visible')

            cy.get('[data-cy="menu-share-input-copy-text"]').should(
                'contain.value',
                'https://s.geo.admin.ch/000000'
            )

            cy.log('Test that the shortlink is updated when new language selected')
            stubShortLinkResponse('https://s.geo.admin.ch/111111')
            cy.openMenuIfMobile()
            cy.clickOnLanguage('de')
            cy.closeMenuIfMobile()
            cy.wait('@shortlink')
            cy.get('[data-cy="menu-share-input-copy-text"]').should(
                'contain.value',
                'https://s.geo.admin.ch/111111'
            )

            cy.log('Test that changing layers (background) triggers a new shortlink generation')
            stubShortLinkResponse('https://s.geo.admin.ch/222222')
            cy.get('[data-cy="background-selector-open-wheel-button"]').click()
            cy.get('[data-cy="background-selector-void"]').click()
            cy.wait('@shortlink').then((interception) => {
                const url = interception.request.body.url
                expect(url).be.a('string')
                const query = url.split('?')[1]
                const params = new URLSearchParams(query)
                expect(params.get('bgLayer')).to.be.equal('void')
            })
            cy.get('[data-cy="menu-share-input-copy-text"]').should(
                'have.value',
                'https://s.geo.admin.ch/222222'
            )
        })
    })
})