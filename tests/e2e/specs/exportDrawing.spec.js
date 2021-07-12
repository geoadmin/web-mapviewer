import { recurse } from 'cypress-recurse'

const olSelector = '.ol-viewport'
const downloadsFolder = Cypress.config('downloadsFolder')

const drawGeoms = () => {
    cy.clickDrawingTool('marker')
    cy.get(olSelector).click(170, 190)

    cy.clickDrawingTool('text')
    cy.get(olSelector).click(200, 190)

    cy.clickDrawingTool('measure')
    cy.get(olSelector).click(100, 150)
    cy.get(olSelector).click(150, 150)
    cy.get(olSelector).click(150, 180)
    cy.get(olSelector).click(100, 150)

    cy.clickDrawingTool('line')
    cy.get(olSelector).click(210, 150)
    cy.get(olSelector).click(220, 150)
    cy.get(olSelector).dblclick(230, 180)
}

const isNonEmptyString = (x) => {
    return Boolean(x && x.length)
}

const checkFiles = (extension, callback) => {
    recurse(
        () => cy.task('findFiles', { folderName: downloadsFolder, extension: extension }),
        isNonEmptyString,
        {
            delay: 100,
            timeout: 10000,
        }
    ).then((files) => {
        const fileName = `${downloadsFolder}/${files[files.length - 1]}`
        expect(fileName).to.contains(`map.geo.admin.ch_${extension.toUpperCase()}_`)
        cy.readFile(fileName, { timeout: 15000 }).should('have.length.gt', 50).then(callback)
    })
}

describe('Export drawing', () => {
    beforeEach(() => {
        cy.task('deleteFolder', downloadsFolder)
    })
    it('export KML', () => {
        cy.goToDrawing()
        drawGeoms()
        cy.get('.draw-action-btns :nth-child(2) > button').click()
        cy.get('.export-menu :nth-child(1) > a').click()

        const checkCallback = (content) => {
            ;['measure', 'marker', 'text', 'line'].forEach((type) => {
                expect(content).to.contains(`<value>${type}</value>`)
            })
            expect(content).to.contains('<value>new text</value>')
            expect(content).to.contains('/icon/bicycle-255,0,0.png')
        }
        checkFiles('kml', checkCallback)
    })

    it('export GPX', () => {
        cy.goToDrawing()
        drawGeoms()
        cy.get('.draw-action-btns :nth-child(2) > button').click()
        cy.get('.export-menu :nth-child(2) > a').click()

        const checkCallback = (content) => {
            ;['MEASURE', 'MARKER', 'TEXT', 'LINE'].forEach((type) => {
                expect(content).to.contains(`<type>${type}</type>`)
            })
        }
        checkFiles('gpx', checkCallback)
    })
})
