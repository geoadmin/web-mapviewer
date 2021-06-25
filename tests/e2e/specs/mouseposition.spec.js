/// <reference types="cypress" />

const mousePositionSelector = '[data-cy=mouse-position-select]'
const olSelector = '[data-cy=map]'
const olMousePosition = '[class=ol-mouse-position]'

function getMousePositionAndSelect(option) {
    cy.get(mousePositionSelector).should('be.visible')
    cy.get(mousePositionSelector).select(option)
    cy.get(mousePositionSelector).select(option).should('have.value', option)
}

function getMousePositionValue(x = 100, y = 100, coordStr = '671202, 6074296') {
    cy.get(olSelector).click(x, y)
    cy.get(olMousePosition)
        .invoke('text')
        .then((text) => {
            expect(text).equal(coordStr)
        })
}

describe('Test mouse position', () => {
    it('Changing displayed projection for mouse position', () => {
        const E = 2600000
        const N = 1200000
        const lv95zoom = 8
        cy.goToMapView('en', {
            E,
            N,
            z: lv95zoom,
        })
        // Change display projection without moving the mouse
        getMousePositionAndSelect('LV95')
        getMousePositionValue(100, 100, '2435419.18467, 1297425.85760')

        getMousePositionAndSelect('LV03')
        getMousePositionValue(100, 100, '435419.18, 297425.86')

        getMousePositionAndSelect('MGRS')
        getMousePositionValue(100, 100, '31TFN6781597235')

        getMousePositionAndSelect('WGS1984')
        getMousePositionValue(100, 100, '47° 48′ 23.71″ N 5° 14′ 28.92″ E')
    })
})
