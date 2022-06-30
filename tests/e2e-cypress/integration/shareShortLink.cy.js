/// <reference types="cypress" />

describe('Testing the share menu', () => {
    const dummyShortLink = 'https://dummy.short.link'
    beforeEach(() => {
        cy.goToMapView()
        cy.get('[data-cy="menu-button"]').click()
        // intercepting short link requests, in order not to have to import the config
        // we check only for the first part of the URL (without the staging)
        cy.intercept('https://s.geo.admin.ch**', { body: { shorturl: dummyShortLink } }).as('shortLink')
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
    })
    context('Social networks', () => {
        beforeEach(() => {
            cy.get('[data-cy="menu-share-section"]').click()
            cy.wait('@shortLink')
            // stubbing window.open so that the app doesn't open new tab but let us see what URL was used to do so
            cy.window().then((win) => {
                cy.stub(win, 'open').as('open')
            })
        })
        const checkSocialNetworkType = (type, matchingUrl) => {
            cy.get(`[data-cy="share-shortlink-${type}"]`).should('be.visible').click()
            cy.get('@open').should('have.been.calledOnceWith', Cypress.sinon.match(matchingUrl))
        }
        it('opens an email containing a short link', () => {
            checkSocialNetworkType(
                'email',
                `mailto:?subject=&body=${encodeURIComponent(dummyShortLink + '\r\n')}`
            )
        })
        it('opens service-qrcode with the short link as url', () => {
            cy.intercept('**/qrcode').as('qrCode')
            checkSocialNetworkType(
                'qrcode',
                `/qrcode/generate?url=${encodeURIComponent(dummyShortLink)}`
            )
        })
        it('opens a facebook popup with the short link as content', () => {
            checkSocialNetworkType(
                'facebook',
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dummyShortLink)}`
            )
        })
        it('opens a twitter popup with the short link as content', () => {
            checkSocialNetworkType(
                'twitter',
                `https://twitter.com/intent/tweet?text=&url=${encodeURIComponent(dummyShortLink)}`
            )
        })
    })
})
