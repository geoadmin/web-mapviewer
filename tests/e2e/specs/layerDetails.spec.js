/// <reference types="cypress" />

describe('Test layer menu show details button', () => {
    it('Toggling layer details menu', () => {
        cy.goToMapView('en', {
            layers: 'test.wms.layer;test.wmts.layer',
        })
        // clicking on the menu button
        cy.get('[data-cy="menu-button"]').click()
        // get and click the wms layer detail button
        cy.get('[data-cy="button-open-visible-layer-settings-test.wms.layer"]')
            .as('wmsDetailsBtn')
            .click()
        cy.get('@wmsDetailsBtn')
            .parents('[class="menu-layer-list-item"]')
            .find('[class="menu-layer-list-item-details"]')
            .as('wmsLayerDetail')
            .should('be.visible')
        // the other layer details should not be visible
        cy.get('[data-cy="button-open-visible-layer-settings-test.wmts.layer"]')
            .as('wmtsDetailBtn')
            .parents('[class="menu-layer-list-item"]')
            .find('[class="menu-layer-list-item-details"]')
            .as('wmtsLayerDetail')
            .should('not.be.visible')
        // click on the other layer detail
        cy.get('@wmtsDetailBtn').click()
        cy.get('@wmsLayerDetail').should('not.be.visible')
        cy.get('@wmtsLayerDetail').should('be.visible')
        // toggle the current layer detail
        cy.get('@wmtsDetailBtn').click()
        cy.get('@wmsLayerDetail').should('not.be.visible')
        cy.get('@wmtsLayerDetail').should('not.be.visible')
    })
})
