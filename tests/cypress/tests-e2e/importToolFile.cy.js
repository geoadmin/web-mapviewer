/// <reference types="cypress" />

describe('The Import File Tool', () => {
    it('Import KML file', () => {
        cy.goToMapView({}, true)
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        //---------------------------------------------------------------------
        // Test the menu should be automatically closed on opening import tool box
        cy.log('the menu should be automatically closed on opening import tool box')
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        //---------------------------------------------------------------------
        // Test the import of an online KML file
        cy.log('Test online import')
        const localKmlFile = 'import-tool/external-kml-file.kml'
        const validOnlineUrl = 'http://example.com/valid-kml-file.kml'
        cy.intercept('GET', validOnlineUrl, {
            fixture: localKmlFile,
        }).as('getKmlFile')

        // Type a valid online KML file URL
        cy.get('[data-cy="import-file-online-url-input"]:visible').type(validOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getKmlFile')

        // Assertions for successful import
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-local-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.log('Test that the single kml feature is in center of the view (zoom to extent check)')
        cy.readStoreValue('state.position.center').then((center) => {
            cy.wrap(center[0]).should('be.closeTo', 2776665.92, 1)
            cy.wrap(center[1]).should('be.closeTo', 1175560.21, 1)
        })

        //---------------------------------------------------------------------
        // RE-click on the import button should not add the layer a second time
        cy.log('Test re-adding the layer, should not have effect')
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getKmlFile')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)

        //----------------------------------------------------------------------
        cy.log('Test adding another external online KML layer')
        const secondLocalKmlFile = 'import-tool/second-external-kml-file.kml'
        const secondValidOnlineUrl = 'http://example.com/second-valid-kml-file.kml'
        cy.intercept('GET', secondValidOnlineUrl, {
            fixture: secondLocalKmlFile,
        }).as('getSecondKmlFile')

        cy.get('[data-cy="import-file-online-url-input"]:visible')
            .find('[data-cy="text-input-clear"]:visible')
            .click()
        cy.get('[data-cy="import-file-online-url-input"]:visible').type(secondValidOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getSecondKmlFile')

        // Assertions for successful import
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-local-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 2)

        //----------------------------------------------------------------------
        // Test local import
        cy.log('Switch to local import')
        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')

        //----------------------------------------------------------------------
        // Attach a local KML file
        cy.log('Test add a local KML file')
        cy.fixture(localKmlFile, null).as('kmlFixture')
        cy.get('[data-cy="import-local-file-input"]').selectFile('@kmlFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        // Assertions for successful import
        cy.get('[data-cy="import-local-file-input-text"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 3)

        //----------------------------------------------------------------------
        // RE-add the layer should have no effect (no duplicate layer)
        cy.log('Test re-adding the layer, should not have effect')
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 3)

        //----------------------------------------------------------------------
        // Attach a another local KML file
        cy.log('Test add another local KML file - feature being in bound and outbound')
        const lineAccrossEuFile = 'import-tool/line-accross-eu.kml'
        cy.fixture(lineAccrossEuFile, null).as('lineAccrossEuFixture')
        cy.get('[data-cy="import-local-file-input"]').selectFile('@lineAccrossEuFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        // Assertions for successful import
        cy.get('[data-cy="import-local-file-input-text"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 4)

        //----------------------------------------------------------------------
        cy.log('Switching back to online tab, should keep previous entry')
        // Switch back to the import of an online KML file
        cy.get('[data-cy="import-file-online-btn"]:visible').click()
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-url-input"]')
            .should('be.visible')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-valid')
            .should('have.value', secondValidOnlineUrl)

        //----------------------------------------------------------------------
        // Close the import tool
        cy.log('Test close import tool')
        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')

        //----------------------------------------------------------------------
        // Open the menu and check the layer list
        cy.log('Check that the external layers have been added to the active layers menu')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]')
            .should('be.visible')
            .children()
            .should('have.length', 4)
            .each(($layer, index) => {
                cy.wrap($layer)
                    .find('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.wrap($layer).find('[data-cy^="button-error-"]').should('not.exist')
                cy.wrap($layer)
                    .find('[data-cy^="button-loading-metadata-spinner-"]')
                    .should('not.exist')
                switch (index) {
                    case 0:
                        cy.wrap($layer).contains('Line accross europe')
                        break
                    case 1:
                        cy.wrap($layer).contains('Sample Placemark')
                        break
                    case 2:
                        cy.wrap($layer).contains('Another KML')
                        break
                    case 3:
                        cy.wrap($layer).contains('Sample Placemark')
                        break
                }
            })

        //---------------------------------------------------------------------
        // Test the disclaimer
        cy.log('Test the external layer disclaimer')
        cy.get('[data-cy="menu-section-active-layers"]')
            .children()
            .first()
            .find('[data-cy="menu-external-disclaimer-icon"]:visible')
            .click()
        cy.get('[data-cy="modal-content"]')
            .should('be.visible')
            .contains('Warning: Third party data')
            .contains(lineAccrossEuFile.replace(/.*?\//, ''))
        cy.get('[data-cy="modal-close-button"]:visible').click()

        //---------------------------------------------------------------------
        // Test removing a layer
        cy.log('Test removing an external layer')
        cy.get(`[data-cy^="button-remove-layer-${validOnlineUrl}-"]:visible`).click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 3)
        cy.get('[data-cy="menu-section-active-layers"]').children().should('have.length', 3)

        //---------------------------------------------------------------------
        // Test the disclaimer in the footer
        cy.log('Test the external layer disclaimer in the footer')
        cy.closeMenuIfMobile()
        cy.get('[data-cy="layer-copyright-example.com"]')
            .should('be.visible')
            .should('have.class', 'text-primary')
        cy.get('[data-cy="layer-copyright-example.com"]').realHover()
        cy.get('[data-cy="tippy-third-part-disclaimer"]')
            .should('be.visible')
            .contains('Dataset and/or style provided by third party')
        cy.get('[data-cy="layer-copyright-example.com"]')
            .should('have.css', 'cursor', 'pointer')
            .should('not.have.attr', 'href')
        cy.get('[data-cy="layer-copyright-example.com"]').click()
        cy.get('[data-cy="modal-content"]')
            .should('be.visible')
            .contains('Warning: Third party data and/or style shown')
        cy.get('[data-cy="modal-close-button"]:visible').click()

        //---------------------------------------------------------------------
        // Test reloading the page
        cy.log('Test reloading the page should only keep online external layers')
        cy.reload()
        cy.waitMapIsReady()
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]:visible').children().should('have.length', 1)
        cy.get(`[data-cy^="active-layer-name-${secondValidOnlineUrl}-"]`).should('be.visible')
        cy.get('[data-cy^="button-loading-metadata-spinner-"]').should('not.exist')
    })
    it('Import KML file error handling', () => {
        const outOfBoundKMLFile = 'import-tool/paris.kml'
        const emptyKMLFile = 'import-tool/empty.kml'

        const invalidFileOnlineUrl = 'http://example.com/invalid-file.kml'
        cy.intercept('GET', invalidFileOnlineUrl, {
            body: `<html>Not a KML</html>`,
        }).as('getInvalidKmlFile')

        const onlineUrlNotReachable = 'http://example.com/kml-file.kml'
        cy.intercept('GET', onlineUrlNotReachable, {
            statusCode: 403,
        }).as('getNoReachableKmlFile')

        const outOfBoundKMLUrl = 'http://example.com/out-of-bound-kml-file.kml'
        cy.intercept('GET', outOfBoundKMLUrl, {
            fixture: outOfBoundKMLFile,
        }).as('getOutOfBoundKmlFile')

        cy.goToMapView(
            {
                layers: [
                    `KML|${outOfBoundKMLUrl}`,
                    `KML|${invalidFileOnlineUrl}`,
                    `KML|${onlineUrlNotReachable}`,
                ].join(';'),
            },
            true
        )
        cy.openMenuIfMobile()

        //---------------------------------------------------------------------
        cy.log('Test invalid external KML file from url parameter')
        cy.wait('@getInvalidKmlFile')
        cy.wait('@getNoReachableKmlFile')
        cy.wait('@getOutOfBoundKmlFile')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 3)
        cy.get('[data-cy="menu-section-active-layers"]')
            .should('be.visible')
            .children()
            .should('have.length', 3)
            .each(($layer, index) => {
                cy.wrap($layer)
                    .find('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.wrap($layer).find('[data-cy^="button-error-"]').should('be.visible').click()
                if (index === 0) {
                    cy.get(`[data-cy^="tippy-button-error-${onlineUrlNotReachable}-"]`)
                        .should('be.visible')
                        .contains('file not accessible')
                } else if (index === 1) {
                    cy.get(`[data-cy^="tippy-button-error-${invalidFileOnlineUrl}-"]`)
                        .should('be.visible')
                        .contains('file is empty')
                } else {
                    cy.get(`[data-cy^="tippy-button-error-${outOfBoundKMLUrl}-"]`)
                        .should('be.visible')
                        .contains('out of projection bounds')
                }
                cy.wrap($layer)
                    .find('[data-cy^="button-loading-metadata-spinner-"]')
                    .should('not.exist')
            })

        //---------------------------------------------------------------------
        // Test removing a layer
        cy.log('Test removing all invalid kml layer')
        cy.get(`[data-cy^="button-remove-layer-${invalidFileOnlineUrl}-"]:visible`).click()
        cy.get(`[data-cy^="button-remove-layer-${onlineUrlNotReachable}-"]:visible`).click()
        cy.get(`[data-cy^="button-remove-layer-${outOfBoundKMLUrl}-"]:visible`).click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
        cy.get('[data-cy="menu-section-active-layers"]').children().should('have.length', 0)

        //---------------------------------------------------------------------
        cy.log('Test online import invalid file')

        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        cy.get('[data-cy="import-file-online-url-input"]:visible').type(invalidFileOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getInvalidKmlFile')

        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="invalid-feedback-validation-error"]')
            .should('be.visible')
            .contains('Invalid file')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //---------------------------------------------------------------------
        cy.log('Test online import invalid url')
        const invalidOnlineUrl = 'hello world'

        cy.get('[data-cy="import-file-online-url-input"]:visible')
            .find('[data-cy="text-input-clear"]:visible')
            .click()

        cy.get('[data-cy="import-file-online-url-input"]:visible').type(invalidOnlineUrl)

        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="invalid-feedback-error"]')
            .should('be.visible')
            .contains('URL is not valid')
        cy.get('[data-cy="import-file-load-button"]:visible').should('be.disabled')

        cy.get('[data-cy="import-file-online-url-input"]').type('{enter}')
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="invalid-feedback-error"]')
            .should('be.visible')
            .contains('URL is not valid')

        //---------------------------------------------------------------------
        cy.log('Test online import url not reachable')

        cy.get('[data-cy="import-file-online-url-input"]:visible')
            .find('[data-cy="text-input-clear"]:visible')
            .click()

        cy.get('[data-cy="import-file-online-url-input"]:visible').type(onlineUrlNotReachable)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getNoReachableKmlFile')

        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="invalid-feedback-validation-error"]')
            .should('be.visible')
            .contains('file not accessible')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //----------------------------------------------------------------------
        // Attach an online KML file that is out of bounds
        cy.log('Test add an online KML file that is out of bounds')
        cy.get('[data-cy="import-file-online-url-input"]:visible')
            .find('[data-cy="text-input-clear"]:visible')
            .click()
        cy.get('[data-cy="import-file-online-url-input"]:visible').type(outOfBoundKMLUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getOutOfBoundKmlFile')

        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="invalid-feedback-validation-error"]')
            .should('be.visible')
            .contains('out of projection bounds')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //----------------------------------------------------------------------
        // Attach an online empty KML file
        cy.log('Test add an online empty KML file')
        const emptyKMLUrl = 'http://example.com/empty-kml-file.kml'
        cy.intercept('GET', emptyKMLUrl, {
            fixture: emptyKMLFile,
        }).as('getEmptyKmlFile')

        cy.get('[data-cy="import-file-online-url-input"]:visible')
            .find('[data-cy="text-input-clear"]:visible')
            .click()
        cy.get('[data-cy="import-file-online-url-input"]:visible').type(emptyKMLUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getEmptyKmlFile')

        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="invalid-feedback-validation-error"]')
            .should('be.visible')
            .contains('file is empty')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //----------------------------------------------------------------------
        // Test local import error handling
        cy.log('Switch to local import')
        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')
        cy.get('[data-cy="import-file-load-button"]:visible').should('be.disabled')

        //----------------------------------------------------------------------
        // Attach a local invalid KML file
        cy.log('Test add a local invalid KML file')
        cy.get('[data-cy="import-local-file-input"]').selectFile(
            {
                contents: Cypress.Buffer.from('Invalid kml file contents'),
                fileName: 'file.txt',
                mimeType: 'text/plain',
                lastModified: Date.now(),
            },
            { force: true }
        )
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.get('[data-cy="import-local-file-input-text"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-local-file-invalid-feedback"]')
            .should('be.visible')
            .contains('Invalid file')
        cy.get('[data-cy="import-file-load-button"]:visible').should('be.disabled')

        //----------------------------------------------------------------------
        // Attach a local KML file that is out of bounds
        cy.log('Test add a local KML file that is out of bounds')
        cy.fixture(outOfBoundKMLFile, null).as('outOfBoundKMLFileFixture')
        cy.get('[data-cy="import-local-file-input"]').selectFile('@outOfBoundKMLFileFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.get('[data-cy="import-local-file-input-text"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-local-file-invalid-feedback"]')
            .should('be.visible')
            .contains('out of projection bounds')
        cy.get('[data-cy="import-file-load-button"]:visible').should('be.disabled')

        //----------------------------------------------------------------------
        // Attach a local empty KML file
        cy.log('Test add a local invalid KML file')
        cy.fixture(emptyKMLFile, null).as('emptyKMLFileFixture')
        cy.get('[data-cy="import-local-file-input"]').selectFile('@emptyKMLFileFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.get('[data-cy="import-local-file-input-text"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-local-file-invalid-feedback"]')
            .should('be.visible')
            .contains('file is empty')
        cy.get('[data-cy="import-file-load-button"]:visible').should('be.disabled')

        //----------------------------------------------------------------------
        // Close the import tool
        cy.log('Test close import tool')
        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')

        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]').should('not.be.visible')
        cy.get('[data-cy="menu-section-no-layers"]').should('be.visible')
    })
    it('Import GPX file', () => {
        const bgLayer = 'test.background.layer2'
        const gpxFileName = 'external-gpx-file.gpx'
        const gpxFileFixture = `import-tool/${gpxFileName}`

        cy.goToMapView({}, true)
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        // the menu should be automatically closed on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        // Test the import of an online GPX file
        cy.log('Test online import')
        const validOnlineUrl = 'http://example.com/valid-gpx-file.gpx'
        const gpxOnlineLayerId = `GPX|${validOnlineUrl}`
        cy.intercept('GET', validOnlineUrl, {
            fixture: gpxFileFixture,
        }).as('getGpxFile')

        // Type a valid online GPX file URL
        cy.get('[data-cy="import-file-online-url-input"]:visible').type(validOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait('@getGpxFile')

        // Assertions for successful import
        cy.get('[data-cy="import-file-online-url-input"]')
            .find('[data-cy="text-input"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-local-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.log('Test that the single gpx feature is in center of the view (zoom to extent check)')
        cy.readStoreValue('state.position.center').then((center) => {
            cy.wrap(center[0]).should('be.closeTo', 2604663.19, 1)
            cy.wrap(center[1]).should('be.closeTo', 1210998.57, 1)
        })
        cy.checkOlLayer([bgLayer, gpxOnlineLayerId])

        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')

        cy.log('Test adding a local GPX file')
        const gpxFileLayerId = `GPX|${gpxFileName}`
        cy.fixture(gpxFileFixture).as('gpxFileFixture')
        cy.get('[data-cy="import-local-file-input"]').selectFile('@gpxFileFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        // Assertions for successful import
        cy.get('[data-cy="import-local-file-input-text"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')

        cy.log('Check that the GPX layer has been added to the map')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 2)
        cy.checkOlLayer([bgLayer, gpxOnlineLayerId, gpxFileLayerId])

        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')

        //---------------------------------------------------------------------
        // Test reloading the page
        cy.log('Test reloading the page should only keep online external layers')
        cy.reload()
        cy.waitMapIsReady()
        cy.wait('@getGpxFile')
        // only the URL GPX should be kept while reloading
        cy.checkOlLayer([bgLayer, gpxOnlineLayerId])
        // Test removing a layer
        cy.log('Test removing an external GPX layer')
        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-${gpxOnlineLayerId}-"]:visible`).click()
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
    })
})
