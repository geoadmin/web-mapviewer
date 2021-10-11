/// <reference types="cypress" />

import { CoordinateSystems } from '../../../src/utils/coordinateUtils'

/** @param {CoordinateSystems} coordinateSystem */
function getMousePositionAndSelect(coordinateSystem) {
    cy.get('[data-cy="mouse-position-select"]').should('be.visible')
    cy.get('[data-cy="mouse-position-select"]').select(coordinateSystem.id)
}

function getMousePositionValue(x = 100, y = 100, coordStr = '671202, 6074296') {
    cy.get('[data-cy="map"]').click(x, y)
    // here we have to use a non data-cy selector as we have no control on this generated part
    // of the HTML by OpenLayers
    cy.get('[data-cy="mouse-position"] .mouse-position')
        .invoke('text')
        .then((text) => {
            expect(text).to.equal(coordStr)
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
        getMousePositionValue(100, 100, '2435419.18, 1297425.86')
    })
    it('switches to LV03 when this SRS is selected in the UI', () => {
        getMousePositionAndSelect(CoordinateSystems.LV03)
        getMousePositionValue(100, 100, '435419.18, 297425.86')
    })
    it('switches to MGRS when this SRS is selected in the UI', () => {
        getMousePositionAndSelect(CoordinateSystems.MGRS)
        getMousePositionValue(100, 100, '31TFN6781597235')
    })
    it('switches to WebMercator when this SRS is selected in the UI', () => {
        getMousePositionAndSelect(CoordinateSystems.WGS84)
        getMousePositionValue(100, 100, '47° 48′ 23.71″ N 5° 14′ 28.92″ E')
    })
    it('goes back to LV95 display if selected again', () => {
        // Change display projection without moving the mouse
        getMousePositionAndSelect(CoordinateSystems.MGRS)
        getMousePositionAndSelect(CoordinateSystems.LV95)
        getMousePositionValue(100, 100, '2435419.18, 1297425.86')
    })
})
