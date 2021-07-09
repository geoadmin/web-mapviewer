import { recurse } from 'cypress-recurse'

const olSelector = '.ol-viewport'
const downloadsFolder = Cypress.config('downloadsFolder')

describe('Export drawing', () => {
    beforeEach(() => {
        cy.task('deleteFolder', downloadsFolder)
    })
    it('export KML', () => {
        cy.goToDrawing()

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

        cy.get('.draw-action-btns :nth-child(2)').click()
        const isNonEmptyString = (x) => {
            return Boolean(x && x.length)
        }

        recurse(
            () => cy.task('findFiles', { folderName: downloadsFolder, extension: 'kml' }),
            isNonEmptyString,
            {
                delay: 100,
                timeout: 10000,
            }
        ).then((files) => {
            const fileName = `${downloadsFolder}/${files[files.length - 1]}`
            expect(fileName).to.contains('map.geo.admin.ch_KML_')
            cy.readFile(fileName, { timeout: 15000 })
                .should('have.length.gt', 50)
                .then((str) => {
                    ;['measure', 'marker', 'text', 'line'].forEach((type) => {
                        expect(str).to.contains(`<value>${type}</value>`)
                    })
                    expect(str).to.contains('<value>new text</value>')
                    expect(str).to.contains('/icon/bicycle-255,0,0.png')
                })
        })
    })
})
