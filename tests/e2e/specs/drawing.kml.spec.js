import { checkKMLFileResponse, mockResponse } from '../drawing.helper'

const olSelector = '.ol-viewport'

describe('Drawing saving KML', () => {
    it('saves a KML on draw end', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')

        cy.goToDrawing()
        cy.clickDrawingTool('marker')

        cy.get(olSelector).dblclick('center')
        cy.wait('@saveFile').then((interception) =>
            checkKMLFileResponse(interception, ['MARKER'], true)
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq(mockResponse.adminId)
            expect(ids.fileId).to.eq(mockResponse.fileId)
        })

        cy.get(olSelector).click('center')
        cy.wait('@modifyFile').then((interception) =>
            checkKMLFileResponse(interception, ['MARKER'])
        )
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).dblclick(150, 100)
        cy.wait('@modifyFile').then((interception) =>
            checkKMLFileResponse(interception, ['MARKER', 'LINE'])
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq(mockResponse.adminId)
            expect(ids.fileId).to.eq(mockResponse.fileId)
        })
    })
})
