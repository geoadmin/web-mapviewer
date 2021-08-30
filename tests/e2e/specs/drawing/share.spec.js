const shareButton = '[data-cy="drawing-toolbox-share-button"]'

const testGeoms = (features) => {
    expect(features).to.have.length(4)
    cy.wrap(features.find((f) => f.get('type') === 'MEASURE')).should('exist')
    cy.wrap(features.find((f) => f.get('type') === 'LINE')).should('exist')
    cy.wrap(features.find((f) => f.get('type') === 'TEXT')).should('exist')
    cy.wrap(features.find((f) => f.get('type') === 'MARKER')).should('exist')
}

describe('Drawing toolbox actions', () => {
    it('share drawing', () => {
        cy.goToDrawing()
        cy.intercept('POST', '/files*').as('filePost')
        cy.intercept('/map?layers=KML').as('page')
        cy.drawGeoms()
        cy.wait('@filePost')

        cy.get(shareButton).click()
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
                            cy.get(shareButton).click()
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
