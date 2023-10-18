/// <reference types="cypress" />

import { LV95 } from '@/utils/coordinates/coordinateSystems'

describe('The infobox', () => {
    const generateInfoboxTestsForMapSelector = (mapSelector, with3d = false) => {
        it('is visible if features selected', () => {
            const testContent = () => {
                cy.get('[data-cy="highlighted-features"]').should('not.exist')

                cy.get(mapSelector).click()
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })

                cy.get('[data-cy="highlighted-features"]').should('be.visible')
            }
            if (with3d) {
                cy.waitUntilCesiumTilesLoaded().then(testContent)
            } else {
                testContent()
            }
        })
        it('blocks direct activation of fullscreen', () => {
            const testContent = () => {
                cy.get(mapSelector).click()
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })
                cy.get('[data-cy="infobox"]').should('be.visible')
                cy.intercept('**/MapServer/identify**', {})
                cy.get(mapSelector).click()
                cy.get('[data-cy="infobox"]').should('not.be.visible')
                cy.activateFullscreen(mapSelector)
            }
            if (with3d) {
                cy.waitUntilCesiumTilesLoaded().then(testContent)
            } else {
                testContent()
            }
        })
        it('can float or stick to the bottom', () => {
            const testContent = () => {
                cy.get(mapSelector).click()
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })

                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('be.visible')

                cy.get('[data-cy="infobox-toggle-floating"]').click()
                cy.get('[data-cy="popover"]').should('be.visible')
                cy.get('[data-cy="infobox"]').should('not.be.visible')

                // we have to force the click, as in the mobile viewport the button can sometimes be under the header
                cy.get('[data-cy="toggle-floating-off"]').click({ force: true })
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('be.visible')
            }
            if (with3d) {
                cy.waitUntilCesiumTilesLoaded().then(testContent)
            } else {
                testContent()
            }
        })
        it('sets its height dynamically if at the bottom', () => {
            const testContent = () => {
                cy.get(mapSelector).click()
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })

                cy.get('[data-cy="infobox-content"]').then(($element) => {
                    const { paddingTop, paddingBottom } = getComputedStyle($element[0])
                    const verticalPadding = parseInt(paddingTop) + parseInt(paddingBottom)
                    const viewportHeight = Cypress.config('viewportHeight')
                    let maxHeight = $element
                        .find('[data-infobox="height-reference"]')
                        .toArray()
                        .map((child) => child.offsetHeight)
                        .reduce((max, height) => Math.max(max, height), 0)
                    maxHeight = Math.min(maxHeight + verticalPadding, viewportHeight * 0.35)
                    expect($element.height()).to.be.closeTo(maxHeight - verticalPadding, 0.1)
                })
            }
            if (with3d) {
                cy.waitUntilCesiumTilesLoaded().then(testContent)
            } else {
                testContent()
            }
        })
    }

    const layer = 'test.wmts.layer'
    const feature = {
        geometry: { type: 'Point', coordinates: LV95.bounds.center },
        layerBodId: 'ch.babs.kulturgueter',
        bbox: [
            LV95.bounds.center[0] - 1000,
            LV95.bounds.center[1] - 1000,
            LV95.bounds.center[0] + 1000,
            LV95.bounds.center[1] + 1000,
        ],
        featureId: 1234,
        layerName: 'A nice test layer',
        type: 'Feature',
        id: 1234,
        properties: {
            zkob: 'This is a test feature',
            link_title: 'This is a test feature',
            link_uri: 'http://localhost:8080/',
            link_2_title: null,
            link_2_uri: null,
            link_3_title: 'This is a test feature',
            link_3_uri: null,
            label: 'This is a test feature',
            pdf_list: null,
            x: 1234.0,
            y: 1234.0,
        },
    }

    beforeEach(() => {
        cy.intercept('**/MapServer/identify**', { results: [feature] })
        cy.intercept(`**/MapServer/${layer}/**geometryFormat**`, feature)
        cy.intercept('**/MapServer/**/htmlPopup**', {
            fixture: 'html-popup.fixture.html',
        })
    })
    context('OpenLayers map', () => {
        beforeEach(() => {
            cy.goToMapView({ layers: layer })
        })
        generateInfoboxTestsForMapSelector('[data-cy="ol-map"]')
    })
    context('Cesium map', () => {
        beforeEach(() => {
            cy.goToMapView({ layers: layer, '3d': true })
        })
        generateInfoboxTestsForMapSelector('[data-cy="cesium-map"]', true)
    })
    context('transition from 2D to 3D (and back to 2D)', () => {
        beforeEach(() => {
            cy.goToMapView({ layers: layer })

            cy.get('[data-cy="ol-map"]').click()
            cy.waitUntilState((state) => {
                return state.features.selectedFeatures.length > 0
            })
            cy.get('[data-cy="highlighted-features"]').should('be.visible')
        })
        it('keeps the selected features when going 3D', () => {
            cy.get('[data-cy="3d-button"]').click()
            // waiting for 3D to be loaded
            cy.readWindowValue('cesiumViewer').then(() => {
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
            })
        })
        it('keeps the selected features when going back to 2D', () => {
            cy.get('[data-cy="3d-button"]').click()
            cy.readWindowValue('cesiumViewer').then(() => {
                cy.get('[data-cy="3d-button"]').click()
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
            })
        })
    })
})
