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
    beforeEach(() => {
        cy.goToMapView('en', {
            E: 2600000,
            N: 1200000,
            z: 8,
        })
    })
    it('Shows LV95 coordinates by default', () => {
        getMousePositionValue(100, 100, '2435419.18467, 1297425.85760')
    })
    it('switches to LV03 when this SRS is selected in the UI', () => {
        getMousePositionAndSelect('LV03')
        getMousePositionValue(100, 100, '435419.18, 297425.86')
    })
    it('switches to MGRS when this SRS is selected in the UI', () => {
        getMousePositionAndSelect('MGRS')
        getMousePositionValue(100, 100, '31TFN6781597235')
    })
    it('switches to WebMercator when this SRS is selected in the UI', () => {
        getMousePositionAndSelect('WGS1984')
        getMousePositionValue(100, 100, '47° 48′ 23.71″ N 5° 14′ 28.92″ E')
    })
    it('goes back to LV95 display if selected again', () => {
        // Change display projection without moving the mouse
        getMousePositionAndSelect('MGRS')
        getMousePositionAndSelect('LV95')
        getMousePositionValue(100, 100, '2435419.18467, 1297425.85760')
    })
})
