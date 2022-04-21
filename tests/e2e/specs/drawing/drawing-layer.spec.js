/// <reference types="cypress" />

import { forEachTestViewport } from '../../support'

describe('A drawing layer is added at the end of the drawing session', () => {
    forEachTestViewport((viewport, isMobileViewport, isTabletViewport) => {
        it(`viewport: ${viewport} - creates a layers in the layer stack that contains the drawing`, () => {
            cy.viewport(viewport)
            cy.goToDrawing(isMobileViewport || isTabletViewport)
            cy.drawGeoms()
            cy.get('[data-cy="drawing-toolbox-close-button"]').click()
            cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                expect(layers).to.be.an('Array').lengthOf(1)
                const [drawingLayer] = layers
                expect(drawingLayer.getID()).to.include('KML|')
            })
        })
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
        cy.readStoreValue('state.drawing').then((drawing) => {
            expect(drawing.drawingKmlIds).to.be.null
        })
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .then((features) => expect(features).to.have.length(0))
    })
})
