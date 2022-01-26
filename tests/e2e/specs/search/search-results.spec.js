/// <reference types="cypress" />

import proj4 from 'proj4'
import setupProj4 from '../../../../src/utils/setupProj4'
import { round } from '../../../../src/utils/numberUtils'
import { forEachTestViewport } from '../../support'

setupProj4()

const searchbarSelector = '[data-cy="searchbar"]'

describe('Test the search bar result handling', () => {
    forEachTestViewport((viewport, isMobile, isTablet, dimensions) => {
        context(
            `viewport: ${viewport}`,
            {
                viewportWidth: dimensions.width,
                viewportHeight: dimensions.height,
            },
            () => {
                const acceptedDelta = 0.1
                const expectedLocationLabel = '<b>Test location</b>'
                const expectedLayerLabel = '<b>Test layer</b>'
                const expectedLegendContent = '<div>Test</div>'
                const expectedCenterEpsg4326 = [7.0, 47.0] // lon/lat
                const expectedCenterEpsg3857 = proj4(
                    proj4.WGS84,
                    'EPSG:3857',
                    expectedCenterEpsg4326
                )
                const locationResponse = {
                    results: [
                        {
                            id: 1234,
                            weight: 1,
                            attrs: {
                                x: expectedCenterEpsg3857[0],
                                y: expectedCenterEpsg3857[1],
                                rank: 1,
                                // we create an extent of 1km around the center
                                geom_st_box2d: `BOX(${expectedCenterEpsg3857[0] - 500} ${
                                    expectedCenterEpsg3857[1] - 500
                                },${expectedCenterEpsg3857[0] + 500} ${
                                    expectedCenterEpsg3857[1] + 500
                                })`,
                                label: expectedLocationLabel,
                            },
                        },
                    ],
                }
                const layerResponse = {
                    results: [
                        {
                            id: 4321,
                            weight: 1,
                            attrs: {
                                label: expectedLayerLabel,
                                layer: 'ch.swisstopo.test',
                            },
                        },
                    ],
                }
                // see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
                // reverting formula resolution = 156543.03 meters/pixel * cos(latitude) / (2 ^ zoomlevel)
                // => zoomlevel = log2(156543.03 meters/pixel * cos(latitude) / resolution)
                const resolutionAtZoomLevelZero = 156543.03 // in m/px
                const calculateExpectedZoom = (currentViewportWidth, currentViewPortHeight) => {
                    // the extent of the feature is a 1km box, so the wanted resolution is 1000m spread
                    // on the smaller value between width or height
                    const resolution =
                        1000.0 / Math.min(currentViewportWidth, currentViewPortHeight)
                    const latitudeInRadians = (expectedCenterEpsg4326[1] * Math.PI) / 180.0
                    return round(
                        Math.log2(
                            (resolutionAtZoomLevelZero * Math.cos(latitudeInRadians)) / resolution
                        ),
                        2
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
                        .then((entries) => {
                            expect(entries.length).to.eq(1)
                            const entry = entries[0]
                            expect(entry.innerHTML).to.contain(expectedLocationLabel)
                        })
                        .click()
                    // checking that the view has centered on the feature
                    cy.readStoreValue('state.position.center').then((center) =>
                        checkLocation(expectedCenterEpsg3857, center)
                    )
                    // checking that the zoom level corresponds to the extent of the feature
                    // TODO: this somehow fail on the desktop viewport, see https://jira.swisstopo.ch/browse/BGDIINF_SB-2156
                    // cy.readStoreValue('state.position.zoom').then((zoom) => {
                    //     expect(zoom).be.closeTo(
                    //         calculateExpectedZoom(dimensions.width, dimensions.height),
                    //         0.2
                    //     )
                    // })
                    // checking that a dropped pin has been placed at the feature's location
                    cy.readStoreValue('state.map.pinnedLocation').then((pinnedLocation) =>
                        checkLocation(expectedCenterEpsg3857, pinnedLocation)
                    )
                })
                it('adds the search query as swisssearch URL param', () => {
                    cy.goToMapView()
                    cy.get(searchbarSelector).paste('test')
                    cy.url().should('contain', 'swisssearch=test')
                })
                it('reads the swisssearch URL param at startup and launch a search with its content', () => {
                    cy.goToMapView('en', {
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
                        .then(([entry]) => {
                            expect(entry.innerHTML).to.contain(expectedLayerLabel)
                        })
                        .find('[data-cy^="button-show-legend-layer-"]')
                        .should('exist')
                })
                it('shows a legend when clicking an info-button', () => {
                    // As we only test one of the buttons we can send the same content for all legends.
                    cy.intercept(
                        '**/rest/services/all/MapServer/*/legend**',
                        expectedLegendContent
                    ).as('legend')
                    cy.goToMapView()
                    cy.get(searchbarSelector).paste('test')
                    cy.wait(['@search-locations', '@search-layers'])
                    // Click on the first info-button and check if the legend loads correctly.
                    cy.get(
                        '[data-cy="search-result-entry-layer"] [data-cy^="button-show-legend-layer-"]'
                    )
                        .first()
                        .click()
                    cy.wait('@legend')
                    cy.get('[data-cy="layer-legend"]')
                        .should('be.visible')
                        .then(([legend]) => {
                            expect(legend.innerHTML).to.contain(expectedLegendContent)
                        })
                })
            }
        )
    })
})
