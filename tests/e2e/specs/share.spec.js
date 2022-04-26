/// <reference types="cypress" />

import { forEachTestViewport } from '../support'

describe('Testing the share menu', () => {
    forEachTestViewport((viewport, isMobile, isTablet, dimensions) => {
        const clickOnMenuButtonIfMobile = () => {
            if (isMobile || isTablet) {
                // clicking on the menu button
                cy.get('[data-cy="menu-button"]').click()
            }
        }
        const dummyShortLink = 'https://dummy.short.link'
        context(
            `viewport: ${viewport}`,
            {
                viewportWidth: dimensions.width,
                viewportHeight: dimensions.height,
            },
            () => {
                beforeEach(() => {
                    cy.goToMapView()
                    // intercepting short link requests, in order not to have to import the config
                    // we check only for the first part of the URL (without the staging)
                    cy.intercept('https://sys-s**', { body: { shorturl: dummyShortLink } }).as(
                        'shortLink'
                    )
                    clickOnMenuButtonIfMobile()
                })
                context('Short link generation', () => {
                    it('Does not generate a short link at startup', () => {
                        cy.readStoreValue('state.position.shortLink').should('eq', null)
                    })
                    it('Creates a short linked version of the URL the first time the menu section is opened', () => {
                        cy.get('[data-cy="menu-share-section"]').click()
                        // a short link should be generated as it is our first time opening this section
                        cy.wait('@shortLink')
                        cy.readStoreValue('state.position.shortLink').should('eq', dummyShortLink)
                    })
                    it('Updates the short link as soon as the state of the map (the URL) has changed', () => {
                        cy.get('[data-cy="menu-share-section"]').click()
                        // a short link should be generated as it is our first time opening this section
                        cy.wait('@shortLink')
                        // overriding the response of the service with a different URL
                        const updatedDummyShortLink = 'https://updated.dummy.link'
                        cy.intercept('https://sys-s**', {
                            body: { shorturl: updatedDummyShortLink },
                        }).as('updateShortLink')
                        // closing the menu if needed
                        clickOnMenuButtonIfMobile()
                        // zoom on the map in order to change the URL
                        cy.get('[data-cy="map"]').dblclick()
                        cy.wait('@updateShortLink')
                        cy.readStoreValue('state.position.shortLink').should(
                            'eq',
                            updatedDummyShortLink
                        )
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
                        cy.get('@open').should(
                            'have.been.calledOnceWith',
                            Cypress.sinon.match(matchingUrl)
                        )
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
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                dummyShortLink
                            )}`
                        )
                    })
                    it('opens a twitter popup with the short link as content', () => {
                        checkSocialNetworkType(
                            'twitter',
                            `https://twitter.com/intent/tweet?text=&url=${encodeURIComponent(
                                dummyShortLink
                            )}`
                        )
                    })
                })
            }
        )
    })
})
