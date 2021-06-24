import { checkKMLFileResponse, mockResponse } from '../drawing.helper'

const olSelector = '.ol-viewport'

describe('Measure', () => {
    it('creates a measure polygon', () => {
        cy.mockupBackendResponse('files', mockResponse, 'saveFile')
        cy.goToDrawing()
        cy.clickDrawingTool('measure')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).click(100, 100)

        cy.get('.tooltip-measure').eq(0).should('have.text', '824.53 km²')
        cy.get('.tooltip-measure').eq(1).should('have.text', '138.75 km')
        cy.get('.draw-measure-tmp').eq(12).should('have.text', '130 km')
        cy.get('.drawing-style-popup').should('not.exist')

        cy.wait('@saveFile').then((interception) =>
            checkKMLFileResponse(
                interception,
                ['MEASURE', '<Data name="color"><value>#ff0000</value>'],
                true
            )
        )
    })

    it('line should not have measure tooltips', () => {
        cy.goToDrawing()
        cy.clickDrawingTool('line')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).dblclick(120, 240)

        cy.get('.tooltip-measure').should('not.exist')
        cy.get('.draw-measure-tmp').should('not.exist')
        cy.get('.drawing-style-popup').should('be.visible')
    })

    it('creates a measure line', () => {
        cy.goToDrawing()
        cy.clickDrawingTool('measure')
        cy.get(olSelector).click(100, 100)
        cy.get(olSelector).click(150, 150)
        cy.get(olSelector).dblclick(120, 240)

        cy.get('.tooltip-measure').eq(0).should('have.text', '135.38 km')
        // no area for line
        cy.get('.tooltip-measure').eq(1).should('not.exist')
        cy.get('.draw-measure-tmp').eq(12).should('have.text', '130 km')
        cy.get('.drawing-style-popup').should('not.exist')
    })
})
