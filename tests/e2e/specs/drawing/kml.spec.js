const olSelector = '.ol-viewport'

describe('Drawing saving KML', () => {
    it('saves a KML on draw end', () => {
        cy.goToDrawing()
        cy.clickDrawingTool('marker')

        cy.get(olSelector).dblclick('center')
        cy.wait('@post-kml').then((interception) =>
            cy.checkKMLFileResponse(interception, ['marker'], true)
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('1234_adminId')
            expect(ids.fileId).to.eq('1234_fileId')
        })

        cy.get(olSelector).click('center')
        cy.wait('@update-kml').then((interception) =>
            cy.checkKMLFileResponse(interception, ['marker'])
        )
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 200)
        cy.get(olSelector).dblclick(150, 200)
        cy.wait('@update-kml').then((interception) =>
            cy.checkKMLFileResponse(interception, ['marker', 'line'])
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('1234_adminId')
            expect(ids.fileId).to.eq('1234_fileId')
        })
    })
})
