import type Map from 'ol/Map'

import { normalizeAngle } from '@/store/modules/position/utils/normalizeAngle'

const compassButtonSelector: string = '[data-cy="compass-button"]'
const facingWest: number = 0.5 * Math.PI
const tolerance: number = 1e-9

function checkMapRotationAndButton(angle: number) {
    cy.getPiniaStore('position')
        .its('rotation').should('be.closeTo', angle, tolerance)
    cy.window()
        .its('map')
        .should((map: Map) => {
            expect(normalizeAngle(map.getView().getRotation())).to.be.closeTo(angle, tolerance)
        })
    if (angle) {
        cy.get(compassButtonSelector).should('be.visible')
    } else {
        cy.get(compassButtonSelector).should('not.exist')
    }
}

describe('Testing the buttons of the right toolbox', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    it('can go fullscreen with a button', () => {
        // Should not start the app in full screen
        cy.getPiniaStore('ui').its('fullscreenMode').should('be.false')

        cy.get('[data-cy="toolbox-fullscreen-button"]').click()
        cy.getPiniaStore('ui').its('fullscreenMode').should('be.true')

        // only the map and the fullscreen button should be visible
        cy.get('[data-cy="toolbox-right"]').within(($toolboxRight) => {
            expect($toolboxRight.children().length).to.eq(4)
        })
        cy.get('[data-cy="app-header"]').should('not.be.visible')
        cy.get('[data-cy="menu-tray"]').should('be.hidden')
        cy.get('[data-cy="app-footer"]').should('not.be.hidden')

        // exit the fullscreen mode by pressing escape
        cy.realPress('Escape')
        cy.getPiniaStore('ui').its('fullscreenMode').should('be.false')
        cy.get('[data-cy="app-header"]').should('be.visible')
    })
    it('shows a compass in the toolbox when map orientation is not pure north', () => {
        // Should not be visible on standard startup, as the map is facing north
        cy.getPiniaStore('position')
            .its('rotation').should('be.equal', 0)
        cy.get(compassButtonSelector).should('not.exist')

        cy.getPiniaStore('position').invoke('setRotation',
            facingWest + 2 * Math.PI,
            'e2e-test',
        )
        checkMapRotationAndButton(facingWest)

        // clicking on the button should put north up again, and the button should disappear
        cy.get(compassButtonSelector).click()
        checkMapRotationAndButton(0)
    })
})
