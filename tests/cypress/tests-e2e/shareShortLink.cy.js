/// <reference types="cypress" />

describe('Testing the share menu', () => {
    const dummyShortLink = 'https://dummy.short.link'
    const dummyEmbeddedShortLink = 'https://dummy.embedded.short.link'
    beforeEach(() => {
        cy.goToMapView()
        cy.get('[data-cy="menu-button"]').click()
        // intercepting short link requests, in order not to have to import the config
        // we check only for the first part of the URL (without the staging)
        cy.intercept('POST', /^https?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, (req) => {
            if (req.body && req.body.url && req.body.url.indexOf('embed') !== -1) {
                req.reply({
                    shorturl: dummyEmbeddedShortLink,
                })
            } else {
                req.reply({
                    shorturl: dummyShortLink,
                })
            }
        }).as('shortLink')
        cy.intercept(dummyEmbeddedShortLink, (req) => {
            req.followRedirect = true
            req.redirect(Cypress.config('baseUrl') + '#/?embed=true')
        }).as('dummyShortLinkAccess')
    })
    context('Short link generation', () => {
        it('Does not generate a short link at startup', () => {
            cy.readStoreValue('state.share.shortLink').should('eq', null)
        })
        it('Creates a short linked version of the URL the first time the menu section is opened', () => {
            cy.get('[data-cy="menu-share-section"]').click()
            // a short link should be generated as it is our first time opening this section
            cy.wait('@shortLink')
            cy.readStoreValue('state.share.shortLink').should('eq', dummyShortLink)
        })
        it('deletes the short link and close the menu as soon as the state of the map (the URL) has changed', () => {
            cy.get('[data-cy="menu-share-section"]').click()
            // a short link should be generated as it is our first time opening this section
            cy.wait('@shortLink')
            // We close the menu to still be able too click on the zoom button
            cy.get('[data-cy="menu-button"]').click()
            // zoom in the map in order to change the URL
            cy.get('[data-cy="zoom-in"]').click()
            // checking that the shortLink value doesn't exist anymore
            cy.readStoreValue('state.share.shortLink').should('eq', null)
            // opening the general menu again
            cy.get('[data-cy="menu-button"]').click
            // checking that the share menu has been closed
            cy.get('[data-cy="share-menu-opened"]').should('not.exist')
        })
        context(
            'Geolocation management while generating share links',
            {
                env: {
                    browserPermissions: {
                        geolocation: 'allow',
                    },
                },
            },
            () => {
                beforeEach(() => {
                    // closing the menu
                    cy.get('[data-cy="menu-button"]').click()
                    // activating geolocation
                    cy.get('[data-cy="geolocation-button"]').click()
                    // checking that the app has added geolocation=true to the URL
                    cy.url().should('contain', 'geolocation')
                    // opening the menu once again
                    cy.get('[data-cy="menu-button"]').click()
                })
                it('does not add geolocation url param to the shared link, if geolocation is active', () => {
                    // opening the share menu, and checking that the link generated is without geolocation=true in the URL
                    cy.get('[data-cy="menu-share-section"]').click()
                    cy.wait('@shortLink').then((intercept) => {
                        expect(intercept.request.body).to.haveOwnProperty('url')
                        expect(intercept.request.body.url).to.not.contain('geolocation')
                    })
                })
                it('generates a short link with a balloon marker when the geolocation API was active and position tracked while generating the shortlink', () => {
                    // opening the share menu, and checking that the link generated has a param crosshair (so that the person opening the link will see where the user was standing)
                    cy.get('[data-cy="menu-share-section"]').click()
                    cy.wait('@shortLink').then((intercept) => {
                        expect(intercept.request.body).to.haveOwnProperty('url')
                        expect(intercept.request.body.url).to.contain('crosshair=marker')
                    })
                })
                it('does not generate a link with a balloon if the app stops tracking the GPS position', () => {
                    // closing the menu
                    cy.get('[data-cy="menu-button"]').click()
                    // faking a move of the app, so that the GPS is still active, but the tracking is off
                    cy.writeStoreValue('setGeolocationTracking', {
                        tracking: false,
                        dispatcher: 'e2e-test',
                    })
                    // opening the menu once again
                    cy.get('[data-cy="menu-button"]').click()
                    // opening the share menu, and checking that the link generated does not have a crosshair URL param
                    cy.get('[data-cy="menu-share-section"]').click()
                    cy.wait('@shortLink').then((intercept) => {
                        expect(intercept.request.body).to.haveOwnProperty('url')
                        expect(intercept.request.body.url).to.not.contain('crosshair=marker')
                    })
                })
            }
        )
    })
    context('Social networks', () => {
        const checkSocialNetworkType = (type, matchingUrl) => {
            cy.get(`[data-cy="share-shortlink-${type}"]`).should('be.visible').click()
            cy.get('@open').should('have.been.calledWith', Cypress.sinon.match(matchingUrl))
        }
        it('opens different social networks to share short link ', () => {
            cy.get('[data-cy="menu-share-section"]').click()
            cy.wait('@shortLink')
            // stubbing window.open so that the app doesn't open new tab but let us see what URL was used to do so
            cy.window().then((win) => {
                cy.stub(win, 'open').as('open')
            })
            checkSocialNetworkType(
                'email',
                `mailto:?subject=Link%20to%20the%20geoportal%20of%20Swiss%20Confederation&body=${encodeURIComponent(dummyShortLink + '\r\n')}`
            )
            cy.log('opens an email containing a short link')
            cy.intercept('**/qrcode').as('qrCode')
            checkSocialNetworkType(
                'qrcode',
                `/qrcode/generate?url=${encodeURIComponent(dummyShortLink)}`
            )
            cy.log('opens service-qrcode with the short link as url')
            checkSocialNetworkType(
                'facebook',
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dummyShortLink)}`
            )
            cy.log('opens a facebook popup with the short link as content')
            checkSocialNetworkType(
                'twitter',
                `https://twitter.com/intent/tweet?text=&url=${encodeURIComponent(dummyShortLink)}`
            )
            cy.log('opens a twitter popup with the short link as content')
            checkSocialNetworkType(
                'whatsapp',
                `https://api.whatsapp.com/send?text=%0D%0A${encodeURIComponent(dummyShortLink)}`
            )
            cy.log('opens a whatsapp popup with the short link as content')
            // count total calls to check for duplicates since we can only have one stub
            cy.get('@open').should('have.callCount', 5)
            cy.log('opens everything exactly once')
        })
    })
    context(
        'iFrame snippet generation',
        // embed is only available on tablet or higher viewports
        {
            viewportWidth: 800,
            viewportHeight: 600,
        },
        () => {
            const checkIFrameSnippetSize = (width, height) => {
                cy.get(
                    '[data-cy="menu-share-embed-iframe-snippet"] [data-cy="menu-share-input-copy-button"]'
                )
                    .should('contain.value', `width: ${width}`)
                    .should('contain.value', `height: ${height}`)
            }

            beforeEach(() => {
                // beforeEach for the whole test is clicking on the menu button once, we must click it another time
                // otherwise the menu will be closed by the first click
                cy.get('[data-cy="menu-button"]').click()
                cy.get('[data-cy="menu-share-section"]').click()
                cy.get('[data-cy="menu-share-embed-button"]').click()
            })
            it('uses the embedded shortlink url to generate the iFrame code snippet', () => {
                cy.get('[data-cy="menu-share-embed-simple-iframe-snippet"]')
                    .should('contain.value', dummyEmbeddedShortLink)
                    .should('not.contain.value', dummyShortLink)
            })
            it('enables the user to choose pre-made sizes for the generated iframe code snippet', () => {
                cy.get('[data-cy="menu-share-embed-preview-button"]').click()
                cy.wait('@dummyShortLinkAccess')
                // checking that the iframe code snippet is set to the Small size by default
                checkIFrameSnippetSize(400, 300)
                // Checking that the name of the size is displayed in the selector, then switching to the Medium size
                cy.get('[data-cy="menu-share-embed-iframe-size-selector"]')
                    .should('contain.text', 'Small')
                    .select('Medium')
                // checking that the text in the selector has changed to reflect our selection of the Medium size
                cy.get('[data-cy="menu-share-embed-iframe-size-selector"]').should(
                    'contain.text',
                    'Medium'
                )
                // checking the iframe code snippet to see if the size has correctly been changed here too
                checkIFrameSnippetSize(600, 450)
            })
            it('enables the user to customize the size of the generated iframe code snippet', () => {
                cy.get('[data-cy="menu-share-embed-preview-button"]').click()
                cy.wait('@dummyShortLinkAccess')
                cy.get('[data-cy="menu-share-embed-iframe-custom-width"]').should('not.exist')
                cy.get('[data-cy="menu-share-embed-iframe-custom-height"]').should('not.exist')
                cy.get('[data-cy="menu-share-embed-iframe-size-selector"]').select('Custom size')
                cy.get('[data-cy="menu-share-embed-iframe-custom-width"]')
                    .should('be.visible')
                    .should('contain.value', 400)
                cy.get('[data-cy="menu-share-embed-iframe-custom-height"]')
                    .should('be.visible')
                    .should('contain.value', 300)
                checkIFrameSnippetSize(400, 300)
                cy.get('[data-cy="menu-share-embed-iframe-custom-width"]').type(
                    '{selectall}{backspace}600'
                )
                checkIFrameSnippetSize(600, 300)
                cy.get('[data-cy="menu-share-embed-iframe-custom-height"]').type(
                    '{selectall}{backspace}500'
                )
                checkIFrameSnippetSize(600, 500)
            })
            it('enables the user to create a full width iframe code snippet', () => {
                cy.get('[data-cy="menu-share-embed-preview-button"]').click()
                cy.wait('@dummyShortLinkAccess')
                cy.get('[data-cy="menu-share-embed-iframe-size-selector"]').select('Custom size')
                cy.get('[data-cy="menu-share-embed-iframe-custom-width"]')
                    .should('be.visible')
                    .should('contain.value', 400)
                cy.get('[data-cy="menu-share-embed-iframe-full-width"]')
                    .should('be.visible')
                    .click()
                cy.get('[data-cy="menu-share-embed-iframe-custom-width"]')
                    .should('be.visible')
                    .should('contain.value', '100 %')
                    .should('have.attr', 'readonly')
                checkIFrameSnippetSize('100%', 300)
            })
        }
    )
})
