import { forEachTestViewport } from '../../support'

const deleteButton = '[data-cy="drawing-toolbox-delete-button"]'
const quickExportButton = '[data-cy="drawing-toolbox-quick-export-button"]'
const chooseExportFormatButton = '[data-cy="drawing-toolbox-choose-export-format-button"]'
const shareButton = '[data-cy="drawing-toolbox-share-button"]'

describe('Delete action in the drawing module', () => {
    forEachTestViewport((viewport, isMobileViewport, isTabletViewport) => {
        it(`viewport: ${viewport} - deletes the drawing when confirming the delete modal`, () => {
            cy.viewport(viewport)
            cy.goToDrawing(isMobileViewport || isTabletViewport)
            cy.drawGeoms()
            cy.get(deleteButton).click()
            cy.get('[data-cy="modal-confirm-button"]').click()
            cy.readWindowValue('drawingManager')
                .then((manager) => manager.source.getFeatures())
                .then((features) => {
                    expect(features).to.have.length(0)
                })
            cy.get(deleteButton).should('have.attr', 'disabled')
            cy.get(chooseExportFormatButton).should('have.attr', 'disabled')
            cy.get(quickExportButton).should('have.attr', 'disabled')
            cy.get(shareButton).should('have.attr', 'disabled')
        })
    })
})
