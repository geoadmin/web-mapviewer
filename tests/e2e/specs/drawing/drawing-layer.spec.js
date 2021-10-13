/// <reference types="cypress" />

describe('A drawing layer is added at the end of the drawing session', () => {
    it('creates a layers, in the layer stack, that contains the drawing', () => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.readStoreValue('state.layers.activeLayers').then((layers) => {
            expect(layers).to.be.an('Array').lengthOf(1)
            const [drawingLayer] = layers
            expect(drawingLayer.getID()).to.include('KML|')
        })
    })
})
