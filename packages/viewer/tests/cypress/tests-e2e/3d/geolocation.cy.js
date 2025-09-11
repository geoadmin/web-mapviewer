/// <reference types="cypress" />

import { registerProj4, WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import {
    getGeolocationButtonAndClickIt,
    testErrorMessage,
    checkStorePosition,
} from '@/../tests/cypress/tests-e2e/utils'

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

                cy.goToMapView({
                    queryParams: { '3d': true },
                    withHash: true,
                    geolocationMockupOptions: {
                        latitude: geoLatitude,
                        longitude: geoLongitude,
                    },
                })
                cy.waitUntilCesiumTilesLoaded()

                // check that before the geolocation button is clicked, the map is not centered on the geolocation
                cy.readStoreValue('state.position.center').then((center) => {
                    expect(center).to.be.an('Array')
                    expect(center.length).to.eq(2)
                    expect(center[0]).to.not.approximately(geoX, 0.1)
                    expect(center[1]).to.not.approximately(geoY, 0.1)
                })

                // Camera position before geolocation
                cy.readStoreValue('state.position.camera').then((camera) => {
                    expect(camera).to.be.an('Object')
                    expect(camera.x).to.not.eq(geoLongitude)
                    expect(camera.y).to.not.eq(geoLatitude)
                    expect(Number(camera.z)).not.to.approximately(631.85, 0.1)

                    expect(camera.heading).to.eq(0)
                    expect(camera.pitch).to.eq(-90)
                    expect(camera.roll).to.eq(0)
                })

                getGeolocationButtonAndClickIt()
                // check that the geolocation has been set in the store
                checkStorePosition('state.geolocation.position', geoX, geoY)
                // check that the map has been centered on the geolocation
                checkStorePosition('state.position.center', geoX, geoY)
                // Camera position after geolocation
                cy.readStoreValue('state.position.camera').then((camera) => {
                    expect(camera).to.be.an('Object')
                    expect(camera.x).to.eq(geoLongitude)
                    expect(camera.y).to.eq(geoLatitude)
                    expect(Number(camera.z)).to.approximately(631.85, 0.1)

                    expect(camera.heading).to.eq(0)
                    expect(camera.pitch).to.eq(-90)
                    expect(camera.roll).to.eq(0)
                })
            })
            // The test is too fragile in CI (sometimes pass, sometimes not) due to rendered crassh
            it.skip('access from outside Switzerland shows an error message', () => {
                // null island
                cy.goToMapView({
                    queryParams: { '3d': true },
                    withHash: true,
                    geolocationMockupOptions: {
                        latitude: 0,
                        longitude: 0,
                    },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')

                // Java island
                cy.goToMapView({
                    queryParams: { '3d': true },
                    withHash: true,
                    geolocationMockupOptions: {
                        latitude: -7.71,
                        longitude: 110.37,
                    },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')
            })
        }
    )
})
