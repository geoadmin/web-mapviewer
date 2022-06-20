import { EditableFeatureTypes } from '@/api/features.api'
import { Collection } from 'ol'

const olSelector = '.ol-viewport'

const latitude = 47.097
const longitude = 7.743
const zoom = 9.5

describe('Measure Overlays handling', () => {
    it('draw measure, abort, and check that there are no overlays left', () => {
        //Open drawing mode
        cy.goToDrawing('fr', { lat: latitude, lon: longitude, z: zoom }, true)
        cy.readWindowValue('map').then((map) => {
            const nbOverlaysAtBeginning = map.getOverlays().getLength()
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 0)
            //Start drawing a measure
            cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
            cy.get(olSelector).click('left')
            cy.get(olSelector).click('center')
            //Overlays should be visible
            cy.readWindowValue('map')
                .then((map) => map.getOverlays().getLength())
                .should('be.greaterThan', nbOverlaysAtBeginning)
            //Cancel drawing
            cy.clickDrawingTool(EditableFeatureTypes.MEASURE, true)
            //Overlays should have disappeared
            cy.readWindowValue('map')
                .then((map) => map.getOverlays().getLength())
                .should('be.at.most', nbOverlaysAtBeginning)
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 0)
        })
    })
})
