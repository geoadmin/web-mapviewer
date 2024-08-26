import { normalizeAngle } from '@/store/modules/position.store'

const compassButtonSelector = '[data-cy="compass-button"]'
const facingWest = 0.5 * Math.PI
const tolerance = 1e-9

function checkMapRotationAndButton(angle) {
    cy.readStoreValue('state.position.rotation').should('be.closeTo', angle, tolerance)
    cy.readWindowValue('map').should((map) => {
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
        cy.readStoreValue('state.ui.fullscreenMode').should('be.false')

        cy.get('[data-cy="toolbox-fullscreen-button"]').click()
        cy.readStoreValue('state.ui.fullscreenMode').should('be.true')

        // only the map and the fullscreen button should be visible
        cy.get('[data-cy="toolbox-right"]').within(($toolboxRight) => {
            expect($toolboxRight.children().length).to.eq(4)
        })
        cy.get('[data-cy="app-header"]').should('not.be.visible')
        cy.get('[data-cy="menu-tray"]').should('be.hidden')
        cy.get('[data-cy="app-footer"]').should('be.hidden')
    })
    it('shows a compass in the toolbox when map orientation is not pure north', () => {
        // Should not be visible on standard startup, as the map is facing north
        cy.readStoreValue('state.position.rotation').should('be.equal', 0)
        cy.get(compassButtonSelector).should('not.exist')

        cy.writeStoreValue('setRotation', facingWest + 2 * Math.PI)
        checkMapRotationAndButton(facingWest)

        // clicking on the button should but north up again, and the button should disapaer
        cy.get(compassButtonSelector).click()
        checkMapRotationAndButton(0)
    })
})
