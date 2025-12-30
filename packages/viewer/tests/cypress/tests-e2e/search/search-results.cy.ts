/// <reference types="cypress" />

import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'

import { registerProj4, WGS84 } from '@swissgeo/coordinates'
import { BREAKPOINT_TABLET } from '@swissgeo/staging-config/constants'
import proj4 from 'proj4'
import { assertDefined } from 'support/utils'

import { DEFAULT_PROJECTION } from '@/config'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import { CrossHairs } from '@/store/modules/position/types'
import useSearchStore from '@/store/modules/search'

registerProj4(proj4)

const searchbarSelector = '[data-cy="searchbar"]'
const locationsSelector = '[data-cy="search-results-locations"]'
const layersSelector = '[data-cy="search-results-layers"]'

const viewportHeight = Cypress.config('viewportHeight')
const viewportWidth = Cypress.config('viewportWidth')

/**
 * Configurable `.then` callback to check element index among siblings.
 *
 * @param expected The expected index of the tested element.
 * @param message The error message in case of failure.
 * @returns Callback function for `.then`.
 */
function checkSiblingIndex(
    expected: number,
    message?: string
): (_element: JQuery<HTMLElement>) => JQuery<HTMLElement> {
    return function ($element) {
        const $siblings = $element.parent().children()
        expect($siblings.index($element), message).to.equal(expected)
        return $element
    }
}

/**
 * Configurable `.then` callback to check element's ancestor.
 *
 * @param selector The ancestor to look for.
 * @param message The error message in case of failure.
 * @returns {Function} Callback function for `.then`.
 */
function checkDescendantOf(
    selector: string | JQuery | Element,
    message?: string
): (_element: JQuery<HTMLElement>) => JQuery<HTMLElement> {
    return function ($element) {
        const $ancestor = $element.closest(selector)
        expect($ancestor, message).to.have.length(1)
        return $element
    }
}
const acceptedDelta = 0.1
const checkLocation = (expected: number[], result: number[]) => {
    expect(result).to.be.an('Array')
    expect(result.length).to.eq(2)
    expect(result[0]).to.approximately(expected[0]!, acceptedDelta)
    expect(result[1]).to.approximately(expected[1]!, acceptedDelta)
}

interface TestQueryParams {
    searchQuery: string
    expectedCenter: number[]
    expectedPinnedLocation: number[]
    expectedCrosshair: string | undefined
    expectedCrosshairPosition: number[] | undefined
}

function testQueryPositionCrosshairStore({
    searchQuery,
    expectedCenter,
    expectedPinnedLocation,
    expectedCrosshair,
    expectedCrosshairPosition,
}: TestQueryParams): void {
    // check the query
    cy.getPinia().should((pinia) => {
        const searchStore = useSearchStore(pinia)
        cy.wrap(searchStore).its('query').should('eq', searchQuery)
    })
    // check the center of the map
    cy.getPinia().should((pinia) => {
        const positionStore = usePositionStore(pinia)
        cy.wrap(positionStore)
            .its('center')
            .should((center) => checkLocation(expectedCenter, center))
        // check the crosshair
        cy.wrap(positionStore).its('crossHair').should('eq', expectedCrosshair)

        // check the crosshair position
        if (expectedCrosshairPosition !== undefined) {
            cy.wrap(positionStore).its('crossHairPosition').should('not.be.undefined')
            cy.wrap(positionStore)
                .its('crossHairPosition')
                .should((pos) => checkLocation(expectedCrosshairPosition, pos!))
        } else {
            cy.wrap(positionStore).its('crossHairPosition').should('be.undefined')
        }
    })
    // check the location of pinnedLocation
    cy.getPinia().should((pinia) => {
        const mapStore = useMapStore(pinia)
        cy.wrap(mapStore).its('pinnedLocation').should('not.be.undefined')
        cy.wrap(mapStore)
            .its('pinnedLocation')
            .should((loc) => checkLocation(expectedPinnedLocation, loc!))
    })
}

describe('Test the search bar result handling', () => {
    const expectedLocationLabel = '<b>Test location</b>'
    const expectedLayerLabel = '<b>Test layer</b>'
    const expectedLegendContent = '<div>Test</div>'
    const expectedCenterEpsg4326 = [7.0, 47.0] // lon/lat
    const expectedCenterDefaultProjection = proj4(
        WGS84.epsg,
        DEFAULT_PROJECTION.epsg,
        expectedCenterEpsg4326
    )
    const expectedLayerId = 'test.wmts.layer'
    const expectedFeatureId = 5678
    const locationResponse = {
        results: [
            {
                id: 1234,
                weight: 1,
                attrs: {
                    x: expectedCenterDefaultProjection[0],
                    y: expectedCenterDefaultProjection[1],
                    lon: expectedCenterEpsg4326[0],
                    lat: expectedCenterEpsg4326[1],
                    rank: 1,
                    // we create an extent of 1km around the center
                    geom_st_box2d: `BOX(${expectedCenterDefaultProjection[0]! - 500} ${expectedCenterDefaultProjection[1]! - 500
                        },${expectedCenterDefaultProjection[0]! + 500} ${expectedCenterDefaultProjection[1]! + 500
                        })`,
                    label: expectedLocationLabel,
                    origin: 'kantone',
                },
            },
            { attrs: { label: 'Test location #2', origin: 'district' } },
            { attrs: { label: 'Test location #3' } },
        ],
    }
    const layerResponse = {
        results: [
            {
                id: 4321,
                weight: 1,
                attrs: {
                    label: expectedLayerLabel,
                    layer: expectedLayerId,
                },
            },
            { id: 4322, weight: 1, attrs: { layer: 'test-2.wms.layer', label: 'Test layer #2' } },
            { id: 4323, weight: 1, attrs: { layer: 'test-3.wms.layer', label: 'Test layer #3' } },
        ],
    }
    const layerFeatureResponse = {
        results: [
            {
                id: expectedFeatureId,
                weight: 4,
                attrs: {
                    featureId: expectedFeatureId,
                    feature_id: expectedFeatureId,
                    x: expectedCenterDefaultProjection[0],
                    y: expectedCenterDefaultProjection[1],
                    lon: expectedCenterEpsg4326[0],
                    lat: expectedCenterEpsg4326[1],
                    rank: 1,
                    // we create an extent of 1km around the center
                    geom_st_box2d: `BOX(${expectedCenterDefaultProjection[0]! - 500} ${expectedCenterDefaultProjection[1]! - 500
                        },${expectedCenterDefaultProjection[0]! + 500} ${expectedCenterDefaultProjection[1]! + 500
                        })`,
                    label: expectedLocationLabel,
                },
            },
        ],
    }
    const calculateExpectedZoom = (
        currentViewportWidth: number,
        currentViewPortHeight: number
    ): number => {
        // the extent of the feature is a 1km box, so the wanted resolution is 1000m spread
        // on the smaller value between width or height
        const resolution = 1000.0 / Math.min(currentViewportWidth, currentViewPortHeight)
        // we now zoom out once after calculation (see BGDIINF_SB-3153)
        return (
            DEFAULT_PROJECTION.getZoomForResolution(
                resolution,
                proj4(
                    WGS84.epsg,
                    DEFAULT_PROJECTION.epsg,
                    expectedCenterEpsg4326 as SingleCoordinate
                )
            ) - 1
        )
    }

    beforeEach(() => {
        // mocking up all possible search backend response
        cy.intercept('**/rest/services/ech/SearchServer*?type=layers*', {
            body: layerResponse,
        }).as('search-layers')
        cy.intercept('**/rest/services/ech/SearchServer*?type=locations*', {
            body: locationResponse,
        }).as('search-locations')
        cy.intercept('**/rest/services/ech/SearchServer*?type=featuresearch*', {
            body: layerFeatureResponse,
        }).as('search-layer-features')
    })

    it('search different type of entries correctly', () => {
        cy.goToMapView({ queryParams: { sr: 2056 } }) // Use LV95 projection
        cy.wait(['@layerConfig', '@topics', '@topic-ech'])

        cy.get(searchbarSelector).paste('test')
        cy.wait(['@search-locations', '@search-layers'])

        cy.log('Checking that it handles search result thoroughly (zoom, center, pin)')
        cy.get('[data-cy="search-results-locations"] [data-cy="search-result-entry"]')
            .as('locationSearchResults')
            .first()
            .invoke('text')
            .should('eq', `Ct. ${expectedLocationLabel.replace(/<\/?b>/g, '')}`)
        cy.get('@locationSearchResults')
            .eq(1)
            .invoke('text')
            .should('eq', `District Test location #2`)

        cy.log('Checking that it does not add the search query as swisssearch URL param')
        cy.url().should('not.contain', 'swisssearch')

        cy.log(
            'Checking that it reads the swisssearch URL param at startup and launch a search with its content'
        )

        cy.getPinia().should((pinia) => {
            const searchStore2 = useSearchStore(pinia)
            cy.wrap(searchStore2).its('query').should('eq', 'test')
        })
        cy.get('@locationSearchResults').should('be.visible')

        cy.log('Checking that it displays layer results with info-buttons')
        // Ensure that all layers have been added and contain an info-button.
        cy.get('[data-cy="search-results-layers"] [data-cy="search-result-entry"]')
            .as('layerSearchResults')
            .should('have.length', layerResponse.results.length)
        cy.get('@layerSearchResults')
            .invoke('text')
            .should('contain', expectedLayerLabel.replace(/<\/?b>/g, ''))
        cy.get('@layerSearchResults')
            .find('[data-cy^="button-show-description-layer-"]')
            .should('exist')

        cy.log('Opening up a layer legend from the search results')
        // As we only test one of the buttons we can send the same content for all legends.
        cy.intercept('**/rest/services/all/MapServer/*/legend**', expectedLegendContent).as(
            'legend'
        )
        // Click on the first info-button and check if the legend loads correctly.
        cy.get('@layerSearchResults')
            .find('[data-cy^="button-show-description-layer-"]')
            .first()
            .click()
        cy.wait('@legend')
        cy.get('[data-cy="layer-description"]')
            .should('be.visible')
            .then(([legend]) => {
                expect(legend?.innerHTML).to.contain(expectedLegendContent)
            })
        // closing legend
        cy.get('[data-cy="window-close"]').click()

        cy.log('Testing keyboard navigation')
        cy.get(searchbarSelector).paste('test')
        cy.wait([`@search-locations`, '@search-layers'])

        cy.log('Clearing the search result with ESC')
        cy.get(searchbarSelector).trigger('keydown', { key: 'Escape' })
        cy.get('[data-cy="search-results"]').should('not.be.visible')
        cy.get(searchbarSelector).should('have.value', '')

        cy.log('Toggling the search result with caret button')
        cy.viewport(600, 600)
        cy.get(searchbarSelector).paste('test')
        cy.wait([`@search-locations`, '@search-layers'])
        cy.get('[data-cy="searchbar-toggle-result"]').should('be.visible').click()
        cy.get('[data-cy="search-results"]').should('not.be.visible')
        cy.get('[data-cy="searchbar-toggle-result"]').should('be.visible').click()
        cy.get('[data-cy="search-results"]').should('be.visible')
        cy.viewport('iphone-se2')

        cy.log('Navigating with arrow UP/DOWN')
        cy.get(searchbarSelector).trigger('keydown', { key: 'ArrowDown' })
        cy.get('[data-cy="search-results"]').should('be.visible')

        // Locations
        cy.waitUntil(() => cy.focused().then(($element) => $element.prop('tagName') === 'LI'))

        cy.focused()
            .then(checkDescendantOf(locationsSelector, 'Child of locations'))
            .then(checkSiblingIndex(0, 'First location'))

        cy.focused().trigger('keydown', { key: 'ArrowDown' })
        cy.focused().then(checkSiblingIndex(1, 'Second location'))
        cy.focused().trigger('keydown', { key: 'ArrowDown' })
        cy.focused().then(checkSiblingIndex(2, 'Third location'))

        cy.focused().trigger('keydown', { key: 'ArrowUp' })
        cy.focused().then(checkSiblingIndex(1, 'Second location'))
        cy.focused().trigger('keydown', { key: 'ArrowUp' })
        cy.focused().then(checkSiblingIndex(0, 'First location'))

        cy.focused().trigger('keydown', { key: 'End' })
        cy.focused().then(checkSiblingIndex(2, 'Last location'))

        cy.focused().trigger('keydown', { key: 'Home' })
        cy.focused().then(checkSiblingIndex(0, 'First location'))

        // Layers
        cy.get('[data-cy="search-results-layers"] [tabindex="0"]').focus()
        cy.focused()
            .then(checkDescendantOf(layersSelector, 'Child of layers'))
            .then(checkSiblingIndex(0, 'First layer'))

        cy.focused().trigger('keydown', { key: 'ArrowDown' })
        cy.focused().then(checkSiblingIndex(1, 'Second layer'))
        cy.focused().trigger('keydown', { key: 'ArrowDown' })
        cy.focused().then(checkSiblingIndex(2, 'Third layer'))

        cy.focused().trigger('keydown', { key: 'ArrowUp' })
        cy.focused().then(checkSiblingIndex(1, 'Second layer'))
        cy.focused().trigger('keydown', { key: 'ArrowUp' })
        cy.focused().then(checkSiblingIndex(0, 'First layer'))

        cy.focused().trigger('keydown', { key: 'End' })
        cy.focused().then(checkSiblingIndex(2, 'Last layer'))

        cy.focused().trigger('keydown', { key: 'Home' })
        cy.focused().then(checkSiblingIndex(0, 'First layer'))

        // Enter should select the focused entry.
        cy.get(searchbarSelector).focus()
        cy.focused().trigger('keydown', { key: 'ArrowDown' })
        cy.focused().trigger('keyup', { key: 'Enter' })

        cy.getPinia().should((pinia) => {
            const mapStore2 = useMapStore(pinia)
<<<<<<< HEAD
            assertDefined(mapStore2.pinnedLocation)
            checkLocation(expectedCenterDefaultProjection, mapStore2.pinnedLocation)
=======
            cy.wrap(mapStore2).its('pinnedLocation').should('not.be.undefined')
            cy.wrap(mapStore2)
                .its('pinnedLocation')
                .then((loc) => checkLocation(expectedCenterDefaultProjection, loc!))
>>>>>>> 7c9e861b7 (PB-2064: Improve search test stability and refactor store actions for better state consistency)
        })
        // clearing selected entry by clearing the search bar and re-entering a search text
        cy.get('[data-cy="searchbar-clear"]').click()
        cy.getPinia().should((pinia) => {
            const mapStore2 = useMapStore(pinia)
            cy.wrap(mapStore2).its('pinnedLocation').should('be.undefined')
        })

        cy.log('Testing previewing the location or layer on hover')

        cy.get(searchbarSelector).paste('test')
        cy.wait(['@search-locations', '@search-layers'])

        // Location - Enter
        cy.get('@locationSearchResults').first().trigger('mouseenter')
        cy.getPinia().then((pinia) => {
            const mapStore2 = useMapStore(pinia)
            cy.wrap(mapStore2).its('previewedPinnedLocation').should('not.be.undefined')
            cy.wrap(mapStore2)
                .its('previewedPinnedLocation')
<<<<<<< HEAD
                .then((loc) => checkLocation(expectedCenterDefaultProjection, loc))
=======
                .then((loc) => checkLocation(expectedCenterDefaultProjection, loc!))
>>>>>>> 7c9e861b7 (PB-2064: Improve search test stability and refactor store actions for better state consistency)
        })
        // Location - Leave
        cy.get('@locationSearchResults').first().trigger('mouseleave')
        cy.getPinia().then((pinia) => {
            const mapStore2 = useMapStore(pinia)
            cy.wrap(mapStore2).its('previewedPinnedLocation').should('be.undefined')
        })

        // Layer - Enter
        cy.get('@layerSearchResults').first().trigger('mouseenter')
        cy.getPinia().then((pinia) => {
            const layersStore = useLayersStore(pinia)
            cy.wrap(layersStore)
                .its('visibleLayers')
                .should((layers: Layer[]) => {
                    const visibleIds = layers.map((layer: Layer) => layer.id)
                    expect(visibleIds).to.contain(expectedLayerId)
                })
        })
        // Layer - Leave
        cy.get('@layerSearchResults').first().trigger('mouseleave')
        cy.getPinia().then((pinia) => {
            const layersStore2 = useLayersStore(pinia)
            cy.wrap(layersStore2)
                .its('visibleLayers')
                .should((layers: Layer[]) => {
                    const visibleIds = layers.map((layer: Layer) => layer.id)
                    expect(visibleIds).not.to.contain(expectedLayerId)
                })
        })

        // Location - Leave via unmount
        cy.get('@locationSearchResults').first().trigger('mouseenter')
        cy.get('[data-cy="searchbar-clear"]').click()
        cy.getPinia().then((pinia) => {
            const mapStore2 = useMapStore(pinia)
            cy.wrap(mapStore2).its('previewedPinnedLocation').should('be.undefined')
        })

        cy.log('Clicking on the first entry to test handling of zoom/extent/position')
        cy.get(searchbarSelector).paste('test')
        cy.get(searchbarSelector).should('have.value', 'test')
        cy.get('@locationSearchResults').first().realClick()
        // search bar should take element's title as value if it's a location
        cy.get(searchbarSelector).should('have.value', 'Test location')

        // checking that the view has centered on the feature
        cy.getPinia().should((pinia) => {
            const positionStore2 = usePositionStore(pinia)
            cy.wrap(positionStore2)
                .its('center')
                .should((center) => checkLocation(expectedCenterDefaultProjection, center))
        })

        // checking that the zoom level corresponds to the extent of the feature
        // TODO: this somehow fail on the desktop viewport, see https://jira.swisstopo.ch/browse/BGDIINF_SB-2156
        const width = Cypress.config('viewportWidth')
        const height = Cypress.config('viewportHeight')
        if (width < BREAKPOINT_TABLET) {
            cy.getPinia().should((pinia) => {
                const positionStore3 = usePositionStore(pinia)
                cy.wrap(positionStore3)
                    .its('zoom')
                    .should('be.closeTo', calculateExpectedZoom(width, height), 0.2)
            })
        }

        // checking that a dropped pin has been placed at the feature's location
        cy.getPinia().should((pinia) => {
            const mapStore2 = useMapStore(pinia)
            cy.wrap(mapStore2).its('pinnedLocation').should('not.be.undefined')
            cy.wrap(mapStore2)
                .its('pinnedLocation')
                .should((loc) => checkLocation(expectedCenterDefaultProjection, loc!))
        })

        cy.log('Search bar dropdown should be hidden after centering on the feature')
        cy.get('@locationSearchResults').should('not.be.visible')

        cy.log(`Search input should be focused`)
        cy.focused().should('have.attr', 'data-cy', 'searchbar')

        cy.log(`Pressing enter should re-open the result`)
        cy.focused().trigger('keyup', { key: 'enter' })
        cy.get('@locationSearchResults').should('be.visible')
        cy.focused().should('have.attr', 'data-cy', 'search-result-entry')

        cy.log('It hides the results when the user clicks on the map')
        cy.get('@locationSearchResults').should('be.visible')
        cy.get('[data-cy="map"]').click(viewportWidth * 0.5, viewportHeight * 0.75)
        cy.get('@locationSearchResults').should('not.be.visible')

        cy.log('It shows the results once again if the user clicks back on the search input')
        cy.get(searchbarSelector).click()
        cy.get('@locationSearchResults').should('be.visible')

        cy.log('It adds a search for layers features if a visible layers is set to be searchable')
        cy.get(searchbarSelector).clear()
        cy.get(searchbarSelector).type('test')
        cy.wait(['@search-locations', '@search-layers'])
        // the layer feature category should not be present (no searchable layer added yet)
        cy.get('[data-cy="search-results-featuresearch"]')
            .as('layerFeatureSearchCategory')
            .should('be.hidden')
        // adding the layer through the search results
        cy.get('@layerSearchResults').first().click()
        // search bar should not take element's title as value, but stays with the user search query
        cy.get(searchbarSelector).should('have.value', 'test')
        // should re-run a search to include potential layer features
        cy.wait(['@search-locations', '@search-layers', '@search-layer-features'])
        // checking that the layer has been added to the map
        cy.checkOlLayer([
            'test.background.layer2', // bg layer
            expectedLayerId,
        ])
        // running a new search
        cy.get('[data-cy="searchbar-clear"]').click()
        cy.get(searchbarSelector).paste('test')
        // it now must add a search request for the newly added layer
        cy.wait(['@search-locations', '@search-layers', '@search-layer-features'])

        cy.get('@layerFeatureSearchCategory').should('be.visible')

        cy.get(searchbarSelector).click()
        cy.get('@locationSearchResults').should('not.be.visible')

        cy.log('Testing layer feature search')
        cy.get(searchbarSelector).click()
        cy.get('[data-cy="search-results-featuresearch"] [data-cy="search-result-entry"]').click()
        cy.url().should((url) => {
            const center = new URLSearchParams(url.split('map')[1]).get('center')
            const [x, y] = center!.split(',').map(parseFloat)
            expect(x).to.be.closeTo(expectedCenterDefaultProjection[0]!, 1)
            expect(y).to.be.closeTo(expectedCenterDefaultProjection[1]!, 1)
        })

        // Check that the infobox for the selected feature is visible
        cy.get('[data-cy="infobox"]').as('infobox').should('be.visible')
        cy.get('@infobox').find('[data-cy="feature-item"]').should('have.length', 1)
        cy.get('@infobox')
            .find('[data-cy="feature-item"]')
            .first()
            .should('contain.text', expectedFeatureId)

        cy.log('Checking that the swisssearch url param is not present after reloading the page')
        cy.reload()
        cy.waitMapIsReady()
        cy.wait(['@layerConfig', '@topics', '@topic-ech'])

        cy.url().should('not.contain', 'swisssearch')
        cy.getPinia().should((pinia) => {
            const searchStore3 = useSearchStore(pinia)
            cy.wrap(searchStore3).its('query').should('eq', '')
        })
        cy.get('@locationSearchResults').should('not.exist')
    })
    it('autoselects the first swisssearch result when swisssearch_autoselect is true', () => {
        cy.intercept('**/rest/services/ech/SearchServer*?type=layers*', {
            body: { results: [] },
        }).as('search-layers')
        const coordinates = [2598633.75, 1200386.75]
        cy.intercept('**/rest/services/ech/SearchServer*?type=locations*', {
            body: {
                results: [
                    {
                        id: 1234,
                        weight: 1,
                        attrs: {
                            detail: '1530 payerne 5822 payerne ch vd',
                            label: '  <b>1530 Payerne</b>',
                            lat: 46.954559326171875,
                            lon: 7.420684814453125,
                            y: coordinates[0],
                            x: coordinates[1],
                            rank: 1,
                            origin: 'kantone',
                        },
                    },
                    {
                        id: 1235,
                        weight: 1,
                        attrs: {
                            detail: '1530 payerne 5822 payerne ch vd 2',
                            label: '  <b>1530 Payerne</b> 2',
                            lat: 46.954559326171875,
                            lon: 7.420684814453125,
                            y: coordinates[0],
                            x: coordinates[1],
                            rank: 2,
                            origin: 'kantone',
                        },
                    },
                ],
            },
        }).as('search-locations')
        cy.goToMapView({
            queryParams: {
                swisssearch: '1530 Payerne',
                swisssearch_autoselect: 'true',
            },
            withHash: false,
        })
        // Wait for search API calls to complete and results to be processed
        cy.wait('@search-locations')
        cy.wait('@routeChange')
        // Wait for search query to be set in store (this happens after URL params are processed)
        cy.getPinia().should((pinia) => {
            const searchStore4 = useSearchStore(pinia)
            cy.wrap(searchStore4).its('query').should('eq', '1530 Payerne')
        })
        cy.url().should('not.contain', 'swisssearch')
        cy.url().should('not.contain', 'swisssearch_autoselect')
        const acceptableDelta = 0.25

        cy.getPinia().should((pinia) => {
            const mapStore8 = useMapStore(pinia)
            cy.wrap(mapStore8).its('pinnedLocation').should('not.be.undefined')
            cy.wrap(mapStore8)
                .its('pinnedLocation')
                .then((loc) => {
                    expect(loc).to.be.a('array').that.is.not.empty
                    expect(loc?.length).to.greaterThan(1)
                    expect(loc![0]).to.be.approximately(coordinates[0]!, acceptableDelta)
                    expect(loc![1]).to.be.approximately(coordinates[1]!, acceptableDelta)
                })
        })

        // ----------------------------------------------------------------------
        cy.log('Ensuring the search dialog closes once you have selected an item')
        cy.get('[data-cy="search-results-locations"] [data-cy="search-result-entry"]')
            .as('locationSearchResults')
            .first()
            .invoke('text')
            .then((text) => text.trim())
            .should('contains', '1530 Payerne')

        cy.log('Clicking the result, will hide the dropdown of the search result')
        cy.get('@locationSearchResults').should('be.visible')
        cy.get('@locationSearchResults').first().click()
        cy.get('@locationSearchResults').should('not.be.visible')
    })

    context('swisssearch and crosshair together', () => {
        const latitude = 46.3163
        const longitude = 7.6347
        const swissSearchString = `${latitude},${longitude}`

        const [swissSearchX, swissSearchY] = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
            longitude,
            latitude,
        ])
        const swissSearchXYCoordinates = [swissSearchX, swissSearchY]

        // Cross hair position
        const crossHairX = 2660113
        const crossHairY = 1185272
        const crossHairXYCoordinates = [crossHairX, crossHairY]

        it('handles a legacy param (without #map part in the URL) correctly', () => {
            // =========================================================================== //
            cy.log('Legacy parser / router (without #map part in the URL)')
            // --------------------------------------------------------------------------- //
            cy.log('Swisssearch only -> center to swisssearch coordinates')
            cy.goToMapView({
                queryParams: {
                    swisssearch: swissSearchString,
                },
                withHash: false,
            })
            testQueryPositionCrosshairStore({
                searchQuery: swissSearchString,
                expectedCenter: swissSearchXYCoordinates,
                expectedPinnedLocation: swissSearchXYCoordinates,
                expectedCrosshair: undefined,
                expectedCrosshairPosition: undefined,
            })
        })

        it('handles a legacy swisssearch and a simple crosshair (no position) correctly', () => {
            cy.log(
                'It should center to swisssearch coordinates with crosshair in swisssearch coordinate'
            )
            cy.goToMapView({
                queryParams: {
                    swisssearch: swissSearchString,
                    crosshair: CrossHairs.Cross,
                },
                withHash: false,
            })
            testQueryPositionCrosshairStore({
                searchQuery: swissSearchString,
                expectedCenter: swissSearchXYCoordinates,
                expectedPinnedLocation: swissSearchXYCoordinates,
                expectedCrosshair: CrossHairs.Cross,
                expectedCrosshairPosition: swissSearchXYCoordinates,
            })
        })

        it('handles swisssearch alone correctly', () => {
            cy.log('Swisssearch only -> center to swisssearch coordinates')
            cy.goToMapView({
                queryParams: {
                    swisssearch: swissSearchString,
                },
                withHash: true,
            })
            testQueryPositionCrosshairStore({
                searchQuery: swissSearchString,
                expectedCenter: swissSearchXYCoordinates,
                expectedPinnedLocation: swissSearchXYCoordinates,
                expectedCrosshair: undefined,
                expectedCrosshairPosition: undefined,
            })
        })

        it('handles swisssearch and crosshair with position correctly', () => {
            cy.log(
                'Swisssearch with crosshair -> center to swisssearch coordinates with crosshair in swisssearch coordinate'
            )
            cy.goToMapView({
                queryParams: {
                    swisssearch: swissSearchString,
                    crosshair: CrossHairs.Cross,
                },
                withHash: true,
            })
            testQueryPositionCrosshairStore({
                searchQuery: swissSearchString,
                expectedCenter: swissSearchXYCoordinates,
                expectedPinnedLocation: swissSearchXYCoordinates,
                expectedCrosshair: CrossHairs.Cross,
                expectedCrosshairPosition: swissSearchXYCoordinates,
            })
        })

        it('handles a swisssearch and a complete crosshair (with position) correctly', () => {
            cy.log(
                'Swisssearch with crosshair and crosshair location -> center to swisssearch coordinates with crosshair in crosshair coordinate'
            )
            cy.goToMapView({
                queryParams: {
                    swisssearch: swissSearchString,
                    crosshair: `${CrossHairs.Cross},${crossHairX},${crossHairY}`,
                },
                withHash: true,
            })
            testQueryPositionCrosshairStore({
                searchQuery: swissSearchString,
                expectedCenter: swissSearchXYCoordinates,
                expectedPinnedLocation: swissSearchXYCoordinates,
                expectedCrosshair: CrossHairs.Cross,
                expectedCrosshairPosition: crossHairXYCoordinates,
            })
        })
    })
})
