/// <reference types="cypress" />

import EmailInput from '@/utils/components/EmailInput.vue'
import FileInput from '@/utils/components/FileInput.vue'
import TextAreaInput from '@/utils/components/TextAreaInput.vue'
import TextInput from '@/utils/components/TextInput.vue'

const generateTest = (element, dataCy) => {
    it('It is disabled', () => {
        cy.mount(element, {
            props: { disabled: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.disabled')
    })
    it('It has a label', () => {
        cy.mount(element, {
            props: { label: 'My label' },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}-label"]`).should('be.visible')
        cy.get(`[data-cy="${dataCy}-label"]`).contains('My label')
    })
    it('It has a description', () => {
        cy.mount(element, {
            props: { description: 'My description' },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}-description"]`).should('be.visible')
        cy.get(`[data-cy="${dataCy}-description"]`).contains('My description')
    })
    it('It has a placeholder', () => {
        cy.mount(element, {
            props: { placeholder: 'My placeholder' },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.attr',
            'placeholder',
            'My placeholder'
        )
    })
    it('It has invalid marker when required and empty', () => {
        cy.mount(element, {
            props: { required: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}"]`).should('not.have.class', 'is-invalid')
        cy.mount(element, {
            props: { required: true, activateValidation: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-invalid'
        )
    })
    it('It has invalid marker when invalidMarker is set', () => {
        cy.mount(element, {
            props: { invalidMarker: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-invalid'
        )
        cy.mount(element, {
            props: { invalidMarker: true, activateValidation: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-invalid'
        )
    })
    it('It has invalid message when invalidMessage is set', () => {
        cy.mount(element, {
            props: { invalidMarker: true, invalidMessage: 'Invalid message' },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-invalid'
        )
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).should('not.be.visible')
        cy.mount(element, {
            props: {
                invalidMarker: true,
                invalidMessage: 'Invalid message',
                activateValidation: true,
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-invalid'
        )
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).should('be.visible')
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).contains('Invalid message')
    })
    it('It has valid marker when validMarker is set', () => {
        cy.mount(element, {
            props: { validMarker: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).should('not.exist')
        cy.mount(element, {
            props: {
                validMarker: true,
                activateValidation: true,
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        if (element === FileInput) {
            cy.get(`[data-cy="${dataCy}"]`).selectFile(
                { contents: Cypress.Buffer.from('file contents'), fileName: 'file.txt' },
                {
                    force: true,
                }
            )
        } else {
            cy.get(`[data-cy="${dataCy}"]`).type('test@test.com')
        }
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-valid'
        )
    })
    it('It has valid message when validMessage is set on non empty field', () => {
        cy.mount(element, {
            props: { validMarker: true, validMessage: 'Valid message' },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).should('not.be.visible')
        cy.mount(element, {
            props: {
                validMarker: true,
                validMessage: 'Valid message',
                activateValidation: true,
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).should('not.be.visible')
        if (element === FileInput) {
            cy.get(`[data-cy="${dataCy}"]`).selectFile(
                { contents: Cypress.Buffer.from('file contents'), fileName: 'file.txt' },
                {
                    force: true,
                }
            )
        } else {
            cy.get(`[data-cy="${dataCy}"]`).type('test@test.com')
        }
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).should('be.visible')
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).contains('Valid message')
    })
    it('It validate the field with external validation method', () => {
        cy.mount(element, {
            props: {
                validate: () => {
                    return { valid: false, invalidMessage: 'Invalid field' }
                },
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-invalid'
        )
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).should('not.be.visible')
        cy.mount(element, {
            props: {
                validate: () => {
                    return { valid: false, invalidMessage: 'Invalid field' }
                },
                activateValidation: true,
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-invalid'
        )
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).should('be.visible')
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).contains('Invalid field')
    })
}

describe('Test Validation Input fields', () => {
    context('TextInput', () => {
        generateTest(TextInput, 'text-input')
    })
    context('TextAreaInput', () => {
        generateTest(TextAreaInput, 'text-area-input')
    })
    context('EmailInput', () => {
        generateTest(EmailInput, 'email-input')
        it('It is marked invalid with invalid email', () => {
            cy.mount(EmailInput, {
                props: { activateValidation: true },
            })
            cy.get(`[data-cy="email-input"]`).should('be.enabled')
            cy.get(`[data-cy="email-input"]`).type('hello')
            cy.get(`[data-cy="email-input"]`).should('have.class', 'is-invalid')
            cy.get(`[data-cy="email-input-invalid-feedback"]`).should('be.visible')
            cy.get(`[data-cy="email-input-invalid-feedback"]`).contains('Invalid email')
        })
    })
    context('FileInput', () => {
        generateTest(FileInput, 'file-input')
        it('It is marked invalid with invalid file types', () => {
            cy.mount(FileInput, {
                props: { activateValidation: true, acceptedFileTypes: ['.json', '.kml'] },
            })
            cy.get(`[data-cy="file-input"]`).should('be.enabled')
            cy.get(`[data-cy="file-input"]`).selectFile(
                { contents: Cypress.Buffer.from('file contents'), fileName: 'file.txt' },
                {
                    force: true,
                }
            )
            cy.get(`[data-cy="file-input-text"]`).should('have.class', 'is-invalid')
            cy.get(`[data-cy="file-input-invalid-feedback"]`).should('be.visible')
            cy.get(`[data-cy="file-input-invalid-feedback"]`).contains(
                'This file format is not supported. Only the following formats are allowed: .json, .kml'
            )
        })
        it('It is marked invalid with file too big', () => {
            cy.mount(FileInput, {
                props: { activateValidation: true, maxFileSize: 10 },
            })
            cy.get(`[data-cy="file-input"]`).should('be.enabled')
            cy.get(`[data-cy="file-input"]`).selectFile(
                {
                    contents: Cypress.Buffer.from('file contents bigger than 10 bytes'),
                    fileName: 'file.txt',
                },
                {
                    force: true,
                }
            )
            cy.get(`[data-cy="file-input-text"]`).should('have.class', 'is-invalid')
            cy.get(`[data-cy="file-input-invalid-feedback"]`).should('be.visible')
            cy.get(`[data-cy="file-input-invalid-feedback"]`).contains('The file is too large')
        })
    })
})
