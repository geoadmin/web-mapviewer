/// <reference types="cypress" />

import { APP_VERSION } from '@/config'

import { interceptFeedback, parseFormData } from '../support/feedbackTestUtils.js'

describe('Testing the feedback form', () => {
    function closeForm() {
        cy.get('[data-cy="modal-close-button"]').should('be.visible').click()
    }

    function openForm() {
        cy.get('[data-cy="feedback-button"]').should('be.visible').click()
        cy.get('[data-cy="feedback-form"]').should('be.visible')
    }

    it('test the report problem form UI, validations, and it backend interaction', () => {
        cy.goToMapView()
        cy.get('[data-cy="menu-button"]').click()
        cy.get('[data-cy="menu-settings-section"]').click()

        cy.log('The button should be in the header as a link on mobile')
        cy.get('[data-cy="feedback-button"]').should('be.visible').click()
        cy.get('[data-cy="feedback-form"]').should('be.visible')
        closeForm()

        cy.log('The button should be in the header as a link on desktop')
        cy.viewport(1920, 1080)
        cy.get('[data-cy="feedback-link-button"]').should('be.visible').click()
        cy.get('[data-cy="feedback-form"]').should('be.visible')
        closeForm()

        // Reset back to mobile view
        cy.viewport(320, 568)

        cy.log('It validates the report problem form properly')
        openForm()
        cy.log('it is not possible to send a feedback without a rating')
        cy.get('[data-cy="submit-button"]').should('be.disabled')
        cy.get('[data-cy="feedback-text"]').type('This is an awesome feedback!')
        cy.get('[data-cy="submit-button"]').should('be.disabled')
        cy.get('[data-cy="rate-feedback-3"').click()
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('it is possible to send a feedback without specifying an email address')
        openForm()
        cy.get('[data-cy="rate-feedback-4"').click()
        cy.get('[data-cy="feedback-email"').should('be.empty')
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('it is not possible to send a feedback with a malformed email')
        openForm()
        cy.get('[data-cy="rate-feedback-4"').click()
        cy.get('[data-cy="feedback-email"').type('this.is.not.a.valid@email')
        cy.get('[data-cy="submit-button"]').should('be.disabled')
        closeForm()

        cy.log('it validates email before enabling the user to send the feedback')
        openForm()
        cy.get('[data-cy="rate-feedback-1"').click()
        cy.get('[data-cy="feedback-email"').type('this.is.a.valid@email.com')
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('it is possible to send a feedback without giving a text')
        openForm()
        cy.get('[data-cy="rate-feedback-5"').click()
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('Backend interaction')

        cy.log('it generates a complete request to service-feedback')
        openForm()
        const rating = 4
        const text =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        const email = 'some.valid@email.com'
        interceptFeedback(true)
        cy.get(`[data-cy="rate-feedback-${rating}"`).click()
        cy.get('[data-cy="feedback-text"]').type(text)
        cy.get('[data-cy="feedback-email"]').type(email)
        cy.get('[data-cy="submit-button"]').click()

        cy.log(
            'it shows the user the feedback was well received with a checkmark in the submit button'
        )
        cy.get('[data-cy="submit-button"] [data-cy="submit-pending-icon"]').should('be.visible')
        cy.wait('@feedback').then((interception) => {
            ;[
                { name: 'subject', contains: `[rating: ${rating}/` },
                { name: 'feedback', contains: text },
                // removing .dirty part, as e2e tests are done against prod build, which removes the .dirty
                // without this replace, this test will always fail locally if some local changes are present
                { name: 'version', contains: APP_VERSION.replace('.dirty', '') },
                { name: 'ua', contains: navigator.userAgent },
                { name: 'email', contains: email },
            ].forEach((param) => {
                expect(interception.request.body).to.be.a('String')
                const formData = parseFormData(interception.request)
                expect(formData).to.haveOwnProperty(param.name)
                expect(formData[param.name]).to.contain(param.contains)
            })
        })
        cy.get('[data-cy="feedback-form"]').should('not.exist')
        cy.get('[data-cy="feedback-success-text"]').should('be.visible')

        cy.get('[data-cy="feedback-close-successful"]').click()
        cy.get('[data-cy="feedback-form"]').should('not.exist')
        // Form is already closed at this point

        cy.log('it shows a text to the user to tell him something went wrong')
        openForm()
        interceptFeedback(false)
        cy.get('[data-cy="rate-feedback-4"').click()
        cy.get('[data-cy="submit-button"]').click()
        cy.wait('@feedback')
        cy.get('[data-cy="submit-button"] [data-cy="feedback-success-icon"]').should('not.exist')
        cy.get('[data-cy="feedback-failed-text"]').should('be.visible')
    })
})
