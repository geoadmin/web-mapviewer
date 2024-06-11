/// <reference types="cypress" />

import { APP_VERSION } from '@/config'

import { interceptFeedback, parseFormData } from './feedbackTestUtils'

describe('Testing the feedback form', () => {
    function closeForm() {
        cy.get('[data-cy="window-close"]').should('be.visible').click()
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
        cy.openMenuIfMobile()
        openForm()
        cy.log('it is not possible to send a feedback without a rating')
        cy.get('[data-cy="text-area-input"]').type('This is an awesome feedback!')
        cy.get('[data-cy="submit-button"]').click()
        cy.get('[data-cy="rating-required-invalid-feedback"]').should('be.visible')
        cy.get('[data-cy="rate-feedback-3"').click()
        cy.get('[data-cy="rating-required-invalid-feedback"]').should('not.be.visible')
        closeForm()

        cy.log('it is possible to send a feedback without specifying an email address')
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="rate-feedback-4"').click()
        cy.get('[data-cy="email-input"').should('be.empty')
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('it is not possible to send a feedback with a malformed email')
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="rate-feedback-4"').click()
        cy.get('[data-cy="email-input"').type('this.is.not.a.valid@email')
        cy.get('[data-cy="submit-button"]').click()
        cy.get('[data-cy="email-input"').should('have.class', 'is-invalid')
        cy.get('[data-cy="email-input-invalid-feedback"').should('be.visible')
        closeForm()

        cy.log('it validates email before enabling the user to send the feedback')
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="rate-feedback-1"').click()
        cy.get('[data-cy="email-input"').type('this.is.a.valid@email.com')
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('it is possible to send a feedback without giving a text')
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="rate-feedback-5"').click()
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('Backend interaction')

        cy.log('it generates a complete request to service-feedback')
        cy.openMenuIfMobile()
        openForm()
        const rating = 4
        const text =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        const email = 'some.valid@email.com'
        interceptFeedback(true)
        cy.get(`[data-cy="rate-feedback-${rating}"`).click()
        cy.get('[data-cy="text-area-input"]').type(text)
        cy.get('[data-cy="email-input"]').type(email)
        cy.get('[data-cy="submit-button"]').click()

        cy.log(
            'it shows the user the feedback was well received with a checkmark in the submit button'
        )
        cy.get('[data-cy="submit-button"] [data-cy="submit-pending-icon"]').should('be.visible')
        cy.wait('@feedback').then((interception) => {
            ;[
                { name: 'subject', contains: `[rating: ${rating}/` },
                { name: 'feedback', contains: text },
                { name: 'version', contains: APP_VERSION },
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
        cy.openMenuIfMobile()
        openForm()
        interceptFeedback(false)
        cy.get('[data-cy="rate-feedback-4"').click()
        cy.get('[data-cy="submit-button"]').click()
        cy.wait('@feedback')
        cy.get('[data-cy="submit-button"] [data-cy="feedback-success-icon"]').should('not.exist')
        cy.get('[data-cy="feedback-failed-text"]').should('be.visible')
    })
})
