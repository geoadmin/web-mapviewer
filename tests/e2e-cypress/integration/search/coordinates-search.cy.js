/// <reference types="cypress" />

import { DEFAULT_PROJECTION } from '@/config'
import { LV03, LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/SwissCoordinateSystem.class'
import proj4 from 'proj4'

const searchbarSelector = '[data-cy="searchbar"]'

describe('Testing coordinates typing in search bar', { testIsolation: false }, () => {
    // in order to ease test run, we only load the page once at the beginning of this context
    // so that it doesn't load the page for each copy/paste in the search bar
    before(() => {
        cy.goToMapView()
    })
    beforeEach(() => {
        // emptying any potential search query
        cy.readStoreValue('state.search.query').then((searchQuery) => {
            if (searchQuery && searchQuery.length > 0) {
                cy.get('[data-cy="searchbar-clear"]').click()
                // replacing the view somewhere else in order to check that
                // subsequent coordinate search will place the view at the correct location
                cy.writeStoreValue('setZoom', DEFAULT_PROJECTION.getDefaultZoom())
                cy.writeStoreValue('setCenter', DEFAULT_PROJECTION.bounds.center)
            }
        })
    })
    const expectedCenter = DEFAULT_PROJECTION.bounds.center.map((value) => value - 1000)
    const expectedCenterLV95 = proj4(DEFAULT_PROJECTION.epsg, LV03.epsg, expectedCenter).map(
        LV03.roundCoordinateValue
    )
    const expectedCenterLV03 = proj4(DEFAULT_PROJECTION.epsg, LV03.epsg, expectedCenter).map(
        LV03.roundCoordinateValue
    )
    const expectedCenterWebMercator = proj4(
        DEFAULT_PROJECTION.epsg,
        WEBMERCATOR.epsg,
        expectedCenter
    ).map(WEBMERCATOR.roundCoordinateValue)
    const centerWGS84 = proj4(DEFAULT_PROJECTION.epsg, WGS84.epsg, expectedCenter).map(
        WGS84.roundCoordinateValue
    )

    const checkCenterInStore = (acceptableDelta = 0.0) => {
        cy.readStoreValue('state.position.center').should((center) => {
            expect(center[0]).to.be.approximately(expectedCenter[0], acceptableDelta)
            expect(center[1]).to.be.approximately(expectedCenter[1], acceptableDelta)
        })
    }
    const checkZoomLevelInStore = () => {
        // checking that the zoom level is at the 1:25'000 map level after a coordinate input in the search bar
        let expectedZoomLevel = STANDARD_ZOOM_LEVEL_1_25000_MAP
        if (DEFAULT_PROJECTION instanceof CustomCoordinateSystem) {
            expectedZoomLevel =
                DEFAULT_PROJECTION.transformStandardZoomLevelToCustom(expectedZoomLevel)
        }
        cy.readStoreValue('state.position.zoom').should('be.eq', expectedZoomLevel)
    }
    const checkThatCoordinateAreHighlighted = (acceptableDelta = 0.0) => {
        // checking that a balloon marker has been put on the coordinate location (that it is a highlighted location in the store)
        cy.readStoreValue('state.map.pinnedLocation').should((feature) => {
            expect(feature).to.not.be.null
            expect(feature).to.be.a('array').that.is.not.empty
            expect(feature[0]).to.be.approximately(expectedCenter[0], acceptableDelta)
            expect(feature[1]).to.be.approximately(expectedCenter[1], acceptableDelta)
        })
    }
    const numberWithThousandSeparator = (x, separator = "'") => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    }
    const standardCheck = (x, y, title, acceptableDelta = 0.0) => {
        it(title, () => {
            cy.get(searchbarSelector).paste(`${x} ${y}`)
            checkCenterInStore(acceptableDelta)
            checkZoomLevelInStore()
            checkThatCoordinateAreHighlighted(acceptableDelta)
        })
        it(`${title} with comma as a separator`, () => {
            cy.get(searchbarSelector).paste(`${x}, ${y}`)
            checkCenterInStore(acceptableDelta)
            checkZoomLevelInStore()
            checkThatCoordinateAreHighlighted(acceptableDelta)
        })
        it(`${title} with slash as a separator`, () => {
            cy.get(searchbarSelector).paste(`${x}/${y}`)
            checkCenterInStore(acceptableDelta)
            checkZoomLevelInStore()
            checkThatCoordinateAreHighlighted(acceptableDelta)
        })
    }
    const tryAllInputPossibilities = (
        x,
        y,
        coordType,
        acceptableDelta = 0.0,
        withBackwardInputCheck = false,
        withThousandSeparatorCheck = false
    ) => {
        const mainTitle = `sets center accordingly when ${coordType} coordinates are entered in the search bar`
        standardCheck(x, y, mainTitle, acceptableDelta)
        if (withBackwardInputCheck) {
            standardCheck(y, x, `${mainTitle} with coordinates entered backward`, acceptableDelta)
        }
        if (withThousandSeparatorCheck) {
            standardCheck(
                numberWithThousandSeparator(x, "'"),
                numberWithThousandSeparator(y, "'"),
                `${mainTitle} with ' as thousand separator`,
                acceptableDelta
            )
            standardCheck(
                numberWithThousandSeparator(x, ' '),
                numberWithThousandSeparator(y, ' '),
                `${mainTitle} with space as thousand separator`,
                acceptableDelta
            )
        }
        if (withThousandSeparatorCheck && withBackwardInputCheck) {
            standardCheck(
                numberWithThousandSeparator(y, "'"),
                numberWithThousandSeparator(x, "'"),
                `${mainTitle} with ' as thousand separator`,
                acceptableDelta
            )
            standardCheck(
                numberWithThousandSeparator(y, ' '),
                numberWithThousandSeparator(x, ' '),
                `${mainTitle} with space as thousand separator`,
                acceptableDelta
            )
        }
    }

    it('find the searchbar in the UI', () => {
        cy.get(searchbarSelector).should('be.visible')
    })
    it('Remove the dropped pin when the search bar is cleared', () => {
        cy.get(searchbarSelector).paste(`${expectedCenterLV95[0]} ${expectedCenterLV95[1]}`)
        checkCenterInStore()
        checkZoomLevelInStore()
        checkThatCoordinateAreHighlighted()
        cy.get('[data-cy="searchbar-clear"]').click()
        // checking that search bar has been emptied
        cy.readStoreValue('state.search.query').should('be.empty')
        // checking that the dropped pin has been removed
        cy.readStoreValue('state.map.pinnedLocation').should('be.null')
    })

    context('EPSG:4326 (Web-Mercator) inputs', () => {
        // the search bar only supports input in lat/lon format, so X is lat
        const WGS84_DM = ["47°12.6095'", "6°57.12372'"]
        const WGS84_DM_GOOGLE_STYLE = ['47 12.6095', '6 57.12372']
        const WGS84_DMS = ['47°12\'36.57"', '6°57\'7.423"']
        const WGS84_DMS_WITH_CARDINAL = ['47°12\'36.57"N', '6°57\'7.423"E']
        tryAllInputPossibilities(centerWGS84[1], centerWGS84[0], 'DD format')
        tryAllInputPossibilities(WGS84_DM[0], WGS84_DM[1], 'DM format')
        tryAllInputPossibilities(
            WGS84_DM_GOOGLE_STYLE[0],
            WGS84_DM_GOOGLE_STYLE[1],
            'DM format (Google style)'
        )
        tryAllInputPossibilities(WGS84_DMS[0], WGS84_DMS[1], 'DMS format')
        tryAllInputPossibilities(
            WGS84_DMS_WITH_CARDINAL[0],
            WGS84_DMS_WITH_CARDINAL[1],
            'DMS format with cardinal point'
        )
        tryAllInputPossibilities(
            WGS84_DMS_WITH_CARDINAL[1],
            WGS84_DMS_WITH_CARDINAL[0],
            'inverted DMS format with cardinal point'
        )
    })
    context('EPSG:2056 (LV95) inputs', () => {
        tryAllInputPossibilities(
            expectedCenterLV95[0],
            expectedCenterLV95[1],
            'LV95',
            0.0,
            true,
            true
        )
    })
    context('EPSG:21781 (LV03) inputs', () => {
        tryAllInputPossibilities(
            expectedCenterLV03[0],
            expectedCenterLV03[1],
            'LV03',
            0.1,
            true,
            true
        )
    })
    context('What3Words input', () => {
        const what3words = 'bisher.meiste.einerseits'
        // creating a what3words response stub
        const w3wStub = {
            country: 'CH',
            coordinates: {
                lat: centerWGS84[0],
                lng: centerWGS84[1],
            },
            words: what3words,
            language: 'en',
            map: `https://w3w.co/${what3words}`,
        }
        it('Calls the what3words backend when a what3words is entered in the searchbar', () => {
            // intercepting what3words request and stub it with whatever we want
            cy.intercept('**/convert-to-coordinates**', w3wStub).as('w3w-convert')
            cy.get(searchbarSelector).paste(what3words)
            // checking that the request to W3W has been made (and caught by Cypress)
            cy.wait('@w3w-convert')
            checkCenterInStore(1)
            checkZoomLevelInStore()
            checkThatCoordinateAreHighlighted(1)
        })
    })
    context('MGRS input', () => {
        const MGRS = '32TLT 44918 30553'
        // as MGRS is a 1m based grid, the point could be anywhere in the square of 1m x 1m, we then accept a 1m delta
        const acceptableDeltaForMGRS = 1

        it('sets center accordingly when a MGRS input is given', () => {
            cy.get(searchbarSelector).paste(MGRS)
            checkCenterInStore(acceptableDeltaForMGRS)
            checkZoomLevelInStore()
            checkThatCoordinateAreHighlighted(acceptableDeltaForMGRS)
        })
    })
})
