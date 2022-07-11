/// <reference types="cypress" />

describe('Delete action in the drawing module', () => {
    it('deletes the drawing when confirming the delete modal', () => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.get('[data-cy="drawing-toolbox-delete-button"]').click()
        cy.get('[data-cy="modal-confirm-button"]').click()
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .then((features) => {
                expect(features).to.have.length(0)
            })
        cy.get('[data-cy="drawing-toolbox-delete-button"]').should('have.attr', 'disabled')
        cy.get('[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-toggle-button"]').should('have.attr', 'disabled')
        cy.get('[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-main-button"]').should('have.attr', 'disabled')
        cy.get('[data-cy="drawing-toolbox-share-button"]').should('have.attr', 'disabled')
    })
})
