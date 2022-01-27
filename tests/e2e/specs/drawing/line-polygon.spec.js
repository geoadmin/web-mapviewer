import { forEachTestViewport } from '../../support'

const olSelector = '.ol-viewport'

const drawingStyleLineButton = '[data-cy="drawing-style-line-button"]'
const drawingStyleLinePopup = '[data-cy="drawing-style-line-popup"]'
const drawingDeleteLastPointButton = '[data-cy="drawing-delete-last-point-button"]'

describe('Line/Polygon tool', () => {
    forEachTestViewport((viewport, isMobileViewport, isTablet, dimensions) => {
        context(
            `viewport: ${viewport}`,
            {
                viewportWidth: dimensions.width,
                viewportHeight: dimensions.height,
            },
            () => {
                beforeEach(() => {
                    cy.goToDrawing(isMobileViewport)

                    cy.clickDrawingTool('line')
                    cy.get(olSelector).click(100, 200)
                    cy.get(olSelector).click(150, 200)
                })
                it('creates a polygon by re-clicking first point', () => {
                    cy.get(olSelector).click(150, 230)
                    cy.get(olSelector).click(100, 200)
                    cy.readDrawingFeatures('Polygon')
                    cy.wait('@post-kml').then((interception) =>
                        cy.checkKMLRequest(
                            interception,
                            ['line', '<Data name="color"><value>#ff0000</value>'],
                            true
                        )
                    )
                })
                it('changes color of line/ polygon', () => {
                    cy.get(olSelector).click(150, 230)
                    cy.get(olSelector).click(100, 200)
                    cy.readDrawingFeatures('Polygon')
                    cy.wait('@post-kml').then((interception) =>
                        cy.checkKMLRequest(
                            interception,
                            ['line', '<Data name="color"><value>#ff0000</value>'],
                            true
                        )
                    )

                    // Opening line popup
                    cy.get(drawingStyleLineButton).click()
                    cy.get(drawingStyleLinePopup).should('be.visible')

                    cy.get(`${drawingStyleLinePopup} [data-cy="color-selector-black"]`).click()
                    cy.checkDrawnGeoJsonProperty('color', '#000000')
                    cy.wait('@update-kml').then((interception) =>
                        expect(interception.request.body).to.contain(
                            '<Data name="color"><value>#000000</value>'
                        )
                    )
                })
                it('creates a line with double click', () => {
                    cy.get(olSelector).dblclick(120, 240)
                    cy.readDrawingFeatures('LineString', (features) => {
                        const coos = features[0].getGeometry().getCoordinates()
                        expect(coos.length).to.equal(3)
                    })
                    cy.get(olSelector).click(200, 300) // do nothing, already finished
                    cy.readDrawingFeatures('LineString', (features) => {
                        const coos = features[0].getGeometry().getCoordinates()
                        expect(coos.length).to.equal(3)
                    })
                })
                it('delete last point', () => {
                    cy.get(olSelector).click(180, 200)
                    cy.get(drawingDeleteLastPointButton).click()
                    cy.get(olSelector).dblclick(120, 240)
                    cy.readDrawingFeatures('LineString', (features) => {
                        const coos = features[0].getGeometry().getCoordinates()
                        expect(coos.length).to.equal(3)
                    })
                })
            }
        )
    })
})
