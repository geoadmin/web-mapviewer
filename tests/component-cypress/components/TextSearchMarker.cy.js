import TextSearchMarker from '@/utils/TextSearchMarker.vue'

describe('<TextSearchMarker />', () => {
    it('Renders', () => {
        cy.log('It mark a search text in bold')
        cy.mount(TextSearchMarker, {
            props: { text: 'This a simple text', search: 'simple' },
        })
        cy.get('[data-cy="segment"]').each(($el) => {
            expect($el).to.be.visible
            expect($el).not.to.have.class('fw-bold')
        })
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold')
            .contains('simple')

        cy.log('It mark a search pattern in bold')
        cy.mount(TextSearchMarker, {
            props: { text: 'This a simple-345 text', search: /simple-\d+/ },
        })
        cy.get('[data-cy="segment"]').each(($el) => {
            expect($el).to.be.visible
            expect($el).not.to.have.class('fw-bold')
        })
        cy.get('[data-cy="segment-match"]')
            .should('be.visible')
            .should('have.class', 'fw-bold')
            .contains('simple-345')

        cy.log('It mark multiple search pattern in bold')
        cy.mount(TextSearchMarker, {
            props: { text: 'This a simple-345 text and simple-100 text', search: /simple-\d+/ },
        })
        cy.get('[data-cy="segment"]').each(($el) => {
            expect($el).to.be.visible
            expect($el).not.to.have.class('fw-bold')
        })
        cy.get('[data-cy="segment-match"]').each(($el, index) => {
            expect($el).to.be.visible
            expect($el).to.have.class('fw-bold')
            switch (index) {
                case 0:
                    expect($el).to.contain('simple-345')
                    break
                case 1:
                    expect($el).to.contain('simple-100')
                    break
                default:
                    expect(false).to.be.true
                    break
            }
        })
    })
})
