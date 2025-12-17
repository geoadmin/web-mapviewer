/// <reference types="cypress" />

import type { ValidationResult } from '@/utils/composables/useFieldValidation'

import EmailInput from '@/utils/components/EmailInput.vue'
import FileInput from '@/utils/components/FileInput.vue'
import TextAreaInput from '@/utils/components/TextAreaInput.vue'
import TextInput from '@/utils/components/TextInput.vue'

/**
 * Generate common validation tests for input components
 *
 * @param element - Vue component to test. Using Record<string, unknown> instead of Vue's Component
 *   type to avoid TypeScript errors with Cypress mount and to support runtime equality checks
 *   (element === FileInput)
 * @param dataCy - The data-cy attribute value used to select the input element in tests
 */
const generateTest = (element: Record<string, unknown>, dataCy: string) => {
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
        cy.log('without setting validateWhenPristine, no validation should occur')
        cy.mount(element, {
            props: { required: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}"]`).should('not.have.class', 'is-invalid')

        cy.log(
            'with validateWhenPristine: true, validation should occur even if the field is empty'
        )
        cy.mount(element, {
            props: { required: true, validateWhenPristine: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-invalid'
        )
    })
    it('It has invalid marker when forceInvalid is set', () => {
        cy.log('without setting validateWhenPristine, no validation should occur')
        cy.mount(element, {
            props: { forceInvalid: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-invalid'
        )

        cy.log('with validateWhenPristine: true, validation should occur')
        cy.mount(element, {
            props: { forceInvalid: true, validateWhenPristine: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-invalid'
        )
    })
    it('It has invalid message when invalidMessage is set', () => {
        cy.log('without setting validateWhenPristine, no validation should occur')
        cy.mount(element, {
            props: {
                forceInvalid: true,
                invalidMessage: 'Invalid message',
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-invalid'
        )
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).should('not.exist')

        cy.log('with validateWhenPristine: true, validation should occur')
        cy.mount(element, {
            props: {
                forceInvalid: true,
                invalidMessage: 'Invalid message',
                validateWhenPristine: true,
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
    it('It has valid marker when forceValid is set', () => {
        cy.log('without setting validateWhenPristine, no validation should occur')
        cy.mount(element, {
            props: { forceValid: true },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).should('not.exist')

        cy.log('with validateWhenPristine: true, validation should occur')
        cy.mount(element, {
            props: {
                forceValid: true,
                validateWhenPristine: true,
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
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
        cy.log('without setting validateWhenPristine, no validation should occur')
        cy.mount(element, {
            props: { forceValid: true, validMessage: 'Valid message' },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).should('not.be.visible')

        cy.log('with validateWhenPristine: true, validation should occur')
        cy.mount(element, {
            props: {
                forceValid: true,
                validMessage: 'Valid message',
                validateWhenPristine: true,
            },
        })
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}-valid-feedback"]`).should('be.visible')
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
        if (element === FileInput) {
            cy.mount(element, {
                props: {
                    validate: (_: File): ValidationResult => {
                        return { valid: false, invalidMessage: 'Invalid field' }
                    },
                },
            })
        } else {
            cy.mount(element, {
                props: {
                    validate: (_: string): ValidationResult => {
                        return { valid: false, invalidMessage: 'Invalid field' }
                    },
                },
            })
        }
        cy.get(`[data-cy="${dataCy}"]`).should('be.enabled')
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-valid'
        )
        cy.get(`[data-cy="${dataCy}${element === FileInput ? '-text' : ''}"]`).should(
            'not.have.class',
            'is-invalid'
        )
        cy.get(`[data-cy="${dataCy}-invalid-feedback"]`).should('not.exist')
        if (element === FileInput) {
            cy.mount(element, {
                props: {
                    validate: (_: File): ValidationResult => {
                        return {
                            valid: false,
                            invalidMessage: 'Invalid field',
                        }
                    },
                    validateWhenPristine: true,
                },
            })
        } else {
            cy.mount(element, {
                props: {
                    validate: (_: string): ValidationResult => {
                        return { valid: false, invalidMessage: 'Invalid field' }
                    },
                    validateWhenPristine: true,
                },
            })
        }
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
            cy.mount(EmailInput)
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
                props: { acceptedFileTypes: ['.json', '.kml'] },
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
                props: { maxFileSize: 10 },
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
