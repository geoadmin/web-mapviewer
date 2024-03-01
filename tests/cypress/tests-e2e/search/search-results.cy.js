/// <reference types="cypress" />

import proj4 from 'proj4'

import { BREAKPOINT_TABLET, DEFAULT_PROJECTION } from '@/config'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

const searchbarSelector = '[data-cy="searchbar"]'
const locationsSelector = '[data-cy="search-results-locations"]'
const layersSelector = '[data-cy="search-results-layers"]'

const viewportHeight = Cypress.config('viewportHeight')
const viewportWidth = Cypress.config('viewportWidth')

/**
 * Configurable `.then` callback to check element index among siblings.
 *
 * @param {Number} expected The expected index of the tested element.
 * @param {String} [message] The error message in case of failure.
 * @returns {Function} Callback function for `.then`.
 */
function checkSiblingIndex(expected, message) {
    return function ($element) {
        const $siblings = $element.parent().children()
        expect($siblings.index($element), message).to.equal(expected)
        return $element
    }
}

/**
 * Configurable `.then` callback to check element's ancestor.
 *
 * @param {String | jQuery | Element} selector The ancestor to look for.
 * @param {String} [message] The error message in case of failure.
 * @returns {Function} Callback function for `.then`.
 */
function checkDescendantOf(selector, message) {
    return function ($element) {
        const $ancestor = $element.closest(selector)
        expect($ancestor, message).to.have.length(1)
        return $element
    }
}

describe('Test the search bar result handling', () => {
    const acceptedDelta = 0.1
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
                    geom_st_box2d: `BOX(${expectedCenterDefaultProjection[0] - 500} ${
                        expectedCenterDefaultProjection[1] - 500
                    },${expectedCenterDefaultProjection[0] + 500} ${
                        expectedCenterDefaultProjection[1] + 500
                    })`,
                    label: expectedLocationLabel,
                },
            },
            { attrs: { label: 'Test location #2' } },
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
            { attrs: { label: 'Test layer #2' } },
            { attrs: { label: 'Test layer #3' } },
        ],
    }
    const calculateExpectedZoom = (currentViewportWidth, currentViewPortHeight) => {
        // the extent of the feature is a 1km box, so the wanted resolution is 1000m spread
        // on the smaller value between width or height
        const resolution = 1000.0 / Math.min(currentViewportWidth, currentViewPortHeight)
        // we now zoom out once after calculation (see BGDIINF_SB-3153)
        return (
            DEFAULT_PROJECTION.getZoomForResolutionAndCenter(
                resolution,
                proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, expectedCenterEpsg4326)
            ) - 1
        )
    }
    const checkLocation = (expected, result) => {
        expect(result).to.be.an('Array')
        expect(result.length).to.eq(2)
        expect(result[0]).to.approximately(expected[0], acceptedDelta)
        expect(result[1]).to.approximately(expected[1], acceptedDelta)
    }

    beforeEach(() => {
        // mocking up all possible search backend response
        cy.mockupBackendResponse(
            'rest/services/ech/SearchServer*?type=layers*',
            layerResponse,
            'search-layers'
        )
        cy.mockupBackendResponse(
            'rest/services/ech/SearchServer*?type=locations*',
            locationResponse,
            'search-locations'
        )
    })

    it('handles search result thoroughly (zoom, center, pin)', () => {
        cy.goToMapView()
        cy.get(searchbarSelector).paste('test')
        cy.wait(`@search-locations`)
        cy.get('[data-cy="search-result-entry-location"]')
            .first()
            .invoke('text')
            .should('eq', expectedLocationLabel.replaceAll(/<\/?b>/g, ''))
        cy.get('[data-cy="search-result-entry-location"]').first().click()
        // checking that the view has centered on the feature
        cy.readStoreValue('state.position.center').then((center) =>
            checkLocation(expectedCenterDefaultProjection, center)
        )
        // checking that the zoom level corresponds to the extent of the feature
        // TODO: this somehow fail on the desktop viewport, see https://jira.swisstopo.ch/browse/BGDIINF_SB-2156
        const width = Cypress.config('viewportWidth')
        const height = Cypress.config('viewportHeight')
        if (width < BREAKPOINT_TABLET)
            cy.readStoreValue('state.position.zoom').then((zoom) => {
                expect(zoom).be.closeTo(calculateExpectedZoom(width, height), 0.2)
            })
        // checking that a dropped pin has been placed at the feature's location
        cy.readStoreValue('state.map.pinnedLocation').then((pinnedLocation) =>
            checkLocation(expectedCenterDefaultProjection, pinnedLocation)
        )
    })
    it('adds the search query as swisssearch URL param', () => {
        cy.goToMapView()
        cy.get(searchbarSelector).paste('test')
        cy.url().should('contain', 'swisssearch=test')
    })
    it('reads the swisssearch URL param at startup and launch a search with its content', () => {
        cy.goToMapView({
            swisssearch: 'Test',
        })
        cy.wait(['@search-locations', '@search-layers'])
        cy.readStoreValue('state.search.query').should('eq', 'Test')
        cy.get('[data-cy="search-result-entry-location"]').should('be.visible')
    })
    it('displays layer results with info-buttons', () => {
        cy.goToMapView()
        cy.get(searchbarSelector).paste('test')
        cy.wait(['@search-locations', '@search-layers'])
        // Ensure that all layers have been added and contain an info-button.
        cy.get('[data-cy="search-result-entry-layer"]')
            .should('have.length', layerResponse.results.length)
            .invoke('text')
            .should('contain', expectedLayerLabel.replaceAll(/<\/?b>/g, ''))
        cy.get('[data-cy="search-result-entry-layer"]')
            .find('[data-cy^="button-show-legend-layer-"]')
            .should('exist')
    })
    it('shows a legend when clicking an info-button', () => {
        // As we only test one of the buttons we can send the same content for all legends.
        cy.intercept('**/rest/services/all/MapServer/*/legend**', expectedLegendContent).as(
            'legend'
        )
        cy.goToMapView()
        cy.get(searchbarSelector).paste('test')
        cy.wait(['@search-locations', '@search-layers'])
        // Click on the first info-button and check if the legend loads correctly.
        cy.get('[data-cy="search-result-entry-layer"] [data-cy^="button-show-legend-layer-"]')
            .first()
            .click()
        cy.wait('@legend')
        cy.get('[data-cy="layer-legend"]')
            .should('be.visible')
            .then(([legend]) => {
                expect(legend.innerHTML).to.contain(expectedLegendContent)
            })
    })
    it('allows navigating the results by keyboard', () => {
        cy.goToMapView()
        cy.get(searchbarSelector).paste('test')
        cy.wait(`@search-locations`)

        cy.get(searchbarSelector).trigger('keydown', { key: 'Escape' })
        cy.get('[data-cy="search-results"]').should('not.be.visible')

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
        cy.get('[data-cy="search-results-layers"] [tabindex="0"').focus()
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

        cy.readStoreValue('state.map.pinnedLocation').then((pinnedLocation) =>
            checkLocation(expectedCenterDefaultProjection, pinnedLocation)
        )
    })
    it('previews the location or layer on hover', () => {
        cy.goToMapView()
        cy.get(searchbarSelector).paste('test')
        cy.wait(`@search-locations`)

        const locationSelector =
            '[data-cy="search-result-entry-location"] .search-category-entry-main'
        const layerSelector = '[data-cy="search-result-entry-layer"] .search-category-entry-main'

        // Location - Enter
        cy.get(locationSelector).first().trigger('mouseenter')
        cy.readStoreValue('state.map.previewedPinnedLocation').then((pinnedLocation) => {
            checkLocation(expectedCenterDefaultProjection, pinnedLocation)
        })
        // Location - Leave
        cy.get(locationSelector).first().trigger('mouseleave')
        cy.readStoreValue('state.map').then((map) => {
            expect(map.pinnedLocation).to.be.null
        })

        // Layer - Enter
        cy.get(layerSelector).first().trigger('mouseenter')
        cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
            const visibleIds = visibleLayers.map((layer) => layer.id)
            expect(visibleIds).to.contain(expectedLayerId)
        })
        // Layer - Leave
        cy.get(layerSelector).first().trigger('mouseleave')
        cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
            const visibleIds = visibleLayers.map((layer) => layer.id)
            expect(visibleIds).not.to.contain(expectedLayerId)
        })
    })
    it('hides the results when the user clicks on the map', () => {
        cy.goToMapView()
        cy.readStoreValue('state.ui.fullscreenMode').should('be.false')
        cy.get(searchbarSelector).paste('test')
        cy.wait(`@search-locations`)
        cy.get('[data-cy="search-result-entry-location"]').should('be.visible')
        cy.get('[data-cy="map"]').click(viewportWidth * 0.5, viewportHeight * 0.75)
        cy.get('[data-cy="search-result-entry-location"]').should('not.be.visible')
    })
    it('shows the results once again if the user clicks back on the search input', () => {
        cy.goToMapView()
        cy.get(searchbarSelector).paste('test')
        cy.wait(`@search-locations`)
        cy.get('[data-cy="search-result-entry-location"]').should('be.visible')
        cy.get('[data-cy="map"]').click(viewportWidth * 0.5, viewportHeight * 0.75)
        cy.get('[data-cy="search-result-entry-location"]').should('not.be.visible')
        cy.get(searchbarSelector).click()
        cy.get('[data-cy="search-result-entry-location"]').should('be.visible')
    })
})
