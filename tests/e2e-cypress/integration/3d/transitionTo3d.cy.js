/// <reference types="cypress" />

import { Math as CesiumMath } from 'cesium'

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
                cy.goToMapView({
                    '3d': true,
                })
                cy.readStoreValue('state.ui.showIn3d').should('be.true')
            })
        })
        context('camera position in URL', () => {
            it('parses the camera URL param correctly at app startup', () => {
                const expectedCameraPosition = {
                    x: 47.2,
                    y: 8.1,
                    z: 1000,
                    heading: 23,
                    pitch: 45,
                    roll: 12,
                }
                cy.goToMapView({
                    '3d': true,
                    camera: [
                        expectedCameraPosition.x,
                        expectedCameraPosition.y,
                        expectedCameraPosition.z,
                        expectedCameraPosition.pitch,
                        expectedCameraPosition.heading,
                        expectedCameraPosition.roll,
                    ].join(','),
                })
                cy.readStoreValue('state.position.camera').then((camera) => {
                    expect(camera).to.be.an('Object')
                    expect(camera).to.haveOwnProperty('x')
                    expect(camera).to.haveOwnProperty('y')
                    expect(camera).to.haveOwnProperty('z')
                    expect(camera).to.haveOwnProperty('pitch')
                    expect(camera).to.haveOwnProperty('heading')
                    expect(camera).to.haveOwnProperty('roll')
                    expect(camera.x).to.eq(expectedCameraPosition.x)
                    expect(camera.y).to.eq(expectedCameraPosition.y)
                    expect(camera.z).to.eq(expectedCameraPosition.z)
                    expect(camera.pitch).to.eq(expectedCameraPosition.pitch)
                    expect(camera.heading).to.eq(expectedCameraPosition.heading)
                    expect(camera.roll).to.eq(expectedCameraPosition.roll)
                })
            })
        })
    })
    context('transition to 3D', () => {
        it('loads the base layer specific for 3D', () => {
            cy.goToMapView()
            // fixtures/256.jpeg will be fetched
            cy.intercept('**/ch.swisstopo.swisstlm3d-karte-farbe.3d/**').as('baseLayer')
            cy.get('[data-cy="3d-button"]').click()
            cy.get('[data-cy="cesium-map"]').should('be.visible')
            cy.get('[data-cy="ol-map"]').should('not.exist')
            cy.wait('@baseLayer', { timeout: 30000 }).its('response.statusCode').should('eq', 200)
        })
        it('translates 2D position correctly', () => {
            const lat = 46
            const lon = 7
            cy.goToMapView({
                lat,
                lon,
                z: 9,
            })
            cy.get('[data-cy="3d-button"]').click()
            cy.readWindowValue('cesiumViewer').then((viewer) => {
                const cameraPosition = viewer.camera.positionCartographic
                const acceptableDelta = 0.000001
                expect(cameraPosition.longitude).to.be.closeTo(
                    CesiumMath.toRadians(lon),
                    acceptableDelta
                )
                expect(cameraPosition.latitude).to.be.closeTo(
                    CesiumMath.toRadians(lat),
                    acceptableDelta
                )
                // TODO: test zoom to height as soon as the conversion is implemented
            })
        })
    })
})
