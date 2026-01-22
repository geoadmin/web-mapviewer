/// <reference types="cypress" />

import type { Interception } from 'cypress/types/net-stubbing'

import { interceptPostKml } from 'support/drawing'
import { interceptFeedback, parseFormData } from 'support/feedbackTestUtils'
import { assertDefined, isMobile } from 'support/utils'

import { APP_VERSION } from '@/config'
import useLayersStore from '@/store/modules/layers'

const text =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const validEmail = 'this.is.a.valid@email.com'

describe('Testing the report problem form', () => {
    function closeForm() {
        cy.get('[data-cy="report-problem-window"] [data-cy="window-close"]:visible').click()
    }

    function openForm() {
        cy.get('[data-cy="report-problem-button"]:visible').as('reportProblemButton').click()
        cy.get('[data-cy="report-problem-window"]').as('reportProblemForm').should('be.visible')
    }

    it('places the "report a problem" correctly', () => {
        cy.goToMapView()

        // Mobile view
        cy.viewport(320, 568)
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-help-section"]:visible').click()
        cy.log('The button should be in the header as a link on mobile')
        cy.get('[data-cy="report-problem-button"]:visible').click()
        cy.get('[data-cy="report-problem-form"] [data-cy="report-problem-category"]')
            .as('firstFeedbackElement')
            .should('be.visible')

        cy.log('can minimize the window in order to see the map')
        cy.get('[data-cy="report-problem-window"] [data-cy="simple-window-minimize"]:visible')
            .as('minimizeButton')
            .click()
        cy.get('@firstFeedbackElement').should('be.hidden')
        cy.get('@minimizeButton').click()
        cy.get('@firstFeedbackElement').should('be.visible')
        closeForm()

        cy.log('The button should be in the header as a link on desktop')
        cy.viewport(1920, 1080)
        cy.get('[data-cy="report-problem-link-button"]:visible').click()
        cy.get('@firstFeedbackElement').should('be.visible')

        cy.log('can minimize the window in order to see the map')
        cy.get('@minimizeButton').click()
        cy.get('@firstFeedbackElement').should('be.hidden')
        cy.get('@minimizeButton').click()
        cy.get('@firstFeedbackElement').should('be.visible')
        closeForm()
    })

    it('test the report problem form UI, validations, and it backend interaction', () => {
        interceptFeedback(false)
        cy.goToMapView()

        cy.log('It is not possible to report a problem without a category')
        cy.openMenuIfMobile()
        if (isMobile()) {
            cy.get('[data-cy="menu-help-section"]:visible').click()
        }
        openForm()
        cy.get('[data-cy="report-problem-category"] [data-cy="dropdown-main-button"]')
            .as('categoryDropdown')
            .should('be.visible')
            .should('contain.text', 'Select a category')

        cy.get('[data-cy="report-problem-text-area"] [data-cy="text-area-input"]')
            .as('textArea')
            .should('be.visible')
        cy.get('@textArea').type(text)

        cy.get('[data-cy="report-problem-email"] [data-cy="email-input"]')
            .as('emailInput')
            .should('be.visible')
        cy.get('@emailInput').type(validEmail)

        cy.get('[data-cy="submit-button"]').as('submit').should('be.visible')
        cy.get('@submit').click()

        cy.get('[data-cy="report-problem-category"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="report-problem-failed-text"]').should('not.exist')
        closeForm()

        cy.log('It is possible to report a problem without specifying an email address')
        cy.openMenuIfMobile()
        openForm()
        cy.get('@categoryDropdown').click()
        cy.get('[data-cy="dropdown-item-other"]:visible').as('categoryOther').click()
        cy.get('@textArea').type(text)
        cy.get('@emailInput').should('be.empty')
        cy.get('@submit').should('be.enabled')
        closeForm()

        cy.log('It is not possible to report a problem with a malformed email')
        cy.openMenuIfMobile()
        openForm()
        cy.get('@categoryDropdown').click()
        cy.get('@categoryOther').click()
        cy.get('@categoryDropdown').should('contain.text', 'Other')
        cy.get('@textArea').type(text)
        cy.get('@emailInput').type('this.is.not.a.valid@email')
        cy.get('@submit').click()
        cy.get('@emailInput').should('have.class', 'is-invalid')
        cy.get('[data-cy="report-problem-failed-text"]').should('not.exist')
        closeForm()

        cy.log('It validates email before enabling the user to report a problem')
        cy.openMenuIfMobile()
        openForm()
        cy.get('@categoryDropdown').click()
        cy.get('[data-cy="dropdown-item-background_map"]:visible')
            .as('categoryBackgroundMap')
            .click()
        cy.get('@textArea').type(text)
        cy.get('@emailInput').type(validEmail)
        cy.get('@submit').should('be.enabled')
        closeForm()

        cy.log('It is not possible to report a problem without filling the message')
        cy.openMenuIfMobile()
        openForm()
        cy.get('@categoryDropdown').click()
        cy.get('@categoryOther').click()
        cy.get('@textArea').should('be.empty')
        cy.get('@emailInput').type(validEmail)
        cy.get('@submit').click()
        cy.get('@emailInput').should('have.class', 'is-valid')
        cy.get('@textArea').should('have.class', 'is-invalid')
        cy.get('[data-cy="report-problem-failed-text"]').should('not.exist')
        closeForm()

        cy.log('It generates a complete request to service-feedback')
        cy.openMenuIfMobile()
        openForm()
        interceptFeedback(true, {
            delay: 3000,
            alias: 'longAnswer',
        })
        cy.get('@categoryDropdown').click()
        cy.get('[data-cy="dropdown-item-thematic_map"]:visible').click()
        cy.get('@categoryDropdown').should('contain.text', 'A thematic map layer')
        cy.get('@emailInput').type(validEmail)
        cy.get('@textArea').type(text)
        cy.get('@submit').scrollIntoView()
        cy.get('@submit').click()

        cy.log(
            'it shows the user the feedback was well received with a checkmark in the submit button'
        )
        cy.get('[data-cy="submit-button"] [data-cy="submit-pending-icon"]').should('be.visible')
        cy.wait('@longAnswer').then((interception: Interception) => {
            const params = [
                { name: 'subject', contains: `[Problem Report]` },
                { name: 'feedback', contains: text },
                { name: 'category', contains: 'thematic_map' },
                // Verification of the Version fails in local as APP_VERSION is set diffferently than in CI/CD
                { name: 'version', contains: APP_VERSION },
                { name: 'ua', contains: navigator.userAgent },
                { name: 'email', contains: validEmail },
            ]
            params.forEach((param) => {
                expect(interception.request.body).to.be.a('String')
                const formData = parseFormData(interception.request)
                expect(formData).to.haveOwnProperty(param.name)
                expect(formData[param.name]).to.contain(param.contains)
            })
        })

        cy.get('@categoryDropdown').should('not.exist')
        cy.get('[data-cy="report-problem-success-text"]').should('be.visible')
        cy.get('[data-cy="report-problem-close-successful"]')
            .as('closeSuccessButton')
            .should('be.focused')

        cy.log('Closes the modal if the close button is clicked')
        cy.get('@closeSuccessButton').click()
        cy.get('[data-cy="report-problem-form"]').should('not.exist')

        cy.log('It send the correct version when the email is empty and attach a file')
        interceptFeedback(true)
        cy.openMenuIfMobile()
        openForm()
        cy.get('@categoryDropdown').should('be.visible').click()
        cy.get('[data-cy="dropdown-item-other"]').should('be.visible').click()
        cy.get('@textArea').type(text)
        const localKmlFile = 'import-tool/external-kml-file.kml'
        cy.fixture(localKmlFile, undefined).as('kmlFixture')
        cy.get('[data-cy="file-input"]').selectFile('@kmlFixture', {
            force: true,
        })
        cy.get('@submit').click()

        cy.wait('@feedback').then((interception) => {
            const formData = parseFormData(interception.request)
            const params = [
                { name: 'subject', contains: `[Problem Report]` },
                { name: 'feedback', contains: text },
                { name: 'category', contains: 'other' },
                { name: 'version', contains: APP_VERSION },
                { name: 'ua', contains: navigator.userAgent },
            ]
            params.forEach((param) => {
                expect(interception.request.body).to.be.a('String')
                expect(formData).to.haveOwnProperty(param.name)
                expect(formData[param.name]).to.contain(param.contains)
            })
            expect(formData).to.haveOwnProperty('attachment')
            expect(formData['attachment']).to.contain('external-kml-file.kml')
        })

        cy.get('[data-cy="report-problem-form"]').should('not.exist')
        cy.get('[data-cy="report-problem-success-text"]').should('be.visible')
        cy.get('[data-cy="report-problem-close-successful"]').should('be.focused')

        cy.log('Closes the modal if the close button is clicked')
        cy.get('[data-cy="report-problem-close-successful"]').click()
        cy.get('[data-cy="report-problem-form"]').should('not.exist')

        cy.log('It shows a text to the user to tell him something went wrong')
        cy.openMenuIfMobile()
        openForm()
        interceptFeedback(false)
        cy.get('@categoryDropdown').should('be.visible').click()
        cy.get('[data-cy="dropdown-item-other"]').should('be.visible').click()
        cy.get('@textArea').type(text)
        cy.get('@emailInput').type(validEmail)
        cy.get('@submit').click()

        cy.wait('@feedback')
        cy.get('[data-cy="submit-button"] [data-cy="report-problem-success-icon"]').should(
            'not.exist'
        )
        cy.get('[data-cy="report-problem-failed-text"]').should('be.visible')
        closeForm()
    })

    it('reports a problem with drawing attachment', () => {
        let kmlBody: string | FormData | undefined

        interceptPostKml()
        cy.goToMapView()
        interceptFeedback(true)
        cy.openMenuIfMobile()
        if (isMobile()) {
            cy.get('[data-cy="menu-help-section"]:visible').click()
        }

        cy.log(
            'Cancel the report and open the drawing mode to verify that there is no drawing layer after closing it'
        )

        cy.get('[data-cy="report-problem-button"]').scrollIntoView()
        cy.get('[data-cy="report-problem-button"]').should('be.visible').click()

        cy.get('[data-cy="report-problem-form"]').as('reportForm').should('exist')
        cy.get('[data-cy="report-problem-drawing-button"]').as('reportDrawing').scrollIntoView()
        cy.get('@reportDrawing').should('be.visible').click()
        cy.log('Draw some features')
        cy.clickDrawingTool('MARKER')
        cy.get('[data-cy="ol-map"]').click('center')

        cy.clickDrawingTool('ANNOTATION')
        cy.get('[data-cy="ol-map"]').then(($el) => {
            const mapWidth = $el.width()
            const mapHeight = $el.height()
            assertDefined(mapWidth)
            assertDefined(mapHeight)
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2 + 50, mapHeight / 2)
        })

        cy.get('[data-cy="drawing-toolbox-close-button"]').should('be.visible').click()
        cy.get('@reportForm').should('exist')
        cy.get('[data-cy="drawing-header-title"]').should('not.exist')

        cy.get('[data-cy="window-close"]').should('be.visible').click()
        cy.get('[data-cy="menu-button"]').should('be.visible').click()

        cy.get('[data-cy="menu-tray-drawing-section"] > [data-cy="menu-section-header"]').click()
        cy.get('[data-cy="drawing-toolbox-close-button"]').should('be.visible').click()
        cy.getPinia().then((pinia) => {
            const layersStore = useLayersStore(pinia)
            expect(layersStore.activeLayers).to.have.length(0)
        })
        cy.get('[data-cy="menu-help-section"]:visible').click()
        cy.get('[data-cy="report-problem-button"]').should('be.visible').click()
        cy.get('@reportForm').should('exist')
        cy.get('@reportDrawing').scrollIntoView()
        cy.get('@reportDrawing').should('be.visible')

        cy.log('Redo the drawing in the report problem form')
        cy.get('@reportDrawing').click()

        cy.log('Draw some features')
        cy.viewport('macbook-11')
        cy.clickDrawingTool('MARKER')
        cy.get('[data-cy="ol-map"]').click('center')

        cy.clickDrawingTool('ANNOTATION')
        cy.get('[data-cy="ol-map"]').then(($el) => {
            const mapWidth = $el.width()
            const mapHeight = $el.height()
            assertDefined(mapWidth)
            assertDefined(mapHeight)
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2 + 50, mapHeight / 2)
        })
        // we need to increase the timeout here below because, upon opening the drawing mode for the
        // first time in e2e tests, the loading of the library can take more time
        cy.get('[data-cy="drawing-header-title"]', { timeout: 15000 })
            .should('be.visible')
            .contains('3. Indicate the appropriate location on the map :')
        cy.get('[data-cy="drawing-toolbox-share-button"]').should('not.exist')
        cy.get('[data-cy="drawing-toolbox-disclaimer"]').should('not.exist')
        cy.get('[data-cy="drawing-toolbox-file-name-input"]').should('not.exist')

        cy.log(`Exit drawing mode`)
        cy.get('[data-cy="drawing-header-close-button"]').should('be.visible').click()

        cy.log('Verify report problem form with drawing attachment')
        cy.get('[data-cy="report-problem-form"]').as('reportForm').should('exist')

        cy.log('Select category')
        cy.get('[data-cy="report-problem-category"] [data-cy="dropdown-main-button"]').as(
            'categoryDropdown'
        )
        cy.get('@categoryDropdown').click()
        cy.get('[data-cy="dropdown-item-other"]').click()

        cy.log('Write description and email')
        cy.get('[data-cy="report-problem-text-area"] [data-cy="text-area-input"]').as('textArea')
        cy.get('@textArea').type(text)

        cy.get('[data-cy="report-problem-email"] [data-cy="email-input"]').as('emailInput')
        cy.get('@emailInput').type(validEmail)

        cy.get('@emailInput').should('have.value', validEmail)
        cy.get('[data-cy="report-problem-drawing-added-feedback"]')
            .should('be.visible')
            .should('have.class', 'valid-feedback')

        cy.log('Clear drawing')
        cy.get('@reportDrawing').should('be.visible')
        cy.get('@reportDrawing').click()
        cy.get('[data-cy="drawing-toolbox-delete-button"]:visible').click()
        cy.get('[data-cy="modal-confirm-button"]:visible').click()
        cy.get('[data-cy="drawing-header-close-button"]:visible').click()
        cy.viewport('iphone-3')

        cy.get('@categoryDropdown').should('exist')
        cy.get('[data-cy="drawing-header-title"]').should('not.exist')
        cy.get('@textArea').should('have.value', text)
        cy.get('@emailInput').should('have.value', validEmail)
        cy.get('[data-cy="report-problem-drawing-added-feedback"]').should('not.be.visible')

        cy.log('Draw some more features')
        cy.get('@reportDrawing').click()
        cy.clickDrawingTool('MARKER')
        cy.get('[data-cy="ol-map"]').click()

        cy.clickDrawingTool('ANNOTATION')
        cy.get('[data-cy="ol-map"]').then(($el) => {
            const mapWidth = $el.width()
            const mapHeight = $el.height()
            assertDefined(mapWidth)
            assertDefined(mapHeight)
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2 + 50, mapHeight / 2)
        })

        cy.clickDrawingTool('LINEPOLYGON')
        cy.get('[data-cy="ol-map"]').then(($el) => {
            const mapWidth = $el.width()
            const mapHeight = $el.height()
            assertDefined(mapWidth)
            assertDefined(mapHeight)
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2 - 50, mapHeight / 2)
            cy.get('[data-cy="ol-map"]').click(mapWidth / 2, mapHeight / 2)
            cy.get('[data-cy="ol-map"]').dblclick(mapWidth / 2 + 10, mapHeight / 2 + 50)
        })

        cy.wait('@post-kml')

        cy.get('[data-cy="drawing-toolbox-close-button"]').should('be.visible').click()
        cy.wait('@post-kml')

        cy.wait('@post-kml')

        console.log('KML Body:', kmlBody)
        cy.get('@reportForm').should('exist')
        cy.get('[data-cy="drawing-header-title"]').should('not.exist')
        cy.get('@textArea').should('have.value', text)
        cy.get('@emailInput').should('have.value', validEmail)
        cy.get('[data-cy="report-problem-drawing-added-feedback"]')
            .as('reportDrawingFeedback')
            .should('be.visible')
            .should('have.class', 'valid-feedback')
        cy.get('@reportDrawingFeedback').contains('Drawing added as attachment')

        cy.log('Send the feedback')
        cy.get('[data-cy="submit-button"]').click()
        cy.wait('@feedback').then((interception) => {
            const formData = parseFormData(interception.request)
            ;[
                { name: 'subject', contains: `[Problem Report]` },
                { name: 'feedback', contains: text },
                { name: 'version', contains: APP_VERSION.replace('.dirty', '') },
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
