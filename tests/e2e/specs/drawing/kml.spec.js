import { forEachTestViewport } from '../../support'

const olSelector = '.ol-viewport'

describe('Drawing saving KML', () => {
    forEachTestViewport((viewport, isMobileViewport, isTabletViewport, dimensions) => {
        context(
            `viewport: ${viewport}`,
            {
                viewportWidth: dimensions.width,
                viewportHeight: dimensions.height,
            },
            () => {
                beforeEach(() => {
                    cy.goToDrawing(isMobileViewport)
                })

                it('saves a KML on draw end', () => {
                    cy.clickDrawingTool('marker')
                    cy.get(olSelector).click('center')
                    cy.wait('@post-kml').then((interception) =>
                        cy.checkKMLRequest(interception, ['marker'], true)
                    )
                    cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                        expect(ids.adminId).to.eq('1234_adminId')
                        expect(ids.fileId).to.eq('1234_fileId')
                    })
                })
                it('update the previously saved KML if anything is added to the drawing', () => {
                    // drawing a marker and waiting for the KML to be posted (created)
                    cy.clickDrawingTool('marker')
                    cy.get(olSelector).click('center')
                    cy.wait('@post-kml')
                    // adding another marker and wait for the update
                    cy.clickDrawingTool('marker')
                    // clicking just on the side of the first marker
                    cy.get(olSelector).click(dimensions.width / 2.0 + 50, dimensions.height / 2.0)
                    cy.wait('@update-kml').then((interception) =>
                        cy.checkKMLRequest(interception, ['marker'])
                    )
                    // adding a line and checking that the KML is updated again
                    cy.clickDrawingTool('line')
                    cy.get(olSelector).click(100, 200)
                    cy.get(olSelector).dblclick(150, 200)
                    cy.wait('@update-kml').then((interception) =>
                        cy.checkKMLRequest(interception, ['marker', 'line'])
                    )
                    // verifying that we still have the same KML file/admin ID from the backend
                    cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                        expect(ids.adminId).to.eq('1234_adminId')
                        expect(ids.fileId).to.eq('1234_fileId')
                    })
                })
            }
        )
    })
})
