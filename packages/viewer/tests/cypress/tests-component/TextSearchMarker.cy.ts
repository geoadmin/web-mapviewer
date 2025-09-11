/// <reference types="cypress" />

import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'

describe('<TextSearchMarker />', () => {
    it('Renders', () => {
        cy.log('It mark a search text in bold')
        cy.mount(TextSearchMarker, {
            props: { text: 'This a simple text', search: 'simple', markers: 'fw-bold' },
        })
        cy.get('[data-cy="segment"]')
            .should('be.visible')
            .should('not.have.class', 'fw-bold')
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold')
            .contains('simple')

        //----------------------------------------------------------------------
        cy.log('It mark a search pattern in bold')
        cy.mount(TextSearchMarker, {
            props: { text: 'This a simple-345 text', search: /simple-\d+/, markers: 'fw-bold' },
        })
        cy.get('[data-cy="segment"]')
            .should('be.visible')
            .should('not.have.class', 'fw-bold')
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold')
            .contains('simple-345')

        //----------------------------------------------------------------------
        cy.log('It mark multiple search pattern in bold')
        cy.mount(TextSearchMarker, {
            props: {
                text: 'This a simple-345 text and simple-100 text',
                search: /simple-\d+/,
                markers: 'fw-bold',
            },
        })
        cy.get('[data-cy="segment"]')
            .should('be.visible')
            .should('not.have.class', 'fw-bold')
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold')
            .should('have.length', 2)
        cy.get('[data-cy="segment-match"]:first').should('contain', 'simple-345')
        cy.get('[data-cy="segment-match"]:last').should('contain', 'simple-100')

        //----------------------------------------------------------------------
        cy.log('It mark a search pattern with default markers')
        cy.mount(TextSearchMarker, {
            props: { text: 'This a simple-345 text', search: /simple-\d+/ },
        })
        cy.get('[data-cy="segment"]')
            .should('be.visible')
            .should('not.have.class', 'fw-bold')
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold bg-info bg-opacity-25')
            .contains('simple-345')

        //----------------------------------------------------------------------
        cy.log('It mark a search pattern with multiple markers as string')
        cy.mount(TextSearchMarker, {
            props: {
                text: 'This a simple-345 text',
                search: /simple-\d+/,
                markers: 'fw-bold bg-secondary',
            },
        })
        cy.get('[data-cy="segment"]')
            .should('be.visible')
            .should('not.have.class', 'fw-bold')
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold bg-secondary')
            .contains('simple-345')

        //----------------------------------------------------------------------
        cy.log('It mark a search pattern with multiple markers as list')
        cy.mount(TextSearchMarker, {
            props: {
                text: 'This a simple-345 text',
                search: /simple-\d+/,
                markers: ['fw-bold', 'bg-secondary'],
            },
        })
        cy.get('[data-cy="segment"]')
            .should('be.visible')
            .should('not.have.class', 'fw-bold')
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold bg-secondary')
            .contains('simple-345')
    })
})
