/// <reference types="cypress" />

import TextTruncate from '@/utils/components/TextTruncate.vue'

describe('<TextTruncate />', () => {
    it('It add a tooltip with a simple text slot', () => {
        const slotContent = 'This is my slot content'
        cy.mount(TextTruncate, {
            props: { dataCy: 'tooltip-test' },
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="floating-container"]').trigger('mouseover')
        cy.get('[data-cy="floating-tooltip-test"]')
            .should('be.visible')
            .should('contain', slotContent)
        cy.get('[data-cy="floating-container"]').click('left')
    })

    it("It don't add a tooltip with a complex slot", () => {
        const slotContent = 'Test<div>This is my slot <b>content</b></div>'
        cy.mount(TextTruncate, {
            props: { dataCy: 'tooltip-test' },
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="floating-container"]').trigger('mouseover')
        cy.get('[data-cy="floating-tooltip-test"]').should('not.exist')
        cy.get('[data-cy="floating-container"]').click('left')
    })

    it('It add a tooltip with a custom content', () => {
        const slotContent = 'bla bla bla bla'
        const textContent = 'Test This is my slot content'
        cy.mount(TextTruncate, {
            props: {
                text: textContent,
                dataCy: 'tooltip-test',
            },
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="floating-container"]').trigger('mouseover')
        cy.get('[data-cy="floating-tooltip-test"]')
            .should('be.visible')
            .should('contain', textContent)
        cy.get('[data-cy="floating-container"]').click('left')
    })

    it('It add a tooltip with a custom content and span slot', () => {
        const slotContent = '<span>My slot content</span>'
        const textContent = 'My slot content'
        cy.mount(TextTruncate, {
            props: {
                text: textContent,
                dataCy: 'tooltip-test',
            },
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="floating-container"]').trigger('mouseover')
        cy.get('[data-cy="floating-tooltip-test"]')
            .should('be.visible')
            .should('contain', textContent)
        cy.get('[data-cy="floating-container"]').click('left')
    })

    // The following test is flaky, and don't always pass, I tried several methods to make it more
    // robust, but couldn't find a robust way. The main issue is that after the viewport resizes
    // the cy.get('[data-cy="floating-tooltip-test"]') times out when it shouldn't.
    // Manual testing shows that this test case works.
    // Here below, some workaround tried to solve this issue
    // - Use a fake url interceptor when the tooltip is added
    // - Use DOM interceptor
    it.skip('It add a tooltip after a resize', () => {
        const slotContent = 'My slot content'
        cy.mount(TextTruncate, {
            props: { dataCy: 'tooltip-test' },
            slots: { default: slotContent },
        })
        cy.get('[data-cy="floating-container"]').trigger('mouseover')
        cy.get('[data-cy="floating-tooltip-test"]').should('not.exist')
        cy.get('[data-cy="floating-container"]').click('left')

        cy.viewport(50, 480)
        cy.get('[data-cy="floating-container"]').trigger('mouseover')
        cy.get('[data-cy="floating-tooltip-test"]')
            .should('be.visible')
            .should('contain', slotContent)
        cy.get('[data-cy="floating-container"]').click('left')

        cy.viewport(300, 480)
        cy.get('[data-cy="floating-container"]').trigger('mouseover')
        cy.get('[data-cy="floating-tooltip-test"]').should('not.exist')
        cy.get('[data-cy="floating-container"]').click('left')
    })
})
