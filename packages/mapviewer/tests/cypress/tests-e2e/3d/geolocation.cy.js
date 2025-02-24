/// <reference types="cypress" />

import { registerProj4, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import proj4 from 'proj4'

import { getGeolocationButtonAndClickIt, testErrorMessage, checkStorePosition } from  '@/../tests/cypress/tests-e2e/utils'

registerProj4(proj4)

describe('Geolocation on 3D cypress', () => {
    context(
        'Test geolocation when geolocation is authorized',
        {
            env: {
                browserPermissions: {
                    geolocation: 'allow',
                },
            },
        },
        () => {
            it('Uses the values given by the Geolocation API to feed the store and position the map to the new position', () => {
                const geoLatitude = 47.5
                const geoLongitude = 6.8
                // same position but in EPSG:3857
                const [geoX, geoY] = proj4(WGS84.epsg, WEBMERCATOR.epsg, [
                    geoLongitude,
                    geoLatitude,
                ])

                cy.goToMapView(
                    { '3d': true },
                    true,
                    { latitude: geoLatitude, longitude: geoLongitude }
                )

                // check that before the geolocation button is clicked, the map is not centered on the geolocation
                cy.readStoreValue('state.position.center').then((center) => {
                    expect(center).to.be.an('Array')
                    expect(center.length).to.eq(2)
                    expect(center[0]).to.not.approximately(geoX, 0.1)
                    expect(center[1]).to.not.approximately(geoY, 0.1)
                })

                getGeolocationButtonAndClickIt()
                checkStorePosition('state.geolocation.position', geoX, geoY)
                // check that the map has been centered on the geolocation
                checkStorePosition('state.position.center', geoX, geoY)

                const initialCameraHeight = 137649.54177875674
                // Camera height
                cy.readWindowValue('cesiumViewer').then((viewer) => {
                        expect(viewer.scene.camera.positionCartographic.height).to.approximately(
                            initialCameraHeight, 0.1
                        )
                })

                // Zoom in
                cy.get('[data-cy="zoom-in"]').click()
                // Camera height should be less than the iniital camera height
                cy.readWindowValue('cesiumViewer').then((viewer) => {
                    expect(viewer.scene.camera.positionCartographic.height).lt(
                        initialCameraHeight
                    )
                })
                // check that the map is still centered in the same position
                checkStorePosition('state.position.center', geoX, geoY)

                // Zoom out 3x
                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                // Camera height should be greater than the iniital camera height
                cy.readWindowValue('cesiumViewer').then((viewer) => {
                    expect(viewer.scene.camera.positionCartographic.height).gt(
                        initialCameraHeight
                    )
                })
                // check that the map is still centered in the same position
                checkStorePosition('state.position.center', geoX, geoY)
            })
            it('access from outside Switzerland shows an error message', () => {
                // null island
                cy.goToMapView({'3d': true,}, true, { latitude: 0, longitude: 0 })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')

                // Java island
                cy.goToMapView({'3d': true,}, true, { latitude: -7.71, longitude: 110.37 })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')
            })
        }
    )
})
