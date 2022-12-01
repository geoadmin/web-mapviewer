/// <reference types="cypress" />

const shareButton = '[data-cy="drawing-toolbox-share-button"]'

describe('Drawing toolbox actions', () => {
    beforeEach(() => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.wait('@post-kml')
    })
    context(`With shortlink`, () => {
        const dummyShortLink = 'https://dummy.short.link'
        beforeEach(() => {
            cy.intercept('POST', /^https?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                body: { shorturl: dummyShortLink },
            }).as('shortLink')
            cy.get(shareButton).click()
        })
        it('Generates a shorten URL for the public file share link', () => {
            cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                cy.wait('@shortLink').then((intercept) => {
                    expect(intercept.request.body).to.haveOwnProperty('url')
                    expect(intercept.request.body.url).to.contain(`/${ids.fileId}`)
                    // expect(intercept.request.body.url).to.not.contain(`@adminId=${ids.adminId}`)
                })
                // Check that the copied URL is the shorten one
                cy.get('[data-cy="drawing-share-normal-link"]').click()
                cy.readClipboardValue().then((clipboardText) => {
                    expect(clipboardText).to.be.equal(
                        dummyShortLink,
                        `Share link is not a shortlink`
                    )
                })
            })
        })
        it('Generates a shorten URL for the admin share link', () => {
            cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                cy.wait('@shortLink').then((intercept) => {
                    expect(intercept.request.body).to.haveOwnProperty('url')
                    expect(intercept.request.body.url).to.contain(`/${ids.fileId}`)
                    // expect(intercept.request.body.url).to.not.contain(`@adminId=${ids.adminId}`)
                })
                // Check that the copied URL is the shorten one
                cy.get('[data-cy="drawing-share-admin-link"]').click()
                cy.readClipboardValue().then((clipboardText) => {
                    expect(clipboardText).to.be.equal(
                        dummyShortLink,
                        `Share link is not a shortlink`
                    )
                })
            })
        })
    })
    context(`Without shortlink -> fallback to non shorten share url`, () => {
        beforeEach(() => {
            // Intercept the shortlink and return an HTTP 500 to test fallback to non shorten url
            cy.intercept('POST', /^https?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
                statusCode: 500,
            })
            cy.get(shareButton).click()
        })
        it('Generates a URL with the public file ID for a standard share link', () => {
            cy.get('[data-cy="drawing-share-normal-link"]').click()
            // checking that the ID present in the "normal" link matches the
            // public file ID (and not the admin ID)
            cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                cy.readClipboardValue().then((clipboardText) => {
                    expect(clipboardText).to.contain(`/${ids.fileId}`)
                    expect(clipboardText).to.not.contain(`@adminId=${ids.adminId}`)
                })
            })
        })
        it('Generates a URL with the adminId when sharing a "draw later" link', () => {
            cy.get('[data-cy="drawing-share-admin-link"]').click()
            cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
                cy.readClipboardValue().then((clipboardText) => {
                    expect(clipboardText).to.contain(`/${ids.fileId}`)
                    expect(clipboardText).to.contain(`@adminId=${ids.adminId}`)
                })
            })
        })
    })
})
