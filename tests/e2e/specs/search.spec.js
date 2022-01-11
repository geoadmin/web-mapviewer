/// <reference types="cypress" />

import proj4 from 'proj4'
import setupProj4 from '../../../src/utils/setupProj4'
import { forEachTestViewport } from '../support'

setupProj4()

const searchbarSelector = '[data-cy="searchbar"]'

describe('Test the search bar', () => {
    forEachTestViewport((viewport) => {
        context(`viewport: ${viewport}`, () => {
            beforeEach(() => {
                cy.viewport(viewport)
            })
            context('Testing coordinates typing in search bar', () => {
                // in order to ease test run, we only load the page once at the begining of this context
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
                            cy.window()
                                .its('store')
                                .then((store) => {
                                    store.dispatch('setZoom', 10)
                                    store.dispatch('setCenter', [46.5, 8])
                                })
                        }
                    })
                })

                // using the same values as coordinateUtils.spec.js (in Unit tests)
                const coordEpsg3857 = [773900, 5976445]
                const WGS84 = [47.2101583, 6.952062]
                const LV95 = [2563138.69, 1228917.22]
                const LV03 = [563138.65, 228917.28]

                const checkCenterInStore = (acceptableDelta = 0.0) => {
                    cy.readStoreValue('state.position.center').should((center) => {
                        expect(center[0]).to.be.approximately(coordEpsg3857[0], acceptableDelta)
                        expect(center[1]).to.be.approximately(coordEpsg3857[1], acceptableDelta)
                    })
                }
                const checkZoomLevelInStore = () => {
                    // checking that the zoom level is at the 1:25'000 map level after a coordinate input in the search bar
                    // in world-wide zoom level, it means a 15.5 zoom level (in LV95 zoom level it is 8)
                    cy.readStoreValue('state.position.zoom').should('be.eq', 15.5)
                }
                const checkThatCoordinateAreHighlighted = (acceptableDelta = 0.0) => {
                    // checking that a balloon marker has been put on the coordinate location (that it is a highlighted location in the store)
                    cy.readStoreValue('state.map.pinnedLocation').should((feature) => {
                        expect(feature).to.not.be.null
                        expect(feature).to.be.a('array').that.is.not.empty
                        expect(feature[0]).to.be.approximately(coordEpsg3857[0], acceptableDelta)
                        expect(feature[1]).to.be.approximately(coordEpsg3857[1], acceptableDelta)
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
                        standardCheck(
                            y,
                            x,
                            `${mainTitle} with coordinates entered backward`,
                            acceptableDelta
                        )
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
                    cy.get(searchbarSelector).paste(`${LV95[0]} ${LV95[1]}`)
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
                    tryAllInputPossibilities(WGS84[0], WGS84[1], 'DD format')
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
                    tryAllInputPossibilities(LV95[0], LV95[1], 'LV95', 0.0, true, true)
                })
                context('EPSG:21781 (LV03) inputs', () => {
                    tryAllInputPossibilities(LV03[0], LV03[1], 'LV03', 0.1, true, true)
                })
                context('What3Words input', () => {
                    const what3words = 'bisher.meiste.einerseits'
                    // creating a what3words response stub
                    const w3wStub = {
                        country: 'CH',
                        coordinates: {
                            lat: WGS84[0],
                            lng: WGS84[1],
                        },
                        words: what3words,
                        language: 'en',
                        map: `https://w3w.co/${what3words}`,
                    }
                    it('Calls the what3words backend when a what3words is entered in the searchbar', () => {
                        // starting a server to catch what3words request and stub it with whatever we want
                        cy.server()
                        cy.route('**/convert-to-coordinates**', w3wStub).as('w3w-convert')
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
            context('Search result handling', () => {
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
                // setting width and height value for the viewport to ease resolution calculation
                const widthAndHeight = 500
                // reverting formula resolution = 156543.03 meters/pixel * cos(latitude) / (2 ^ zoomlevel)
                // => zoomlevel = log2(156543.03 meters/pixel * cos(latitude) / resolution)
                // resolution in this case is 1000m divided by 500px, so 2m/px
                const expectedZoomLevel = Math.log2(
                    (156543.03 * Math.abs(Math.cos((expectedCenterEpsg4326[1] * Math.PI) / 180))) /
                        2
                )
                const checkLocation = (expected, result) => {
                    expect(result).to.be.an('Array')
                    expect(result.length).to.eq(2)
                    expect(result[0]).to.approximately(expected[0], acceptedDelta)
                    expect(result[1]).to.approximately(expected[1], acceptedDelta)
                }

                beforeEach(() => {
                    // setting viewport size so that resolution calculation made above is correct
                    cy.viewport(widthAndHeight, widthAndHeight)
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
                    cy.readStoreValue('state.position.zoom').then((zoom) => {
                        expect(zoom).be.closeTo(expectedZoomLevel, 0.2)
                    })
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
                    cy.wait('@search')
                    cy.readStoreValue('state.search.query').should('eq', 'Test')
                    cy.get('[data-cy="search-result-entry"]').should('be.visible')
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
            })
        })
    })
})
