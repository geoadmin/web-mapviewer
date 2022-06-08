/// <reference types="cypress" />

import { EditableFeatureTypes } from '@/api/features.api'

const olSelector = '.ol-viewport'

describe('Drawing saving KML', () => {
    beforeEach(() => {
        cy.goToDrawing()
    })

    it('saves a KML on draw end', () => {
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get(olSelector).click('center')
        cy.wait('@post-kml').then((interception) =>
            cy.checkKMLRequest(interception, [EditableFeatureTypes.MARKER], true)
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('1234_adminId')
            expect(ids.fileId).to.eq('1234_fileId')
        })
    })
    it('update the previously saved KML if anything is added to the drawing', () => {
        // drawing a marker and waiting for the KML to be posted (created)
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get(olSelector).click('center')
        cy.wait('@post-kml')
        cy.get('[data-cy="infobox-close"]').click()
        // adding another marker and wait for the update
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        // clicking just on the side of the first marker
        const width = Cypress.config('viewportWidth')
        const height = Cypress.config('viewportHeight')
        cy.get(olSelector).click(width / 2.0 + 50, height / 2.0, { force: true })
        cy.wait('@update-kml').then((interception) =>
            cy.checkKMLRequest(interception, [EditableFeatureTypes.MARKER])
        )
        cy.get('[data-cy="infobox-close"]').click()
        // adding a line and checking that the KML is updated again
        cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
        cy.get(olSelector).click(210, 200).click(220, 200).dblclick(230, 230, { force: true })
        cy.wait('@update-kml').then((interception) =>
            cy.checkKMLRequest(interception, [EditableFeatureTypes.MARKER, EditableFeatureTypes.LINEPOLYGON])
        )
        // verifying that we still have the same KML file/admin ID from the backend
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('1234_adminId')
            expect(ids.fileId).to.eq('1234_fileId')
        })
    })
})
