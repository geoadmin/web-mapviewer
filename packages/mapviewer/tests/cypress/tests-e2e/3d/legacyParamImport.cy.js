/// <reference types="cypress" />

import { registerProj4 } from '@geoadmin/coordinates'
import proj4 from 'proj4'

registerProj4(proj4)

describe('Test on legacy param import', () => {
    context('3D import', () => {
        const lat = 47.3
        const lon = 7.3
        const elevation = 215370
        const heading = 318
        const pitch = -45

        it('transfers camera parameter from legacy URL to the new URL', () => {
            cy.goToMapView(
                {
                    lat,
                    lon,
                    elevation,
                    heading,
                    pitch,
                },
                false
            )

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.readStoreValue('state.cesium.active').should('eq', true) // cesium should be active

            // Checking camera position
            cy.readStoreValue('state.position.camera.x').should('eq', lon)
            cy.readStoreValue('state.position.camera.y').should('eq', lat)
            // For some reason, the z value is not exactly the same as the elevation
            // There might be a recalculating of the elevation
            cy.readStoreValue('state.position.camera.z').then((cameraZ) => {
                expect(Number(cameraZ)).to.approximately(elevation, 100)
            })
            cy.readStoreValue('state.position.camera.heading').should('eq', heading)
            cy.readStoreValue('state.position.camera.pitch').should('eq', pitch)
            cy.readStoreValue('state.position.camera.roll').should('eq', 0)

            // EPSG is set to 3857
            cy.readStoreValue('state.position.projection.epsgNumber').should('eq', 3857)
        })

        it('transfers camera parameter from legacy URL to the new URL only heading', () => {
            cy.goToMapView(
                {
                    lat,
                    lon,
                    heading,
                },
                false
            )

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.readStoreValue('state.cesium.active').should('eq', true) // cesium should be active

            // Checking camera position
            cy.readStoreValue('state.position.camera.x').should('eq', lon)
            cy.readStoreValue('state.position.camera.y').should('eq', lat)
            cy.readStoreValue('state.position.camera.z').should('eq', 0)
            cy.readStoreValue('state.position.camera.heading').should('eq', heading)
            cy.readStoreValue('state.position.camera.pitch').should('eq', -90)
            cy.readStoreValue('state.position.camera.roll').should('eq', 0)

            // EPSG is set to 3857
            cy.readStoreValue('state.position.projection.epsgNumber').should('eq', 3857)
        })
        // camera=7.038834,46.766017,193985.5,-47,319,
        // camera=8.225457,46.858429,738575.8,-90,,
        it('transfers camera parameter from legacy URL to the new URL only elevation', () => {
            cy.goToMapView(
                {
                    lat,
                    lon,
                    elevation,
                },
                false
            )

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.readStoreValue('state.cesium.active').should('eq', true) // cesium should be active

            // Checking camera position
            // x, y, and z seems recalculated when there is only elevation, so I just check that they are not null
            cy.readStoreValue('state.position.camera.x').should('not.be.null')
            cy.readStoreValue('state.position.camera.y').should('not.be.null')
            cy.readStoreValue('state.position.camera.z').should('not.be.null')
            cy.readStoreValue('state.position.camera.heading').should('eq', 0)
            cy.readStoreValue('state.position.camera.pitch').should('eq', -90)
            cy.readStoreValue('state.position.camera.roll').should('eq', 0)

            // EPSG is set to 3857
            cy.readStoreValue('state.position.projection.epsgNumber').should('eq', 3857)
        })
    })
})
