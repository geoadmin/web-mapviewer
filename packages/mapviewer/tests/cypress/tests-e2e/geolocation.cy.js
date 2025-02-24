/// <reference types="cypress" />

import { constants, registerProj4, WGS84 } from '@geoadmin/coordinates'
import proj4 from 'proj4'

import { getGeolocationButtonAndClickIt, testErrorMessage, checkStorePosition } from  '@/../tests/cypress/tests-e2e/utils'
import { DEFAULT_PROJECTION } from '@/config/map.config'

registerProj4(proj4)

const { GeolocationPositionError } = window

// PB-701: TODO Those tests below are not working as expected, as the cypress-browser-permissions is not
// working and the geolocation is always allowed, this needs to be reworked and probably need to
// use another plugin.

describe('Geolocation cypress', () => {
    context(
        'Test geolocation when first time activating it',
        {
            env: {
                browserPermissions: {
                    geolocation: 'ask',
                },
            },
        },
        () => {
            it('Prompt the user to authorize geolocation when the geolocation button is clicked for the first time', () => {
                cy.goToMapView()
                getGeolocationButtonAndClickIt()
                cy.on('window:alert', () => {
                    throw new Error(
                        'Should not raise an alert, but ask for permission through a prompt in the web browser GUI'
                    )
                })
                // TODO: find a way to check that the user has been prompted for permission (don't know if this is even remotely possible as it's in the browser GUI...)
            })
        }
    )

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
            it("Doesn't prompt the user if geolocation has previously been authorized", () => {
                cy.goToMapView({}, true)
                getGeolocationButtonAndClickIt()
                cy.on('window:alert', () => {
                    throw new Error('Should not prompt for geolocation API permission again')
                })
                cy.readStoreValue('state.geolocation.active').should('be.true')
            })

            it('Uses the values given by the Geolocation API to feed the store and position the map to the new position and zoom level', () => {
                const startingLatitude = 47
                const startingLongitude = 7.5
                const startingZoom = 12
                // same position but in EPSG:2056 (default projection of the app)
                const [x0, y0] = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                    startingLongitude,
                    startingLatitude,
                ])

                const geoLatitude = 47.5
                const geoLongitude = 6.8
                // same position but in EPSG:2056 (default projection of the app)
                const [geoX, geoY] = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                    geoLongitude,
                    geoLatitude,
                ])

                cy.goToMapView(
                    {
                        center: proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                            startingLongitude,
                            startingLatitude,
                        ]).join(','),
                        z: startingZoom,
                    },
                    true,
                    { latitude: geoLatitude, longitude: geoLongitude }
                )

                // check initial center and zoom
                checkStorePosition('state.position.center', x0, y0)
                cy.readStoreValue('state.position.zoom').then((zoom) => {
                    expect(zoom).to.eq(startingZoom)
                })

                getGeolocationButtonAndClickIt()
                checkStorePosition('state.geolocation.position', geoX, geoY)

                // check that the map has been centered on the geolocation and zoom is updated
                checkStorePosition('state.position.center', geoX, geoY)
                cy.readStoreValue('state.position.zoom').then((zoom) => {
                    expect(zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP)
                })


                // Check if the zoom is changed
                cy.get('[data-cy="zoom-in"]').click()
                cy.readStoreValue('state.position.zoom').then((zoom) => {
                    expect(zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP + 1)
                })
                checkStorePosition('state.position.center', geoX, geoY)

                cy.get('[data-cy="zoom-in"]').click()
                cy.get('[data-cy="zoom-in"]').click()
                cy.readStoreValue('state.position.zoom').then((zoom) => {
                    expect(zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP + 3)
                })

                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                cy.readStoreValue('state.position.zoom').then((zoom) => {
                    expect(zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP)
                })
                checkStorePosition('state.position.center', geoX, geoY)
            })
            it('access from outside Switzerland shows an error message', () => {
                // null island
                cy.goToMapView({}, true, { latitude: 0, longitude: 0 })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')

                // Java island
                cy.goToMapView({}, true, { latitude: -7.71, longitude: 110.37 })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')
            })
        }
    )

    context('Test geolocation when geolocation is failed to be retrieved', () => {
        it('shows an error telling the user geolocation is denied', () => {
            cy.goToMapView({}, true, { errorCode: GeolocationPositionError.PERMISSION_DENIED })
            getGeolocationButtonAndClickIt()
            testErrorMessage('geoloc_permission_denied')
        })

        it('shows an alert telling the user geolocation is not able to be retrieved due to time out', () => {
            cy.goToMapView({}, true, { errorCode: GeolocationPositionError.TIMEOUT })
            getGeolocationButtonAndClickIt()
            testErrorMessage('geoloc_time_out')
        })
        it('shows an alert telling the user geolocation is not available for other reason', () => {
            cy.goToMapView({}, true, { errorCode: GeolocationPositionError.POSITION_UNAVAILABLE })
            getGeolocationButtonAndClickIt()
            testErrorMessage('geoloc_unknown')
        })
    })
})
