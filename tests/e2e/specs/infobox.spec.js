/// <reference types="cypress" />

import { forEachTestViewport } from '../support'

function longClickOnMap() {
    cy.readWindowValue('map').then((map) => {
        cy.simulateEvent(map, 'pointerdown')
        cy.wait(500) // eslint-disable-line
        cy.simulateEvent(map, 'pointerup')
        cy.simulateEvent(map, 'singleclick')
    })
}

describe('The infobox', () => {
    forEachTestViewport((viewport, isMobile, isTablet, dimensions) => {
        context(
            `viewport: ${viewport}`,
            {
                viewportWidth: dimensions.width,
                viewportHeight: dimensions.height,
            },
            () => {
                beforeEach(() => {
                    const layer = 'test.wmts.layer'
                    cy.fixture('features.fixture.json').then((features) => {
                        cy.intercept('**/MapServer/identify**', features)
                        cy.intercept(
                            `**/MapServer/${layer}/**geometryFormat**`,
                            features.results[0]
                        )
                    })
                    cy.intercept('**/MapServer/**/htmlPopup**', {
                        fixture: 'html-popup.fixture.html',
                    })
                    cy.goToMapView('en', { layers: layer })
                })
                it('is visible if features selected', () => {
                    cy.get('[data-cy="highlighted-features"]').should('not.exist')

                    longClickOnMap()
                    cy.waitUntilState((state) => {
                        return state.feature.selectedFeatures.length > 0
                    })

                    cy.get('[data-cy="highlighted-features"]').should('be.visible')
                })
                it('can float or stick to the bottom', () => {
                    longClickOnMap()
                    cy.waitUntilState((state) => {
                        return state.feature.selectedFeatures.length > 0
                    })

                    cy.get('[data-cy="popover"]').should('be.visible')
                    cy.get('[data-cy="tooltip"]').should('not.exist')

                    cy.get('[data-cy="toggle-floating-off"]').click({ force: true })
                    cy.get('[data-cy="popover"]').should('not.exist')
                    cy.get('[data-cy="tooltip"]').should('be.visible')

                    cy.get('[data-cy="toggle-floating-on"]').click()
                    cy.get('[data-cy="popover"]').should('be.visible')
                    cy.get('[data-cy="tooltip"]').should('not.exist')
                })
                it('sets its height dynamically if at the bottom', () => {
                    longClickOnMap()
                    cy.waitUntilState((state) => {
                        return state.feature.selectedFeatures.length > 0
                    })

                    cy.get('[data-cy="toggle-floating-off"]').click()
                    cy.get('[data-cy="tooltip-content"]').then(($element) => {
                        const maxHeight = $element
                            .children()
                            .toArray()
                            .map((child) => child.offsetHeight)
                            .reduce((max, height) => Math.max(max, height), 0)

                        expect($element.height()).to.be.equal(maxHeight)
                    })
                })
            }
        )
    })
})
