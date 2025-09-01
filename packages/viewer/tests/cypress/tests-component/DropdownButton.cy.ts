import DropdownButton from '@/utils/components/DropdownButton.vue'

describe('<DropdownButton />', () => {
    function generateItems(nbItems: number) {
        const items = []
        for (let i = 1; i <= nbItems; i++) {
            items.push({
                id: i,
                title: `item ${i}`,
                value: i,
            })
        }
        return items
    }
    const defaultItems = generateItems(3)
    it('renders', () => {
        cy.mount(DropdownButton, {
            props: {
                title: 'Test render',
                items: defaultItems,
                currentValue: 1,
            },
        })
        cy.get('[data-cy="dropdown-main-button"]').click()
        cy.get('[data-cy="dropdown-item-1"]').should('be.visible')
        cy.get('[data-cy="dropdown-item-1"]').should('contain.text', 'item 1')
        cy.get('[data-cy="dropdown-item-1"]').should('have.class', 'active')

        cy.get('[data-cy="dropdown-item-2"]').should('be.visible')
        cy.get('[data-cy="dropdown-item-2"]').should('contain.text', 'item 2')

        cy.get('[data-cy="dropdown-item-3"]').should('be.visible')
        cy.get('[data-cy="dropdown-item-3"]').should('contain.text', 'item 3')
    })
    it('can change its active element', () => {
        cy.mount(DropdownButton, {
            props: {
                title: 'Test select',
                items: defaultItems,
                currentValue: 2,
            },
        })
        cy.get('[data-cy="dropdown-main-button"]').click()
        cy.get('[data-cy="dropdown-item-2"]').should('have.class', 'active')
    })
    it('triggers an event when an item is selected', () => {
        const onSelectItemSpy = cy.spy().as('onSelectItem')
        cy.mount(DropdownButton, {
            props: {
                title: 'Test select',
                items: defaultItems,
                currentValue: 1,
                onSelectItem: onSelectItemSpy,
            },
            listeners: { onSelectItem: onSelectItemSpy },
        })
        cy.get('[data-cy="dropdown-main-button"]').click()
        cy.get('[data-cy="dropdown-item-2"]').click()
        cy.get('@onSelectItem').should('be.calledOnce')
        cy.get('@onSelectItem').its('args.0.0').should('deep.equal', defaultItems[1])
    })
    it('does not grows out of the current screen/viewport', () => {
        cy.mount(DropdownButton, {
            props: {
                title: 'Test overflow',
                items: generateItems(20),
                currentValue: 10,
            },
        })
        cy.get('[data-cy="dropdown-main-button"]').click()
        cy.get('[data-cy="dropdown-container"]').should(($el) => {
            const rect = $el[0]?.getBoundingClientRect()
            // Assert that the dropdown is within the viewport boundaries
            expect(rect?.top).to.be.gte(0) // Doesn't overflow above
            expect(rect?.left).to.be.gte(0) // Doesn't overflow left
            expect(rect?.right).to.be.lte(Cypress.config('viewportWidth')) // Doesn't overflow right
            expect(rect?.bottom).to.be.lte(Cypress.config('viewportHeight')) // Doesn't overflow below
        })
    })
    it('can use a toggle button', () => {
        cy.mount(DropdownButton, {
            props: {
                title: 'Test toggle',
                items: defaultItems,
                currentValue: 1,
                withToggleButton: true,
            },
        })
        cy.get('[data-cy="dropdown-main-button"]').click()
        cy.get('[data-cy="dropdown-container"]').should('not.exist')
        cy.get('[data-cy="dropdown-toggle-button"]').click()
        cy.get('[data-cy="dropdown-container"]').should('be.visible')
    })
    it('can be disabled', () => {
        cy.mount(DropdownButton, {
            props: {
                title: 'Test disabled',
                items: defaultItems,
                currentValue: 1,
                disabled: true,
            },
        })
        cy.get('[data-cy="dropdown-main-button"]').should('be.disabled')
    })
})
