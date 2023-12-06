/// <reference types="cypress" />

describe('Drawing layer management', () => {
    beforeEach(() => {
        cy.goToDrawing()
        cy.drawGeoms()
    })
    it('creates a layers in the layer stack that contains the drawing', () => {
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.waitUntilDrawingIsAdded()
        cy.readStoreValue('state.layers.activeLayers').then((layers) => {
            expect(layers).to.be.an('Array').lengthOf(1)
            const [drawingLayer] = layers
            expect(drawingLayer.getID()).to.include('KML|')
            expect(drawingLayer.visible).to.be.true
        })
    })
    it('clear the drawing when the drawing layer is removed', () => {
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.waitUntilDrawingIsAdded()
        cy.get(`[data-cy^="button-remove-layer-"]`).click()
        cy.readStoreValue('state.layers.activeLayers').then((layers) => {
            expect(layers).to.be.an('Array').lengthOf(0)
        })
        cy.readWindowValue('drawingLayer').should('not.exist')
    })
    it("don't add layer adminId to the url", () => {
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.waitUntilDrawingIsAdded()
        cy.url().should('not.contain', 'adminId')
    })
    it('add kml file id in url while in drawing mode', () => {
        cy.wait('@post-kml')
        cy.url().should('match', /layers=[^;&]*KML|[^|Drawing,f,1]+/)
    })
})
