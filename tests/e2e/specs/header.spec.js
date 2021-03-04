/// <reference types="cypress" />

const overlaySelector = '[data-cy="overlay"]'
const menuButtonSelector = '[data-cy="menu-button"]'

describe('Test functions for the header / search bar', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    const checkStoreOverlayValue = (value) => {
        cy.readStoreValue('state.overlay.show').should('eq', value)
    }
    const checkMenuTrayValue = (value) => {
        cy.readStoreValue('state.ui.showMenuTray').should('eq', value)
    }
    it("doesn't show the menu and overlay at app startup", () => {
        checkStoreOverlayValue(false)
        checkMenuTrayValue(false)
    })

    it('shows the menu and the overlay when the menu button is pressed', () => {
        cy.get(menuButtonSelector).click()
        checkStoreOverlayValue(true)
        checkMenuTrayValue(true)
    })

    it('hides the menu and the overlay if the menu button is clicked again', () => {
        cy.get(menuButtonSelector).click().click()
        checkStoreOverlayValue(false)
        checkMenuTrayValue(false)
    })

    it('hides the menu and the overlay when the overlay is clicked', () => {
        cy.get(menuButtonSelector).click()
        cy.get(overlaySelector).click()
        checkStoreOverlayValue(false)
        checkMenuTrayValue(false)
    })
})
