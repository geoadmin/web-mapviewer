import { forEachTestViewport } from '../../support'

const olSelector = '.ol-viewport'

describe('Drawing saving KML', () => {
    forEachTestViewport((viewport, isMobileViewport) => {
        it(`viewport: ${viewport} - saves a KML on draw end`, () => {
            cy.viewport(viewport)
            cy.goToDrawing(isMobileViewport)
            cy.clickDrawingTool('marker')

            cy.get(olSelector).dblclick('center')
            cy.wait('@post-kml').then((interception) =>
                cy.checkKMLRequest(interception, ['marker'], true)
            )
            cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                expect(ids.adminId).to.eq('1234_adminId')
                expect(ids.fileId).to.eq('1234_fileId')
            })

            cy.get(olSelector).click('center')
            cy.wait('@update-kml').then((interception) =>
                cy.checkKMLRequest(interception, ['marker'])
            )
            cy.clickDrawingTool('line')
            cy.get(olSelector).click(100, 200)
            cy.get(olSelector).dblclick(150, 200)
            cy.wait('@update-kml').then((interception) =>
                cy.checkKMLRequest(interception, ['marker', 'line'])
            )
            cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                expect(ids.adminId).to.eq('1234_adminId')
                expect(ids.fileId).to.eq('1234_fileId')
            })
        })
    })
})
