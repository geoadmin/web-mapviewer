/// <reference types="cypress" />

const overlaySelector = '[data-cy="overlay"]'
const menuButtonSelector = '[data-cy="menu-button"]'
const menuSettingsContentSelector = '[data-cy="menu-settings-content"]'
const menuSettingsSectionSelector = '[data-cy="menu-settings-section"]'

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

    context('Menu basic functionalities', () => {
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

    context('Settings Menu Section', () => {
        it('does not show the settings sections on opening the menu', () => {
            cy.get(menuButtonSelector).click()
            cy.get(menuSettingsContentSelector).should('be.hidden')
        })

        it('shows the settings on clicking on the settings section', () => {
            cy.get(menuButtonSelector).click()
            cy.get(menuSettingsSectionSelector).click()
            cy.get(menuSettingsContentSelector).should('be.visible')
        })

        it('hides the settings section if clicked again', () => {
            cy.get(menuButtonSelector).click()
            cy.get(menuSettingsSectionSelector).click().click()
            cy.get(menuSettingsContentSelector).should('be.hidden')
        })
    })
})
