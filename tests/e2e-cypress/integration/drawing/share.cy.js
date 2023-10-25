/// <reference types="cypress" />

const shareButton = '[data-cy="drawing-toolbox-share-button"]'

describe('Drawing toolbox actions', () => {
    let adminId = null
    let kmlId = null
    beforeEach(() => {
        cy.goToDrawing()
        cy.drawGeoms()
        cy.wait('@post-kml').then((intercept) => {
            adminId = intercept.response.body.admin_id
            kmlId = intercept.response.body.id
        })
    })
    context(`With shortlink`, () => {
        const publicShortlink = 'https://s.geo.admin.ch/public-shortlink'
        const adminshortlink = 'https://s.geo.admin.ch/admin-shortlink'
        beforeEach(() => {
            cy.intercept(
                'POST',
                /^https?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//,
                (req) => {
                    expect(req.body).to.haveOwnProperty('url')
                    expect(req.body.url).to.contain(`/${kmlId}`)
                    if (req.body.url.includes(`@adminId=`)) {
                        req.reply({ statusCode: 201, body: { shorturl: adminshortlink } })
                    } else {
                        req.reply({ statusCode: 201, body: { shorturl: publicShortlink } })
                    }
                }
            ).as('shortLink')
            cy.get(shareButton).click()
        })
        it('Generates a shorten URL for the public file share link', () => {
            // we expect two shortlink; one public link and one admin link
            for (let i = 0; i < 2; i++) {
                cy.wait('@shortLink')
            }

            // Check that the copied URL is the shorten one
            cy.get('[data-cy="drawing-share-normal-link"]').focus().realClick()
            cy.readClipboardValue().then((clipboardText) => {
                expect(clipboardText).to.be.equal(
                    publicShortlink,
                    `Share link is not a public shortlink`
                )
            })
        })
        it('Generates a shorten URL for the admin share link', () => {
            // we expect two shortlink; one public link and one admin link
            for (let i = 0; i < 2; i++) {
                cy.wait('@shortLink')
            }
            // Check that the copied URL is the shorten one
            cy.get('[data-cy="drawing-share-admin-link"]').focus().realClick()
            cy.readClipboardValue().then((clipboardText) => {
                expect(clipboardText).to.be.equal(
                    adminshortlink,
                    `Share link is not an admin shortlink`
                )
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
            cy.get('[data-cy="drawing-share-normal-link"]').focus().realClick()
            // checking that the ID present in the "normal" link matches the
            // public file ID (and not the admin ID)
            cy.readClipboardValue().then((clipboardText) => {
                expect(clipboardText).to.contain(`/${kmlId}`)
                expect(clipboardText).to.not.contain(`@adminId`)
            })
        })
        it('Generates a URL with the adminId when sharing a "draw later" link', () => {
            cy.get('[data-cy="drawing-share-admin-link"]').focus().realClick()
            cy.readClipboardValue().then((clipboardText) => {
                expect(clipboardText).to.contain(`/${kmlId}`)
                expect(clipboardText).to.contain(`@adminId=${adminId}`)
            })
        })
    })
})
