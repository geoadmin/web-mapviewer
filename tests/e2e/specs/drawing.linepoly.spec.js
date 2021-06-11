import { checkKMLFileResponse, mockResponse } from '../drawing.helper'

const olSelector = '.ol-viewport'

describe('Drawing', () => {
    it('creates a polygon by re-clicking first point', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.goToDrawing()
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        cy.readDrawingFeatures('Polygon')
        cy.wait('@saveFile').then((interception) =>
            checkKMLFileResponse(
                interception,
                ['LINE', '<Data name="color"><value>#ff0000</value>'],
                true
            )
        )
    })

    it('changes color of line/ polygon', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.mockupBackendResponse('files/**', { ...mockResponse, status: 'updated' }, 'modifyFile')
        cy.goToDrawing()
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)
        cy.readDrawingFeatures('Polygon')
        cy.wait('@saveFile').then((interception) =>
            checkKMLFileResponse(
                interception,
                ['LINE', '<Data name="color"><value>#ff0000</value>'],
                true
            )
        )

        // Opening line popup
        cy.get('.line-style').click()
        cy.get('.line-style-popup').should('be.visible')

        cy.get('.line-style-popup .color-select-box > div:nth-child(1)').click()
        cy.checkDrawnGeoJsonProperty('color', '#000000')
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="color"><value>#000000</value>'
            )
        )
    })

    it('creates a line with double click', () => {
        cy.goToDrawing()
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).dblclick(120, 240)
        cy.readDrawingFeatures('LineString', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos.length).to.equal(3)
        })
        cy.get(olSelector).click(500, 500) // do nothing, already finished
        cy.readDrawingFeatures('LineString', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos.length).to.equal(3)
        })
    })
})
