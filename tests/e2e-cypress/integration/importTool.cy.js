/// <reference types="cypress" />

describe('The Import Tool', () => {
    beforeEach(() => {
        cy.goToMapView({}, true)
        cy.get('[data-cy="menu-button"]').click()
    })
    it('Open and close the infobox import tool', () => {
        cy.get('[data-cy="menu-tray-tool-section"]').click()
        cy.get('[data-cy="menu-import-tool"]').click()
        // the menu should be automatically close on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-tool-content"]').should('be.visible')
        cy.get('[data-cy="infobox-close"]').click()
        cy.get('[data-cy="import-tool-content"]').should('not.exist')
    })
    it.only('Import external wms layers', () => {
        cy.intercept(
            {
                https: true,
                hostname: 'wms.geo.admin.ch',
                query: { REQUEST: 'GetCapabilities' },
            },
            { fixture: 'import-tool/wms-geo-admin-get-capabilities.xml' }
        ).as('wms-get-capabilities')
        cy.intercept(
            {
                https: true,
                hostname: 'wms.geo.admin.ch',
                query: { REQUEST: 'GetMap' },
            },
            { statusCode: 200 }
        ).as('wms-get-map')
        cy.get('[data-cy="menu-tray-tool-section"]').click()
        cy.get('[data-cy="menu-import-tool"]').click()
        cy.get('[data-cy="import"]').type('wms.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wms.geo.admin.ch')
            .click()
        cy.get('[data-cy="import-connect-button"]').click()
        cy.wait('@wms-get-capabilities')
        cy.get('[data-cy="import-add-layer-button"]').should('be.visible')
        cy.get('[data-cy="import-result-list"]').children().should('have.length', 3).first().click()
        cy.wait('@wms-get-map')
        cy.get('[data-cy="import-add-layer-button"]').click()
        cy.wait('@wms-get-map')
        cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
            expect(activeLayers).to.be.an('Array').length(1)
            const externalLayer = activeLayers[0]
            expect(externalLayer.isExternal).to.be.true
            expect(externalLayer.visible).to.be.true
            expect(externalLayer.externalLayerId).to.eq('ch.vbs.armeelogistikcenter')
            expect(externalLayer.name).to.eq('Centres logistiques de l`armée CLA')
        })
    })
})
