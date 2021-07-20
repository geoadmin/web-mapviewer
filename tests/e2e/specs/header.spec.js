/// <reference types="cypress" />

const overlaySelector = '[data-cy="overlay"]'
const menuButtonSelector = '[data-cy="menu-button"]'
const menuSettingsContentSelector = '[data-cy="menu-settings-content"]'
const menuSettingsSectionSelector = '[data-cy="menu-settings-section"]'
const visibleLayerIds = ['test.wms.layer', 'test.wmts.layer', 'test.timeenabled.wmts.layer']

describe('Test functions for the header / search bar', () => {
    beforeEach(() => {
        cy.goToMapView('en', {
            layers: visibleLayerIds.join(';'),
        })
    })
    const openLayerSettings = (layerId) => {
        cy.get(`[data-cy="button-open-visible-layer-settings-${layerId}"]`)
            .should('be.visible')
            .click()
    }
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

    context('Order in Menu sections', () => {
        it('Disable the "Raise Order" arrow on the top layer', () => {
            const layerId = visibleLayerIds[0]
            cy.get(menuButtonSelector).click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            openLayerSettings(layerId)
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.disabled')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('not.be.disabled')
        })
        it('Disable the "Lower Order" arrow on the bottom layer', () => {
            const layerId = visibleLayerIds[2]
            cy.get(menuButtonSelector).click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            openLayerSettings(layerId)
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('not.be.disabled')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.disabled')
        })
        it('enables both button for any other layer', () => {
            const layerId = visibleLayerIds[1]
            cy.get(menuButtonSelector).click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            openLayerSettings(layerId)
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('not.be.disabled')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('not.be.disabled')
        })
        it('disable the "raise order" arrow on a layer which gets to the top layer', () => {
            const layerId = visibleLayerIds[1]
            cy.get(menuButtonSelector).click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            openLayerSettings(layerId)
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible').click
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.disabled')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('not.be.disabled')
        })
        it('disable the "lower order" arrow on a layer which gets to the bottom layer', () => {
            const layerId = visibleLayerIds[1]
            cy.get(menuButtonSelector).click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            openLayerSettings(layerId)
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible').click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('not.be.disabled')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.disabled')
        })
        it('enable the "lower order" arrow on a layer which is raised from the bottom', () => {
            const layerId = visibleLayerIds[2]
            cy.get(menuButtonSelector).click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            openLayerSettings(layerId)
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible').click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('not.be.disabled')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('not.be.disabled')
        })
        it('enable the "raise order" arrow on a layer which is lowered from the top', () => {
            const layerId = visibleLayerIds[0]
            cy.get(menuButtonSelector).click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            openLayerSettings(layerId)
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible').click
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('be.visible')
            cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).should('not.be.disabled')
            cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).should('not.be.disabled')
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
