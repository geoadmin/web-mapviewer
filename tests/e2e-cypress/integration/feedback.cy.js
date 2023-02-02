/// <reference types="cypress" />

describe('Testing the feedback form', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    context('Feedback button placement', () => {
        it('should be in the configuration section of the menu on mobile', () => {
            cy.get('[data-cy="menu-button"]').click()
            cy.get('[data-cy="menu-settings-section"]').click()

            cy.get('[data-cy="feedback-button"]').should('be.visible').click()
            cy.get('[data-cy="feedback-form"]').should('be.visible')
        })
        it('should be in the header as a link on desktop', () => {
            cy.viewport(1920, 1080)

            cy.get('[data-cy="feedback-link-button"]').should('be.visible').click()
            cy.get('[data-cy="feedback-form"]').should('be.visible')
        })
    })
    context('From validation', () => {
        beforeEach(() => {
            // opening the feedback form
            cy.get('[data-cy="menu-button"]').click()
            cy.get('[data-cy="menu-settings-section"]').click()
            cy.get('[data-cy="feedback-button"]').should('be.visible').click()
        })
        it('is not possible to send a feedback without a rating', () => {
            cy.get('[data-cy="submit-feedback-button"]').should('be.disabled')
            cy.get('[data-cy="feedback-text"]').type('This is an awesome feedback!')
            cy.get('[data-cy="submit-feedback-button"]').should('be.disabled')
            cy.get('[data-cy="rate-feedback-3"').click()
            cy.get('[data-cy="submit-feedback-button"]').should('be.enabled')
        })
        it('is possible to send a feedback without giving a text', () => {
            cy.get('[data-cy="rate-feedback-5"').click()
            cy.get('[data-cy="submit-feedback-button"]').should('be.enabled')
        })
    })
    context('backend interaction', () => {
        beforeEach(() => {
            // opening the feedback form
            cy.get('[data-cy="menu-button"]').click()
            cy.get('[data-cy="menu-settings-section"]').click()
            cy.get('[data-cy="feedback-button"]').should('be.visible').click()
        })
        function interceptFeedback(success) {
            cy.intercept('POST', '**/api/feedback', (req) => {
                req.reply({
                    body: {
                        success,
                    },
                    delay: 1000,
                })
            }).as('feedback')
        }
        context('successful feedback requests', () => {
            beforeEach(() => {
                interceptFeedback(true)
                cy.get('[data-cy="rate-feedback-2"').click()
                cy.get('[data-cy="submit-feedback-button"]').click()
            })
            it('shows the user the feedback was well received with a checkmark in the submit button', () => {
                cy.get(
                    '[data-cy="submit-feedback-button"] [data-cy="feedback-pending-icon"]'
                ).should('be.visible')
                cy.wait('@feedback')
                cy.get(
                    '[data-cy="submit-feedback-button"] [data-cy="feedback-success-icon"]'
                ).should('be.visible')
                cy.get('[data-cy="feedback-success-text"]').should('be.visible')
            })
            it('closes the modal if the check mark button is clicked', () => {
                cy.wait('@feedback')
                cy.get('[data-cy="submit-feedback-button"]').click()
                cy.get('[data-cy="feedback-form"]').should('not.exist')
            })
        })
        context('failed feedback requests', () => {
            beforeEach(() => {
                interceptFeedback(false)
                cy.get('[data-cy="rate-feedback-4"').click()
                cy.get('[data-cy="submit-feedback-button"]').click()
            })
            it('shows a text to the user to tell him something went wrong', () => {
                cy.wait('@feedback')
                cy.get(
                    '[data-cy="submit-feedback-button"] [data-cy="feedback-success-icon"]'
                ).should('not.exist')
                cy.get('[data-cy="feedback-failed-text"]').should('be.visible')
            })
        })
    })
})
