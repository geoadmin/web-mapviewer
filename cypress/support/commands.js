// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Adds a command that visit the main view and wait for the map to be shown (for the app to be ready)
Cypress.Commands.add('goToMapView', () => {
    cy.visit('/')
    // we leave some room for the CI to catch the DOM element (can be a bit slow depending on the CPU power of CI's VM)
    cy.get('[data-cy="map"]', { timeout: 10000 }).should('be.visible');
})
