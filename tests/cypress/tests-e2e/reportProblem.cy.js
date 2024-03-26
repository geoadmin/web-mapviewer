/// <reference types="cypress" />

import { APP_VERSION } from '@/config'

const text =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const validEmail = 'this.is.a.valid@email.com'

describe('Testing the report problem form', () => {
    beforeEach(() => {
        cy.goToMapView()
    })

    context('Report problem button placement', () => {
        it('should be shown based on the view size', () => {
            cy.get('[data-cy="menu-button"]').click()
            cy.get('[data-cy="menu-settings-section"]').click()

            cy.log('should be in the header as a link on mobile')
            cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
            cy.get('[data-cy="report-problem-form"]').should('be.visible')
            cy.get('[data-cy="report-problem-form"]').should('be.visible')
            // Close the form
            cy.get('[data-cy="modal-close-button"]').click()

            cy.log('should be in the header as a link on desktop')
            cy.goToMapView()
            cy.viewport(1920, 1080)
            cy.get('[data-cy="report-problem-link-button"]').should('be.visible').click()
            cy.get('[data-cy="report-problem-form"]').should('be.visible')
            // Close the form
            cy.get('[data-cy="modal-close-button"]').click()
        })
    })
    context('Form validation', () => {
        beforeEach(() => {
            // opening the report problem form
            cy.get('[data-cy="menu-button"]').click()
            cy.get('[data-cy="menu-settings-section"]').click()
            cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
        })

        it('validates email and text properly', () => {
            cy.get('[data-cy="report-problem-text"]').type(text)

            cy.log('is possible to report a problem without specifying an email address')
            cy.get('[data-cy="report-problem-email"').should('be.empty')
            cy.get('[data-cy="submit-report-problem-button"]').should('be.enabled')

            cy.log('is not possible to report a problem with a malformed email')
            cy.get('[data-cy="report-problem-email"').clear()
            cy.log('is possible to report a problem without specifying an email address')
            cy.get('[data-cy="report-problem-email"').type('this.is.not.a.valid@email')
            cy.get('[data-cy="submit-report-problem-button"]').should('be.disabled')

            cy.log('validates email before enabling the user to report a problem')
            cy.get('[data-cy="report-problem-email"').clear()
            cy.get('[data-cy="report-problem-email"').type(validEmail)
            cy.get('[data-cy="submit-report-problem-button"]').should('be.enabled')

            cy.log('is not possible to report a problem without filling the message')
            cy.get('[data-cy="report-problem-email"]').type(validEmail)
            cy.get('[data-cy="report-problem-text"').clear()
            cy.get('[data-cy="report-problem-text"').should('be.empty')
            cy.get('[data-cy="submit-report-problem-button"]').should('be.disabled')
        })
    })
    context('backend interaction', () => {
        beforeEach(() => {
            // opening the report problem form
            cy.get('[data-cy="menu-button"]').click()
            cy.get('[data-cy="menu-settings-section"]').click()
            cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
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
        context('request params', () => {
            function getFormDataBoundary(request) {
                const contentType = request.headers['content-type']
                const boundaryMatch = contentType.match(/boundary=([\w-]+)/)
                return boundaryMatch && boundaryMatch[1]
            }
            function parseFormData(request) {
                const boundary = getFormDataBoundary(request)
                const formDataParts = request.body.split(boundary)
                return (
                    formDataParts
                        .filter((part) => part.indexOf('Content-Disposition') !== -1)
                        .map((rawPart) => {
                            const split = rawPart
                                .split(/\r?\n/)
                                .filter((split) => split !== '--' && split.length > 0)
                            const name = split[0].substring(
                                split[0].indexOf('name="') + 6, // removing the 6 chars from name="
                                split[0].length - 1 // removing trailing "
                            )
                            return {
                                [name]: split[1],
                            }
                        })
                        // flatten array of params into a single object (with param name as keys)
                        .reduce((accumulator, param) => Object.assign(accumulator, param))
                )
            }

            it('generates a complete request to service-feedback', () => {
                interceptFeedback(true)
                cy.get('[data-cy="report-problem-email"]').type(validEmail)
                cy.get('[data-cy="report-problem-text"]').type(text)

                cy.get('[data-cy="submit-report-problem-button"]').click()

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
            })
        })
        context('successful feedback requests', () => {
            beforeEach(() => {
                interceptFeedback(true)
                cy.get('[data-cy="report-problem-text"]').type(text)
                cy.get('[data-cy="report-problem-email"]').type(validEmail)
                cy.get('[data-cy="submit-report-problem-button"]').click()
            })
            it('shows the user the feedback was well received with a checkmark in the submit button', () => {
                cy.get(
                    '[data-cy="submit-report-problem-button"] [data-cy="report-problem-pending-icon"]'
                ).should('be.visible')
                cy.wait('@feedback')
                cy.get('[data-cy="report-problem-form"]').should('not.exist')
                cy.get('[data-cy="report-problem-success-text"]').should('be.visible')

                cy.log('closes the modal if the close button is clicked')
                cy.get('[data-cy="report-problem-close-successful"]').click()
                cy.get('[data-cy="report-problem-form"]').should('not.exist')
            })
        })
        context('failed feedback requests', () => {
            beforeEach(() => {
                interceptFeedback(false)
                cy.get('[data-cy="report-problem-text"]').type(text)
                cy.get('[data-cy="report-problem-email"]').type(validEmail)
                cy.get('[data-cy="submit-report-problem-button"]').click()
            })
            it('shows a text to the user to tell him something went wrong', () => {
                cy.wait('@feedback')
                cy.get(
                    '[data-cy="submit-report-problem-button"] [data-cy="report-problem-success-icon"]'
                ).should('not.exist')
                cy.get('[data-cy="report-problem-failed-text"]').should('be.visible')
            })
        })
    })
})
