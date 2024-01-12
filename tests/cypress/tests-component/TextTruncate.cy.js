/// <reference types="cypress" />

import TextTruncate from '@/utils/components/TextTruncate.vue'

describe('<TextTruncate />', () => {
    it('It add a tippy with a simple text slot', () => {
        const slotContent = 'This is my slot content'
        cy.mount(TextTruncate, {
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="inner-element"]').realHover({ position: 'left' })
        cy.get('.tippy-box').should('be.visible').contains(slotContent)
        cy.get('[data-cy="inner-element"]').click('left')
    })

    it("It don't add a tippy with a complex slot", () => {
        const slotContent = 'Test<div>This is my slot <b>content</b></div>'
        cy.mount(TextTruncate, {
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="inner-element"]').realHover({ position: 'left' })
        cy.get('.tippy-box').should('not.exist')
        cy.get('[data-cy="inner-element"]').click('left')
    })

    it('It add a tippy with a custom content', () => {
        const slotContent = 'bla bla bla bla'
        const textContent = 'Test This is my slot content'
        cy.mount(TextTruncate, {
            props: { text: textContent },
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="inner-element"]').realHover({ position: 'left' })
        cy.get('.tippy-box').should('be.visible').contains(textContent)
        cy.get('[data-cy="inner-element"]').click('left')
    })

    it('It add a tippy with a custom content and span slot', () => {
        const slotContent = '<span>My slot content</span>'
        const textContent = 'My slot content'
        cy.mount(TextTruncate, {
            props: { text: textContent },
            slots: { default: slotContent },
            attrs: { style: 'width: 50px' },
        })
        cy.get('[data-cy="inner-element"]').realHover({ position: 'left' })
        cy.get('.tippy-box').should('be.visible').contains(textContent)
        cy.get('[data-cy="inner-element"]').click('left')
    })

    // The following test is flaky and don't allways pass, I tried several method to make it more
    // robust, but couldn't find a robust way. The main issue is that after the viewport resize
    // the cy.get('.tippy-box') timesout when it shouldn't. Manual testing shows that this test
    // case works. Here below some workaround tried to solve this issue
    // - Use a fake url interceptor when the tippy is added
    // - Use DOM interceptor
    it.skip('It add a tippy after a resize', () => {
        const slotContent = 'My slot content'
        cy.mount(TextTruncate, {
            slots: { default: slotContent },
        })
        cy.get('[data-cy="inner-element"]').realHover({ position: 'left' })
        cy.get('.tippy-box').should('not.exist')
        cy.get('[data-cy="inner-element"]').click('left')

        cy.viewport(50, 480)
        cy.get('[data-cy="inner-element"]').realHover({ position: 'left' })
        cy.get('.tippy-box').should('be.visible').contains(slotContent)
        cy.get('[data-cy="inner-element"]').click('left')

        cy.viewport(300, 480)
        cy.get('[data-cy="inner-element"]').realHover({ position: 'left' })
        cy.get('.tippy-box').should('not.exist')
        cy.get('[data-cy="inner-element"]').click('left')
    })
})
