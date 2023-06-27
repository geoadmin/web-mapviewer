/// <reference types="cypress" />

describe('Testing transitioning between 2D and 3D', () => {
    context('3D toggle button', () => {
        beforeEach(() => {
            cy.goToMapView()
        })
        it('activates 3D when we click on the 3D toggle button', () => {
            cy.readStoreValue('state.ui.showIn3d').should('be.false')
            cy.get('[data-cy="3d-button"]').should('be.visible').click()
            cy.readStoreValue('state.ui.showIn3d').should('be.true')
        })
        it('deactivate 3D when clicking twice on the button', () => {
            cy.readStoreValue('state.ui.showIn3d').should('be.false')
            cy.get('[data-cy="3d-button"]').should('be.visible').click()
            cy.get('[data-cy="3d-button"]').should('be.visible').click()
            cy.readStoreValue('state.ui.showIn3d').should('be.false')
        })
        it('shows the users that 3D is active by changing its color', () => {
            cy.get('[data-cy="3d-button"]').should('not.have.class', 'active')
            cy.get('[data-cy="3d-button"]').click()
            cy.get('[data-cy="3d-button"]').should('have.class', 'active')
        })
    })
    context('URL params related to 3D', () => {
        context('3d flag param', () => {
            it("doesn't add to the URL the 3d param by default (when its value is false)", () => {
                cy.goToMapView()
                cy.location().should((location) => {
                    expect(location.hash).to.not.contain('3d')
                })
            })
            it('adds the 3D URL param to the URL when it is activated', () => {
                cy.goToMapView()
                cy.get('[data-cy="3d-button"]').click()
                cy.location().should((location) => {
                    expect(location.hash).to.contain('3d')
                })
            })
            it('correctly parses the 3D param at startup if present', () => {
                cy.goToMapView('en', {
                    '3d': true,
                })
                cy.readStoreValue('state.ui.showIn3d').should('be.true')
            })
        })
    })
    context('3D load', () => {
        it('base layer load', () => {
            cy.goToMapView()
            // fixtures/256.jpeg will be fetched
            cy.intercept('**/ch.swisstopo.swisstlm3d-karte-farbe.3d/**').as('baseLayer')
            cy.get('[data-cy="3d-button"]').click()
            cy.get('[data-cy="cesium"]').should('be.visible')
            cy.get('[data-cy="ol-map"]').should('not.exist')
            cy.wait('@baseLayer').its('response.statusCode').should('eq', 200)
        })
        it('load with correct position', () => {
            cy.goToMapView('en', {
                lat: 46.980721,
                lon: 7.532844,
                z: 9.666,
            })
            cy.get('[data-cy="3d-button"]').click()
            cy.readWindowValue('cesiumViewer').then((viewer) => {
                const cameraPosition = viewer.camera.positionCartographic
                expect(cameraPosition.longitude).to.eq(0.13147292983909972)
                expect(cameraPosition.latitude).to.eq(0.819968266410843)
                expect(cameraPosition.height).to.eq(36434.03514736528)
            })
        })
    })
})
