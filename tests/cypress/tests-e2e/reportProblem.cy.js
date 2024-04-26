/// <reference types="cypress" />

import { APP_VERSION } from '@/config'

import { interceptFeedback, parseFormData } from '../support/feedbackTestUtils.js'

const text =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const validEmail = 'this.is.a.valid@email.com'

describe('Testing the report problem form', () => {
    function closeForm() {
        cy.get('[data-cy="modal-close-button"]').should('be.visible').click()
    }

    function openForm() {
        cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')
    }

    it('test the report problem form UI, validations, and it backend interaction', () => {
        cy.goToMapView()
        cy.get('[data-cy="menu-button"]').should('be.visible').click()
        cy.get('[data-cy="menu-settings-section"]').should('be.visible').click()

        cy.log('The button should be in the header as a link on mobile')
        cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')
        closeForm()

        cy.log('The button should be in the header as a link on desktop')
        cy.viewport(1920, 1080)
        cy.get('[data-cy="report-problem-link-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')
        closeForm()

        // Reset back to mobile view
        cy.viewport(320, 568)

        cy.log('It validates the report problem form properly')

        cy.log('It is possible to report a problem without specifying an email address')
        openForm()
        cy.get('[data-cy="report-problem-text"]').type(text)
        cy.get('[data-cy="feedback-email"').should('be.empty')
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('It is not possible to report a problem with a malformed email')
        openForm()
        cy.get('[data-cy="report-problem-text"]').type(text)
        cy.get('[data-cy="feedback-email"').type('this.is.not.a.valid@email')
        cy.get('[data-cy="submit-button"]').should('be.disabled')
        closeForm()

        cy.log('It validates email before enabling the user to report a problem')
        openForm()
        cy.get('[data-cy="report-problem-text"]').type(text)
        cy.get('[data-cy="feedback-email"').type(validEmail)
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('It is not possible to report a problem without filling the message')
        openForm()
        cy.get('[data-cy="report-problem-text"').should('be.empty')
        cy.get('[data-cy="feedback-email"]').type(validEmail)
        cy.get('[data-cy="submit-button"]').should('be.disabled')
        closeForm()

        cy.log('It generates a complete request to service-feedback')
        openForm()
        interceptFeedback(true)
        cy.get('[data-cy="feedback-email"]').type(validEmail)
        cy.get('[data-cy="report-problem-text"]').type(text)
        cy.get('[data-cy="submit-button"]').click()

        cy.log(
            'it shows the user the feedback was well received with a checkmark in the submit button'
        )
        cy.get('[data-cy="submit-button"] [data-cy="submit-pending-icon"]').should('be.visible')
        cy.wait('@feedback').then((interception) => {
            ;[
                { name: 'subject', contains: `Problem report` },
                { name: 'feedback', contains: text },
                { name: 'version', contains: APP_VERSION },
                { name: 'ua', contains: navigator.userAgent },
                { name: 'email', contains: validEmail },
            ].forEach((param) => {
                expect(interception.request.body).to.be.a('String')
                const formData = parseFormData(interception.request)
                expect(formData).to.haveOwnProperty(param.name)
                expect(formData[param.name]).to.contain(param.contains)
            })
        })

        cy.get('[data-cy="report-problem-form"]').should('not.exist')
        cy.get('[data-cy="report-problem-success-text"]').should('be.visible')
        cy.get('[data-cy="report-problem-close-successful"]').should('be.focused')

        cy.log('Closes the modal if the close button is clicked')
        cy.get('[data-cy="report-problem-close-successful"]').click()
        cy.get('[data-cy="report-problem-form"]').should('not.exist')
        // Form is already closed at this point

        cy.log('It send the correct version when the email is empty and attach a file')
        openForm()
        cy.get('[data-cy="report-problem-text"]').type(text)
        const localKmlFile = 'import-tool/external-kml-file.kml'
        cy.fixture(localKmlFile, null).as('kmlFixture')
        cy.get('[data-cy="import-local-file-input"]').selectFile('@kmlFixture', {
            force: true,
        })
        cy.get('[data-cy="import-local-file-input-text"]').should('have.class', 'is-valid')
        cy.get('[data-cy="submit-button"]').click()

        cy.wait('@feedback').then((interception) => {
            const formData = parseFormData(interception.request)
            ;[
                { name: 'subject', contains: `Problem report` },
                { name: 'feedback', contains: text },
                { name: 'version', contains: APP_VERSION },
                { name: 'ua', contains: navigator.userAgent },
            ].forEach((param) => {
                expect(interception.request.body).to.be.a('String')
                expect(formData).to.haveOwnProperty(param.name)
                expect(formData[param.name]).to.contain(param.contains)
            })
            console.log(interception.request.body)
            expect(formData).to.haveOwnProperty('attachment')
            expect(formData['attachment']).to.contain('external-kml-file.kml')
        })

        cy.get('[data-cy="report-problem-form"]').should('not.exist')
        cy.get('[data-cy="report-problem-success-text"]').should('be.visible')
        cy.get('[data-cy="report-problem-close-successful"]').should('be.focused')

        cy.log('Closes the modal if the close button is clicked')
        cy.get('[data-cy="report-problem-close-successful"]').click()
        cy.get('[data-cy="report-problem-form"]').should('not.exist')
        // Form is already closed at this point

        cy.log('It shows a text to the user to tell him something went wrong')
        openForm()
        interceptFeedback(false)
        cy.get('[data-cy="report-problem-text"]').type(text)
        cy.get('[data-cy="feedback-email"]').type(validEmail)
        cy.get('[data-cy="submit-button"]').click()

        cy.wait('@feedback')
        cy.get('[data-cy="submit-button"] [data-cy="report-problem-success-icon"]').should(
            'not.exist'
        )
        cy.get('[data-cy="report-problem-failed-text"]').should('be.visible')
        closeForm()
    })
})
