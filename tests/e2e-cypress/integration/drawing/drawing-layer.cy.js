/// <reference types="cypress" />

describe('A drawing layer is added at the end of the drawing session', () => {
    it('creates a layers in the layer stack that contains the drawing', () => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.waitUntilDrawingIsAdded()
        cy.readStoreValue('state.layers.activeLayers').then((layers) => {
            expect(layers).to.be.an('Array').lengthOf(1)
            const [drawingLayer] = layers
            expect(drawingLayer.getID()).to.include('KML|')
            expect(drawingLayer.visible).to.be.true
        })
    })
    it("don't add layer adminId to the url", () => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.waitUntilDrawingIsAdded()
        cy.url().should('not.contain', 'adminId')
    })
    it('add kml file id in url while in drawing mode', () => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.wait('@post-kml')
        cy.url().should('match', /layers=[^;&]*KML|[^|Drawing,f,1]+/)
    })
})

describe('A drawing is cleared on layer removal', () => {
    it('clear the drawing when the drawing layer is removed', () => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.get(`[data-cy^="button-remove-layer-"]`).click()
        cy.readStoreValue('state.layers.activeLayers').then((layers) => {
            expect(layers).to.be.an('Array').lengthOf(0)
        })
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .then((features) => expect(features).to.have.length(0))
    })
})
