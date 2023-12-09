/// <reference types="cypress" />

describe('The Import File Tool', () => {
    beforeEach(() => {
        cy.goToMapView({}, true)
        cy.clickOnMenuButtonIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]').click()
    })
    it('Import KML file', () => {
        // the menu should be automatically closed on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        // TODO test the import of an online KML file

        cy.get('[data-cy="import-file-local-btn"]').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')

        // TODO test the import of a local KML file

        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')
    })
    it('Import GPX file', () => {
        // the menu should be automatically closed on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        // TODO test the import of an online KML file

        cy.get('[data-cy="import-file-local-btn"]').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')

        // TODO test the import of a local KML file

        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')
    })
})
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
        cy.get('[data-cy="import-connect-button"]').click()
        cy.wait('@wms-get-capabilities')
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
