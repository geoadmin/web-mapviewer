/// <reference types="cypress" />

describe('The Import Maps Tool', () => {
    beforeEach(() => {
        cy.goToMapView({}, true)
        cy.clickOnMenuButtonIfMobile()
    })
    it('Import external wms layers', () => {
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
        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').click()
        cy.get('[data-cy="import-catalogue-input"]').type('wms.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wms.geo.admin.ch')
            .click()
        cy.wait('@wms-get-capabilities')
        cy.log('First external layer should be group of layers')
        cy.get('[data-cy="catalogue-tree-item"]')
            .first()
            .should('be.visible')
            .within(() => {
                cy.contains('Beta OpenData-AV')
                cy.get('[data-cy="catalogue-add-layer-button"]').should('be.visible')
                cy.get('[data-cy="catalogue-collapse-layer-button"]').should('be.visible')
                cy.get('[data-cy="catalogue-zoom-extent-button"]').should('be.visible')
                cy.get('[data-cy="catalogue-tree-item-info"]').should('be.visible')

                cy.log('Collapse the sub layers')
                cy.get('[data-cy="catalogue-collapse-layer-button"]').click()
                cy.get('[data-cy="catalogue-tree-item"]').first().contains('OpenData-AV 1')
            })
        cy.log('Second external layer should be a single layer')
        cy.get('[data-cy="catalogue-tree-item"]')
            .next()
            .first()
            .should('be.visible')
            .within(() => {
                cy.contains('Centres logistiques')
                cy.get('[data-cy="catalogue-add-layer-button"]').should('be.visible')
                cy.get('[data-cy="catalogue-collapse-layer-button"]').should('not.exist')
                cy.get('[data-cy="catalogue-zoom-extent-button"]').should('be.visible')
                cy.get('[data-cy="catalogue-tree-item-info"]').should('be.visible')
            })

        // TODO test add layer
        // cy.get('[data-cy="import-add-layer-button"]').scrollIntoView()
        // cy.get('[data-cy="import-add-layer-button"]').should('be.visible')
        // cy.get('[data-cy="import-result-list"]').children().should('have.length', 3).first().click()
        // cy.wait('@wms-get-map')
        // cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        // cy.get('[data-cy="import-add-layer-button"]').click()
        // cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
        //     expect(activeLayers).to.be.an('Array').length(1)
        //     const externalLayer = activeLayers[0]
        //     expect(externalLayer.isExternal).to.be.true
        //     expect(externalLayer.visible).to.be.true
        //     expect(externalLayer.externalLayerId).to.eq('ch.vbs.armeelogistikcenter')
        //     expect(externalLayer.name).to.eq('Centres logistiques de l`armée CLA')
        // })

        // // Check the map attribution
        // cy.get('[data-cy="layer-copyright-Das Geoportal des Bundes"]')
        //     .should('be.visible')
        //     .contains('Das Geoportal des Bundes')
        // // Check the layer attribution
        // if (isMobile()) {
        //     cy.get('[data-cy="menu-button"]').click()
        //     cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
        // }
        // cy.get('[data-cy="menu-external-disclaimer-icon"]').should('be.visible').click()
        // cy.get('[data-cy="modal-content"]').contains(
        //     'Warning: Third party data and/or style shown (Das Geoportal des Bundes)'
        // )
    })
    it('Import external wmts layers', () => {
        // TODO
    })
})
