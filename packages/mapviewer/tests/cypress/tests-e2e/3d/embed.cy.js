/// <reference types="cypress" />

describe('Testing the 3D button in embed view', () => {
    it('shows the 3D button in normal embed mode', () => {
        cy.goToEmbedView({
            queryParams: { z: 2 },
        })
        cy.get('[data-cy="3d-button"]').should('be.visible')
    })

    it('shows the 3D button in legacy embed mode', () => {
        cy.goToEmbedView({ legacy: true, queryParams: { zoom: 2 } })
        cy.get('[data-cy="3d-button"]').should('be.visible')
    })

    it('hides the 3D button in embed mode when hideEmbedUI is true', () => {
        cy.goToEmbedView({
            queryParams: { z: 2, hideEmbedUI: true },
        })
        cy.get('[data-cy="3d-button"]').should('not.exist')
    })
})
