const shareButton = '[data-cy="drawing-toolbox-share-button"]'

describe('Drawing toolbox actions', () => {
    beforeEach(() => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.wait('@post-kml')
    })
    it('generates a URL with the public file ID for a standard share link', () => {
        cy.get(shareButton).click()
        cy.get('[data-cy="drawing-share-normal-link"]').click()
        // checking that the ID present in the "normal" link matches the
        // public file ID (and not the admin ID)
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            cy.readClipboardValue().then((clipboardText) => {
                expect(clipboardText).to.contain(`/${ids.fileId}`)
                expect(clipboardText).to.not.contain(`/${ids.adminId}`)
            })
        })
    })
    it('generates a URL with the adminId when sharing a "draw later" link', () => {
        cy.get(shareButton).click()
        cy.get('[data-cy="drawing-share-admin-link"]').click()
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            cy.readClipboardValue().then((clipboardText) => {
                expect(clipboardText).to.not.contain(`/${ids.fileId}`)
                expect(clipboardText).to.contain(`drawingAdminFileId=${ids.adminId}`)
            })
        })
    })
})
