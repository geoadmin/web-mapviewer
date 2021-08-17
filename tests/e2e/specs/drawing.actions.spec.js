import { recurse } from 'cypress-recurse'

const olSelector = '.ol-viewport'
const downloadsFolder = Cypress.config('downloadsFolder')

const drawGeoms = () => {
    cy.clickDrawingTool('marker')
    cy.get(olSelector).click(170, 190)

    cy.clickDrawingTool('text')
    cy.get(olSelector).click(200, 190)

    cy.clickDrawingTool('measure')
    cy.get(olSelector).click(100, 200)
    cy.get(olSelector).click(150, 200)
    cy.get(olSelector).click(150, 230)
    cy.get(olSelector).click(100, 200)

    cy.clickDrawingTool('line')
    cy.get(olSelector).click(210, 200)
    cy.get(olSelector).click(220, 200)
    cy.get(olSelector).dblclick(230, 230)
}

const testGeoms = (features) => {
    expect(features).to.have.length(4)
    cy.wrap(features.find((f) => f.get('type') === 'MEASURE')).should('exist')
    cy.wrap(features.find((f) => f.get('type') === 'LINE')).should('exist')
    cy.wrap(features.find((f) => f.get('type') === 'TEXT')).should('exist')
    cy.wrap(features.find((f) => f.get('type') === 'MARKER')).should('exist')
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
            expect(content).to.contains('/icons/bicycle@1x-255,0,0.png')
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

    it('delete drawing', () => {
        cy.goToDrawing()
        drawGeoms()
        cy.get('.draw-action-btns > :nth-child(1)').click()
        cy.get('.ga-confirmation .modal-footer .btn-primary').click()

        cy.isDrawingEmpty()
        cy.get('.draw-action-btns > :nth-child(1)').should('have.attr', 'disabled')
        cy.get('.draw-action-btns :nth-child(2) > button').should('have.attr', 'disabled')
        cy.get('.draw-action-btns > :nth-child(3)').should('have.attr', 'disabled')
    })

    it.only('share drawing', () => {
        cy.goToDrawing()
        cy.intercept('POST', '/files*').as('filePost')
        cy.intercept('/map?layers=KML').as('page')
        drawGeoms()
        cy.wait('@filePost')

        cy.get('.draw-action-btns > :nth-child(3)').click()
        cy.get('.ga-share .form-group:nth-child(1) button').click()
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            cy.intercept('GET', `/${ids.fileId}`).as('file')
            cy.readClipboardValue().then((text) => {
                cy.visit(text)
                cy.reload()
                cy.wait('@file')
                cy.get('[data-cy="menu-button"]').click()
                cy.get('.menu-section-head-title:first').click()
                cy.wait('@filePost')
                cy.readStoreValue('state.drawing.drawingKmlIds').then((ids2) => {
                    cy.intercept('GET', `/${ids2.fileId}`).as('file2')
                    cy.wrap(ids).its('fileId').should('not.eq', ids2.fileId)
                    cy.wrap(ids).its('adminId').should('not.eq', ids2.adminId)
                    cy.readWindowValue('drawingManager')
                        .then((manager) => manager.source.getFeatures())
                        .then((features) => {
                            testGeoms(features)
                            cy.get('.draw-action-btns > :nth-child(3)').click()
                            cy.get('.ga-share .form-group:nth-child(2) button').click()
                            cy.readClipboardValue().then((text) => {
                                cy.visit(text)
                                cy.reload()
                                cy.wait('@file2')
                                cy.readStoreValue('state.drawing.drawingKmlIds').then((ids3) => {
                                    cy.wrap(ids3).its('fileId').should('eq', ids2.fileId)
                                    cy.wrap(ids3).its('adminId').should('eq', ids2.adminId)
                                    cy.readWindowValue('drawingManager')
                                        .then((manager) => manager.source.getFeatures())
                                        .then(testGeoms)
                                })
                            })
                        })
                })
            })
        })
    })
})
