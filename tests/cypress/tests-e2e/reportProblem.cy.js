/// <reference types="cypress" />

import { isMobile } from 'tests/cypress/support/utils'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { APP_VERSION } from '@/config/staging.config'

import { interceptFeedback, parseFormData } from './feedbackTestUtils'

const text =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const validEmail = 'this.is.a.valid@email.com'

describe('Testing the report problem form', () => {
    function closeForm() {
        cy.get('[data-cy="window-close"]').should('be.visible').click()
    }

    function openForm() {
        cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')
    }

    it('test the report problem form UI, validations, and it backend interaction', () => {
        interceptFeedback(false)
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
        cy.openMenuIfMobile()

        cy.log('It validates the report problem form properly')

        cy.log('It is possible to report a problem without specifying an email address')
        openForm()
        cy.get('[data-cy="text-area-input"]').type(text)
        cy.get('[data-cy="email-input"').should('be.empty')
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('It is not possible to report a problem with a malformed email')
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="text-area-input"]').type(text)
        cy.get('[data-cy="email-input"]').type('this.is.not.a.valid@email')
        cy.get('[data-cy="submit-button"]:visible').click()
        cy.get('[data-cy="email-input"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="report-problem-failed-text"]').should('not.exist')
        closeForm()

        cy.log('It validates email before enabling the user to report a problem')
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="text-area-input"]').type(text)
        cy.get('[data-cy="email-input"').type(validEmail)
        cy.get('[data-cy="submit-button"]').should('be.enabled')
        closeForm()

        cy.log('It is not possible to report a problem without filling the message')
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="text-area-input"]').should('be.empty')
        cy.get('[data-cy="email-input"]').type(validEmail)
        cy.get('[data-cy="submit-button"]:visible').click()
        cy.get('[data-cy="email-input"]').should('have.class', 'is-valid')
        cy.get('[data-cy="text-area-input"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="report-problem-failed-text"]').should('not.exist')
        closeForm()

        cy.log('It generates a complete request to service-feedback')
        cy.openMenuIfMobile()
        openForm()
        interceptFeedback(true)
        cy.get('[data-cy="email-input"]').type(validEmail)
        cy.get('[data-cy="text-area-input"]').type(text)
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
        cy.openMenuIfMobile()
        openForm()
        cy.get('[data-cy="text-area-input"]').type(text)
        const localKmlFile = 'import-tool/external-kml-file.kml'
        cy.fixture(localKmlFile, null).as('kmlFixture')
        cy.get('[data-cy="file-input"]').selectFile('@kmlFixture', {
            force: true,
        })
        cy.get('[data-cy="submit-button"]').click()
        cy.get('[data-cy="file-input-text"]').should('have.class', 'is-valid')

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
        cy.openMenuIfMobile()
        openForm()
        interceptFeedback(false)
        cy.get('[data-cy="text-area-input"]').type(text)
        cy.get('[data-cy="email-input"]').type(validEmail)
        cy.get('[data-cy="submit-button"]').click()

        cy.wait('@feedback')
        cy.get('[data-cy="submit-button"] [data-cy="report-problem-success-icon"]').should(
            'not.exist'
        )
        cy.get('[data-cy="report-problem-failed-text"]').should('be.visible')
        closeForm()
    })
    it('reports a problem with drawing attachment', () => {
        cy.goToMapView()
        interceptFeedback(true)
        if (isMobile()) {
            cy.get('[data-cy="menu-button"]').should('be.visible').click()
            cy.get('[data-cy="menu-settings-section"]').should('be.visible').click()
        }

        cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')

        cy.log('Write description and email')
        cy.get('[data-cy="text-area-input"]').type(text)
        cy.get('[data-cy="email-input"]').type(validEmail)

        cy.log('Enter the drawing mode')
        cy.viewport('macbook-11')
        cy.get('[data-cy="report-problem-drawing-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('not.be.visible')
        // we need to increase the timeout here below because upon opening the drawing mode for the
        // first time in e2e tests, the loading of the library can takes time
        cy.get('[data-cy="drawing-header-title"]', { timeout: 15000 })
            .should('be.visible')
            .contains('2. Indicate the appropriate location on the map :')
        cy.get('[data-cy="drawing-toolbox-share-button"]').should('not.exist')
        cy.get('[data-cy="drawing-toolbox-disclaimer"]').should('not.exist')

        cy.log('Draw some features')
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get('[data-cy="ol-map"]').click('center')

        cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
        cy.get('[data-cy="ol-map"]').then(($el) => {
            const mapWidth = $el.width()
            const mapHeight = $el.height()
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2 + 50, mapHeight / 2)
        })

        cy.log(`Exit drawing mode`)
        cy.get('[data-cy="drawing-header-close-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')
        cy.get('[data-cy="drawing-header-title"]').should('not.exist')
        cy.get('[data-cy="text-area-input"]').should('be.visible').should('have.value', text)
        cy.get('[data-cy="email-input"]').should('be.visible').should('have.value', validEmail)
        cy.get('[data-cy="report-problem-drawing-added-feedback"]')
            .should('be.visible')
            .should('have.class', 'valid-feedback')
        cy.viewport('iphone-3')

        cy.log('Clear drawing')
        cy.get('[data-cy="report-problem-drawing-button"]').should('be.visible').click()
        cy.get('[data-cy="drawing-toolbox-delete-button"]').should('be.visible').click()
        cy.get('[data-cy="modal-confirm-button"]').should('be.visible').click()
        cy.get('[data-cy="drawing-toolbox-close-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')
        cy.get('[data-cy="drawing-header-title"]').should('not.exist')
        cy.get('[data-cy="text-area-input"]').should('have.value', text)
        cy.get('[data-cy="email-input"]').should('have.value', validEmail)
        cy.get('[data-cy="report-problem-drawing-added-feedback"]').should('not.be.visible')

        cy.log('Draw some more features')
        cy.get('[data-cy="report-problem-drawing-button"]').scrollIntoView()
        cy.get('[data-cy="report-problem-drawing-button"]').should('be.visible').click()
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get('[data-cy="ol-map"]').click()

        cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
        cy.get('[data-cy="ol-map"]').then(($el) => {
            const mapWidth = $el.width()
            const mapHeight = $el.height()
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2 + 50, mapHeight / 2)
        })

        cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
        cy.get('[data-cy="ol-map"]').then(($el) => {
            const mapWidth = $el.width()
            const mapHeight = $el.height()
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2 - 50, mapHeight / 2)
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2, mapHeight / 2)
            cy.get('[data-cy="ol-map"]').dblclick(mapWidth / 2 + 10, mapHeight / 2 + 50)
        })

        cy.get('[data-cy="drawing-toolbox-close-button"]').should('be.visible').click()
        cy.get('[data-cy="report-problem-form"]').should('be.visible')
        cy.get('[data-cy="drawing-header-title"]').should('not.exist')
        cy.get('[data-cy="text-area-input"]').should('have.value', text)
        cy.get('[data-cy="email-input"]').should('have.value', validEmail)
        cy.get('[data-cy="report-problem-drawing-added-feedback"]')
            .should('be.visible')
            .should('have.class', 'valid-feedback')
            .contains('Drawing added as attachment')

        cy.log('Send the feedback')
        cy.get('[data-cy="submit-button"]').click()
        cy.wait('@feedback').then((interception) => {
            const formData = parseFormData(interception.request)
            ;[
                { name: 'subject', contains: `Problem report` },
                { name: 'feedback', contains: text },
                { name: 'version', contains: APP_VERSION },
                { name: 'ua', contains: navigator.userAgent },
                { name: 'kml', contains: '<Data name="type"><value>marker</value></Data>' },
                { name: 'kml', contains: '<Data name="type"><value>annotation</value></Data>' },
                { name: 'kml', contains: '<Data name="type"><value>linepolygon</value></Data>' },
            ].forEach((param) => {
                expect(interception.request.body).to.be.a('String')
                expect(formData).to.haveOwnProperty(param.name)
                expect(formData[param.name]).to.contain(param.contains)
            })
        })
    })
})
