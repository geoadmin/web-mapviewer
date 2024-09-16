/// <reference types="cypress" />

import { DEFAULT_PROJECTION } from '@/config/map.config'
import { STANDARD_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/CoordinateSystem.class'
import { LV03, LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { reprojectAndRound } from '@/utils/coordinates/coordinateUtils'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { latLonToMGRS } from '@/utils/militaryGridProjection'

const searchbarSelector = '[data-cy="searchbar"]'

describe('Testing coordinates typing in search bar', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    const expectedCenter = DEFAULT_PROJECTION.bounds.center.map((value) => value - 1000)
    const expectedCenterLV95 = reprojectAndRound(DEFAULT_PROJECTION, LV95, expectedCenter)
    const expectedCenterLV03 = reprojectAndRound(DEFAULT_PROJECTION, LV03, expectedCenter)
    const expectedCenterWebMercator = reprojectAndRound(
        DEFAULT_PROJECTION,
        WEBMERCATOR,
        expectedCenter
    )
    const expectedCenterWGS84 = reprojectAndRound(DEFAULT_PROJECTION, WGS84, expectedCenter)

    const checkCenterInStore = (acceptableDelta = 0.0) => {
        cy.log(`Check that center is at ${JSON.stringify(expectedCenter)}`)
        cy.readStoreValue('state.position.center').should((center) => {
            expect(center[0]).to.be.approximately(expectedCenter[0], acceptableDelta)
            expect(center[1]).to.be.approximately(expectedCenter[1], acceptableDelta)
        })
    }
    const checkZoomLevelInStore = () => {
        // checking that the zoom level is at the 1:25'000 map level after a coordinate input in the search bar
        let expectedZoomLevel = STANDARD_ZOOM_LEVEL_1_25000_MAP
        if (DEFAULT_PROJECTION instanceof CustomCoordinateSystem) {
            expectedZoomLevel = DEFAULT_PROJECTION.transformStandardZoomLevelToCustom(
                STANDARD_ZOOM_LEVEL_1_25000_MAP
            )
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
    const standardCheck = (x, y, options = {}) => {
        const { acceptableDelta = 0.0, withInversion = false } = options
        cy.get(searchbarSelector).should('be.visible')
        cy.get(searchbarSelector).paste(`${x} ${y}`)
        checkCenterInStore(acceptableDelta)
        checkZoomLevelInStore()
        checkThatCoordinateAreHighlighted(acceptableDelta)
        if (withInversion) {
            cy.get(searchbarSelector).clear()
            cy.get(searchbarSelector).paste(`${y} ${x}`)
            checkCenterInStore(acceptableDelta)
            checkZoomLevelInStore()
            checkThatCoordinateAreHighlighted(acceptableDelta)
        }
    }

    it('Paste and clear LV95 coordinates in search bar', () => {
        standardCheck(expectedCenterLV95[0], expectedCenterLV95[1], { withInversion: true })
        cy.get('[data-cy="searchbar-clear"]').click()
        // checking that search bar has been emptied
        cy.readStoreValue('state.search.query').should('be.empty')
        // checking that the dropped pin has been removed
        cy.readStoreValue('state.map.pinnedLocation').should('be.null')
    })

    it('Paste EPSG:4326 (WGS84) coordinate', () => {
        const expectedCenterWGS84_DD = expectedCenterWGS84.map((val) => {
            const [degree, minutesFraction] = `${val}`.split('.')
            const minutes = parseFloat(`0.${minutesFraction}`)
            return `${degree}° ${(minutes * 60.0).toFixed(4)}'`
        })
        const acceptableDelta = 0.25
        standardCheck(expectedCenterWGS84[0], expectedCenterWGS84[1], {
            acceptableDelta,
            withInversion: true,
        })
        // clear the bar
        cy.get('[data-cy="searchbar-clear"]').click()
        // checking that search bar has been emptied
        cy.readStoreValue('state.search.query').should('be.empty')
        standardCheck(expectedCenterWGS84_DD[0], expectedCenterWGS84_DD[1], {
            acceptableDelta,
            withInversion: true,
        })
    })

    it('Paste EPSG:3857 (Web-Mercator) coordinate', () => {
        const acceptableDelta = 0
        standardCheck(expectedCenterWebMercator[0], expectedCenterWebMercator[1], {
            acceptableDelta,
        })
    })

    it('Paste EPSG:21781 (LV03) coordinates', () => {
        cy.intercept('**/lv03tolv95**', {
            coordinates: expectedCenter,
        })
        standardCheck(expectedCenterLV03[0], expectedCenterLV03[1], {
            acceptableDelta: 0.1,
            withInversion: true,
        })
    })

    context('What3Words input', () => {
        const what3words = 'bisher.meiste.einerseits'
        // creating a what3words response stub
        const w3wStub = {
            country: 'CH',
            coordinates: {
                lng: expectedCenterWGS84[0],
                lat: expectedCenterWGS84[1],
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
            checkCenterInStore(1.0)
            checkZoomLevelInStore()
            checkThatCoordinateAreHighlighted(1.0)
        })
    })

    it('Paste MGRS input', () => {
        // as MGRS is a 1m based grid, the point could be anywhere in the square of 1m x 1m, we then accept a 1m delta
        const acceptableDeltaForMGRS = 1
        const mgrsCoordinates = latLonToMGRS(expectedCenterWGS84[1], expectedCenterWGS84[0])
        cy.log(`Enter MGRS ${mgrsCoordinates} in search bar`)
        cy.get(searchbarSelector).paste(mgrsCoordinates)
        checkCenterInStore(acceptableDeltaForMGRS)
        checkZoomLevelInStore()
        checkThatCoordinateAreHighlighted(acceptableDeltaForMGRS)
    })
})
