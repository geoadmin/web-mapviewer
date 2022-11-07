/// <reference types="cypress" />

function longClickOnMap() {
    cy.readWindowValue('map').then((map) => {
        cy.simulateEvent(map, 'pointerdown')
        cy.wait(500) // eslint-disable-line
        cy.simulateEvent(map, 'pointerup')
        cy.simulateEvent(map, 'singleclick')
    })
}

describe('The infobox', () => {
    beforeEach(() => {
        const layer = 'test.wmts.layer'
        cy.fixture('features.fixture.json').then((features) => {
            cy.intercept('**/MapServer/identify**', features)
            cy.intercept(`**/MapServer/${layer}/**geometryFormat**`, features.results[0])
        })
        cy.intercept('**/MapServer/**/htmlPopup**', {
            fixture: 'html-popup.fixture.html',
        })
        cy.goToMapView('en', { layers: layer })
    })
    it('is visible if features selected', () => {
        cy.get('[data-cy="highlighted-features"]').should('not.exist')

        cy.get('[data-cy="map"]').click()
        cy.waitUntilState((state) => {
            return state.features.selectedFeatures.length > 0
        })

        cy.get('[data-cy="highlighted-features"]').should('be.visible')
    })
    it('blocks direct activation of fullscreen', () => {
        cy.get('[data-cy="map"]').click()
        cy.waitUntilState((state) => {
            return state.features.selectedFeatures.length > 0
        })
        cy.get('[data-cy="infobox"]').should('be.visible')
        cy.intercept('**/MapServer/identify**', {})
        cy.get('[data-cy="map"]').click()
        cy.get('[data-cy="infobox"]').should('not.be.visible')
        cy.activateFullscreen()
    })
    it('can float or stick to the bottom', () => {
        cy.get('[data-cy="map"]').click()
        cy.waitUntilState((state) => {
            return state.features.selectedFeatures.length > 0
        })

        cy.get('[data-cy="popover"]').should('not.exist')
        cy.get('[data-cy="infobox"]').should('be.visible')

        cy.get('[data-cy="infobox-toggle-floating"]').click()
        cy.get('[data-cy="popover"]').should('be.visible')
        cy.get('[data-cy="infobox"]').should('not.be.visible')

        cy.get('[data-cy="toggle-floating-off"]').click()
        cy.get('[data-cy="popover"]').should('not.exist')
        cy.get('[data-cy="infobox"]').should('be.visible')
    })
    it('sets its height dynamically if at the bottom', () => {
        longClickOnMap()
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
    })
})
