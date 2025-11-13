/// <reference types="cypress" />

const ribbonSelector: string = '[data-cy="warning-ribbon"]'
const BREAKPOINT_PHONE_WIDTH: number = 576

describe('Testing the warning ribbon', () => {
    beforeEach(() => {
        cy.goToMapView()
    })

    context('Checking the warning ribbon', () => {
        /*
         * Normally, 'localhost' is not in the `WARNING_RIBBON_HOSTNAMES` constant,
         * so the warning banner is not present on Cypress.
         */

        it("Ribbon shouldn't be visible on localhost", () => {
            cy.get(ribbonSelector).should('not.exist')
        })

        it('If ribbon exists, it should be at the top on a phone, bottom on desktop', () => {
            // Conditional tests are bad on Cypress, but the banner may or may not be present,
            // depending on the hostname
            cy.get(ribbonSelector)
                // Bypassing the built-in existence assertion
                .should(() => {})
                .then(($el) => {
                    if (!$el.length) {
                        return
                    }
                    const viewportWidth = Cypress.config('viewportWidth')
                    if (viewportWidth < BREAKPOINT_PHONE_WIDTH) {
                        cy.get(ribbonSelector).invoke('css', 'top').should('equal', '78px')
                    } else {
                        cy.get(ribbonSelector).invoke('css', 'bottom').should('equal', '50px')
                    }
                })
        })
    })
})
