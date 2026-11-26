/// <reference types="cypress" />

export function moveTimeSlider(x) {
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousedown', { button: 0 })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousemove', {
        screenX: Math.abs(x),
        screenY: 0,
    })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mouseup', { force: true })
}

export function getGeolocationButtonAndClickIt() {
    const geolocationButtonSelector = '[data-cy="geolocation-button"]'
    cy.get(geolocationButtonSelector).should('be.visible').click()
}

export function testErrorMessage(message, shouldErrorMessageBeShown = true) {
    const geolocationButtonSelector = '[data-cy="geolocation-button"]'
    // move the mouse away from the button because the tooltip covers the
    // error message
    cy.get(geolocationButtonSelector).trigger('mousemove', { clientX: 0, clientY: 0, force: true }) // Check error in store

    // Check error in store
    cy.readStoreValue('state.ui.errors').then((errors) => {
        expect(errors).to.be.an('Set')
        // Make sure this is the only error (we don't want to test other errors)
        expect(errors.size).to.eq(1)

        const error = errors.values().next().value
        expect(error.msg).to.eq(message)
        // When we are checking an acknowledged error, it should not appear in the UI (and won't be added to the set)
        expect(error.isAcknowledged).to.eq(!shouldErrorMessageBeShown)
    })
    // Check error in UI
    if (shouldErrorMessageBeShown) {
        cy.get('[data-cy="error-window"]').should('be.visible')
        cy.get('[data-cy="error-window-close"]').should('be.visible').click() // close the error window
    }
}

export function checkStorePosition(storeString, x, y) {
    cy.readStoreValue(storeString).then((center) => {
        expect(center).to.be.an('Array')
        expect(center.length).to.eq(2)
        expect(center[0]).to.approximately(x, 0.1)
        expect(center[1]).to.approximately(y, 0.1)
    })
}
