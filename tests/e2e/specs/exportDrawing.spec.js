const olSelector = '.ol-viewport'

const drawGeoms = () => {
    cy.clickDrawingTool('measure')
    cy.get(olSelector).click(100, 150)
    cy.get(olSelector).click(150, 150)
    cy.get(olSelector).click(150, 180)
    cy.get(olSelector).click(100, 150)

    cy.clickDrawingTool('marker')
    cy.get(olSelector).click(170, 190)

    cy.clickDrawingTool('text')
    cy.get(olSelector).click(200, 190)

    cy.clickDrawingTool('line')
    cy.get(olSelector).click(210, 150)
    cy.get(olSelector).click(220, 150)
    cy.get(olSelector).dblclick(230, 180)
}

describe('Export drawing', () => {
    it('export KML', () => {
        cy.goToDrawing()
        drawGeoms()
        cy.get('.draw-action-btns :nth-child(2) > button').click()
        cy.get('.export-menu :nth-child(1) > a').click()
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000) // to be sure that download finished
        const downloadsFolder = Cypress.config('downloadsFolder')
        cy.task('getFiles', downloadsFolder).then((files) => {
            const fileName = `${downloadsFolder}\\${files[files.length - 1]}`
            expect(fileName).to.contains('map.geo.admin.ch_KML_')
            cy.readFile(fileName).then((str) => {
                ;['measure', 'marker', 'text', 'line'].forEach((type) => {
                    expect(str).to.contains(`<value>${type}</value>`)
                })
                expect(str).to.contains('<value>new text</value>')
                expect(str).to.contains('/icon/bicycle-255,0,0.png')
                cy.task('removeFile', fileName)
            })
        })
    })

    it('export GPX', () => {
        cy.goToDrawing()
        drawGeoms()
        cy.get('.draw-action-btns :nth-child(2) > button').click()
        cy.get('.export-menu :nth-child(2) > a').click()
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000) // to be sure that download finished
        const downloadsFolder = Cypress.config('downloadsFolder')
        cy.task('getFiles', downloadsFolder).then((files) => {
            const fileName = `${downloadsFolder}\\${files[files.length - 1]}`
            expect(fileName).to.contains('map.geo.admin.ch_GPX_')
            cy.readFile(fileName).then((str) => {
                ;['MEASURE', 'MARKER', 'TEXT', 'LINE'].forEach((type) => {
                    expect(str).to.contains(`<type>${type}</type>`)
                })
                cy.task('removeFile', fileName)
            })
        })
    })
})
