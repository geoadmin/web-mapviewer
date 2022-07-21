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
    context('Checking the compass button', () => {
        it('Should not be visible on standard startup, as map is facing north', () => {
            cy.readStoreValue('state.position.rotation').should('be.equal', 0)
            cy.get(compassButtonSelector).should('not.exist')
        })
        it('Should appear if app is not facing north', () => {
            cy.writeStoreValue('setRotation', facingWest + 2 * Math.PI)
            checkMapRotationAndButton(facingWest)
        })
        it('clicking on the button should northen the map', () => {
            cy.writeStoreValue('setRotation', facingWest)
            checkMapRotationAndButton(facingWest)
            cy.get(compassButtonSelector).click()
            checkMapRotationAndButton(0)
        })
    })
})
