/// <reference types="cypress" />

import proj4 from 'proj4'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import { SWISS_ZOOM_LEVEL_1_25000_MAP } from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
const { GeolocationPositionError } = window

const geolocationButtonSelector = '[data-cy="geolocation-button"]'

function getGeolocationButtonAndClickIt() {
    cy.get(geolocationButtonSelector).should('be.visible').click()
}

function testErrorMessage(message) {
    // Check error in store
    cy.readStoreValue('state.ui.errors').then((errors) => {
        expect(errors).to.be.an('Set')
        expect(errors.size).to.eq(1)

        const error = errors.values().next().value
        expect(error.msg).to.eq(message)
    })
    // Check error in UI
    cy.get('[data-cy="error-window"]').should('be.visible')
    cy.get('[data-cy="error-window-close"]').should('be.visible').click() // close the error window
}

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
                cy.readStoreValue('state.position.center').then((center) => {
                    expect(center).to.be.an('Array')
                    expect(center.length).to.eq(2)
                    expect(center[0]).to.approximately(x0, 0.1)
                    expect(center[1]).to.approximately(y0, 0.1)
                })
                cy.readStoreValue('state.position.zoom').then((zoom) => {
                    expect(zoom).to.eq(startingZoom)
                })

                getGeolocationButtonAndClickIt()
                cy.readStoreValue('state.geolocation.position').then((position) => {
                    expect(position).to.be.an('Array')
                    expect(position.length).to.eq(2)
                    expect(position[0]).to.approximately(geoX, 0.1)
                    expect(position[1]).to.approximately(geoY, 0.1)
                })
                // check that the map has been centered on the geolocation and zoom is updated
                cy.readStoreValue('state.position.center').then((center) => {
                    expect(center).to.be.an('Array')
                    expect(center.length).to.eq(2)
                    expect(center[0]).to.approximately(geoX, 0.1)
                    expect(center[1]).to.approximately(geoY, 0.1)
                })
                cy.readStoreValue('state.position.zoom').then((zoom) => {
                    expect(zoom).to.eq(SWISS_ZOOM_LEVEL_1_25000_MAP)
                })
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
