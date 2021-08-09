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
            checkKMLFileResponse(interception, ['marker'], true)
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq(mockResponse.adminId)
            expect(ids.fileId).to.eq(mockResponse.fileId)
        })

        cy.get(olSelector).click('center')
        cy.wait('@modifyFile').then((interception) =>
            checkKMLFileResponse(interception, ['marker'])
        )
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 150)
        cy.get(olSelector).dblclick(150, 150)
        cy.wait('@modifyFile').then((interception) =>
            checkKMLFileResponse(interception, ['marker', 'line'])
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq(mockResponse.adminId)
            expect(ids.fileId).to.eq(mockResponse.fileId)
        })
    })
})
