/// <reference types="cypress" />

import { registerProj4, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import proj4 from 'proj4'

registerProj4(proj4)

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
                cy.goToMapView(
                    {'3d': true,}
                )
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
                cy.goToMapView({'3d': true,}, true)
                getGeolocationButtonAndClickIt()
                cy.on('window:alert', () => {
                    throw new Error('Should not prompt for geolocation API permission again')
                })
                cy.readStoreValue('state.geolocation.active').should('be.true')
            })

            // Skipped because failed in cypress
            it.skip('Uses the values given by the Geolocation API to feed the store and position the map to the new position', () => {
                const geoLatitude = 47.5
                const geoLongitude = 6.8
                // same position but in EPSG:3857
                const [geoX, geoY] = proj4(WGS84.epsg, WEBMERCATOR.epsg, [
                    geoLongitude,
                    geoLatitude,
                ])

                cy.goToMapView(
                    {
                        '3d': true,
                    },
                    true,
                    { latitude: geoLatitude, longitude: geoLongitude }
                )

                getGeolocationButtonAndClickIt()
                cy.readStoreValue('state.geolocation.position').then((position) => {
                    cy.log('position', position)
                    expect(position).to.be.an('Array')
                    expect(position.length).to.eq(2)
                    expect(position[1]).to.approximately(geoY, 0.1)
                    expect(position[0]).to.approximately(geoX, 0.1)
                })
                // check that the map has been centered on the geolocation and zoom is updated
                cy.readStoreValue('state.position.center').then((center) => {
                    expect(center).to.be.an('Array')
                    expect(center.length).to.eq(2)
                    expect(center[0]).to.approximately(geoX, 0.1)
                    expect(center[1]).to.approximately(geoY, 0.1)
                })
            })
            // Skipped because failed in cypress
            it.skip('access from outside Switzerland shows an error message', () => {
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

    context('Test geolocation when geolocation is failed to be retrieved', () => {
        it('shows an error telling the user geolocation is denied', () => {
            cy.goToMapView({'3d': true,}, true, { errorCode: GeolocationPositionError.PERMISSION_DENIED })
            getGeolocationButtonAndClickIt()
            testErrorMessage('geoloc_permission_denied')
        })

        it('shows an alert telling the user geolocation is not able to be retrieved due to time out', () => {
            cy.goToMapView({'3d': true,}, true, { errorCode: GeolocationPositionError.TIMEOUT })
            getGeolocationButtonAndClickIt()
            testErrorMessage('geoloc_time_out')
        })
        it('shows an alert telling the user geolocation is not available for other reason', () => {
            cy.goToMapView({'3d': true,}, true, { errorCode: GeolocationPositionError.POSITION_UNAVAILABLE })
            getGeolocationButtonAndClickIt()
            testErrorMessage('geoloc_unknown')
        })
    })
})
