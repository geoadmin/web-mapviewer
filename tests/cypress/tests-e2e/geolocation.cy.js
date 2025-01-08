/// <reference types="cypress" />

import proj4 from 'proj4'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

const geolocationButtonSelector = '[data-cy="geolocation-button"]'

function getGeolocationButtonAndClickIt() {
    cy.get(geolocationButtonSelector).should('be.visible').click()
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

            it('Uses the values given by the Geolocation API to feed the store', () => {
                const latitude = 47.5
                const longitude = 6.8
                // same position but in EPSG:2056 (default projection of the app)
                const [x, y] = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [longitude, latitude])
                cy.goToMapView({}, true, { latitude, longitude })

                getGeolocationButtonAndClickIt()
                cy.readStoreValue('state.geolocation.position').then((position) => {
                    expect(position).to.be.an('Array')
                    expect(position.length).to.eq(2)
                    expect(position[0]).to.approximately(x, 0.1)
                    expect(position[1]).to.approximately(y, 0.1)
                })
            })
            it('access from outside Switzerland shows an error message', () => {
                // null island
                cy.goToMapView({}, true, { latitude: 0, longitude: 0 })

                getGeolocationButtonAndClickIt()

                // Check error in store
                cy.readStoreValue('state.ui.errors').then((errors) => {
                    expect(errors).to.be.an('Set')
                    expect(errors.size).to.eq(1)

                    const error = errors.values().next().value
                    expect(error.msg).to.eq('geoloc_out_of_bounds')
                })
                // Check error in UI
                cy.get('[data-cy="error-window"]').should('be.visible')
                cy.get('[data-cy="error-window-close"]').should('be.visible').click() // close the error window

                // Java island
                cy.goToMapView({}, true, { latitude: -7.71, longitude: 110.37 })

                getGeolocationButtonAndClickIt()

                // Check error in store
                cy.readStoreValue('state.ui.errors').then((errors) => {
                    expect(errors).to.be.an('Set')
                    expect(errors.size).to.eq(1)

                    const error = errors.values().next().value
                    expect(error.msg).to.eq('geoloc_out_of_bounds')
                })
                // Check error in UI
                cy.get('[data-cy="error-window"]').should('be.visible')
                cy.get('[data-cy="error-window-close"]').should('be.visible').click() // close the error window
            })
        }
    )

    context(
        'Test geolocation when geolocation is unauthorized',
        {
            env: {
                browserPermissions: {
                    geolocation: 'block',
                },
            },
        },
        () => {
            it('shows an alert telling the user geolocation is unauthorized when the geolocation button is clicked', () => {
                cy.goToMapView()
                getGeolocationButtonAndClickIt()
                cy.on('window:alert', (txt) => {
                    expect(txt).to.contains(
                        'The acquisition of the position failed because your browser settings does not allow it. Allow your browser /this website to use your location. Deactivate the "private" mode of your browser'
                    )
                })
            })
        }
    )
})
