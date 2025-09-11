/// <reference types="cypress" />

const ribbonSelector = '[data-cy="warning-ribbon"]'
const BREAKPOINT_PHONE_WIDTH = 576

describe('Testing the warning ribbon', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    context('Checking the warning ribbon', () => {
        /*
         * Normally, 'localhost' in not in the `WARNING_RIBBON_HOSTNAMES`constant,
         * so the warning banner is not present on Cypress.
         */

        it("Ribbon shouldn't be be visible on localhost", () => {
            cy.get(ribbonSelector).should('not.exist')
        })

        it('If ribbon do exist, it should be at top on a phone, bottom on desktop', () => {
            // Conditional tests are bad on Cypress, but the banner we or not be present,
            // depending on the hostname
            cy.get(ribbonSelector)
                // Bypassing the built-in existence assertion
                .should(Cypress._.noop)
                .then(($el) => {
                    if (!$el.length) {
                        return
                    }
                    if (Cypress.config().viewportWidth < BREAKPOINT_PHONE_WIDTH) {
                        cy.get(ribbonSelector).invoke('css', 'top').should('equal', '78px')
                    } else {
                        cy.get(ribbonSelector).invoke('css', 'bottom').should('equal', '50px')
                    }
                })
        })
    })
})
