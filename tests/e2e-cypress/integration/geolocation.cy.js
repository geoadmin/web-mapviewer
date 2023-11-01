/// <reference types="cypress" />

import { DEFAULT_PROJECTION } from '@/config'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import proj4 from 'proj4'

const geolocationButtonSelector = '[data-cy="geolocation-button"]'

function getGeolocationButtonAndClickIt() {
    cy.get(geolocationButtonSelector).should('be.visible').click()
}

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
            // lon/lat to mock up the Geolocation API (see beforeEach)
            const latitude = 47.5
            const longitude = 6.8
            // same position but in EPSG:2056 (default projection of the app)
            const [x, y] = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [longitude, latitude])

            beforeEach(() => {
                cy.goToMapView({}, false, { latitude, longitude })
                getGeolocationButtonAndClickIt()
            })

            it("Doesn't prompt the user if geolocation has previously been authorized", () => {
                cy.on('window:alert', () => {
                    throw new Error('Should not prompt for geolocation API permission again')
                })
                cy.readStoreValue('state.geolocation.active').should('be.true')
            })

            it('Uses the values given by the Geolocation API to feed the store', () => {
                cy.readStoreValue('state.geolocation.position').then((position) => {
                    expect(position).to.be.an('Array')
                    expect(position.length).to.eq(2)
                    expect(position[0]).to.approximately(x, 0.1)
                    expect(position[1]).to.approximately(y, 0.1)
                })
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
