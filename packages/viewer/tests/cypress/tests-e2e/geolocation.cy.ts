/// <reference types="cypress" />

import { constants, registerProj4, WGS84, type SingleCoordinate } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import {
    getGeolocationButtonAndClickIt,
    testErrorMessage,
    checkStorePosition,
} from '@/../tests/cypress/tests-e2e/utils'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import useGeolocationStore from '@/store/modules/geolocation'
import usePositionStore from '@/store/modules/position'

registerProj4(proj4)

const { GeolocationPositionError } = window

interface TestCase {
    description: string
    is3D: boolean
}

const testCases: TestCase[] = [
    { description: 'on 2D Map', is3D: false },
    { description: 'on 3D Map', is3D: true },
]

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
            testCases.forEach(({ description, is3D }: TestCase) => {
                it(`Prompt the user to authorize geolocation when the geolocation button is clicked for the first time ${description}`, () => {
                    cy.goToMapView({ queryParams: { '3d': is3D } })
                    getGeolocationButtonAndClickIt()
                    cy.on('window:alert', () => {
                        throw new Error(
                            'Should not raise an alert, but ask for permission through a prompt in the web browser GUI'
                        )
                    })
                    // TODO: find a way to check that the user has been prompted for permission (don't know if this is even remotely possible as it's in the browser GUI...)
                })
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
            testCases.forEach(({ description, is3D }: TestCase) => {
                it(`Doesn't prompt the user if geolocation has previously been authorized ${description}`, () => {
                    cy.goToMapView({ queryParams: { '3d': is3D }, withHash: true })
                    getGeolocationButtonAndClickIt()
                    cy.on('window:alert', () => {
                        throw new Error('Should not prompt for geolocation API permission again')
                    })
                    const geolocationStore = useGeolocationStore()
                    expect(geolocationStore.active).to.be.true
                })
            })

            it('Uses the values given by the Geolocation API to feed the store and position the map to the new position and zoom level', () => {
                const startingLatitude: number = 47
                const startingLongitude: number = 7.5
                const startingZoom: number = 12
                // same position but in EPSG:2056 (default projection of the app)
                const [x0, y0]: SingleCoordinate = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                    startingLongitude,
                    startingLatitude,
                ])

                const geoLatitude: number = 47.5
                const geoLongitude: number = 6.8
                // same position but in EPSG:2056 (default projection of the app)
                const [geoX, geoY]: SingleCoordinate = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                    geoLongitude,
                    geoLatitude,
                ])

                cy.goToMapView({
                    queryParams: {
                        center: proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                            startingLongitude,
                            startingLatitude,
                        ]).join(','),
                        z: startingZoom,
                    },
                    withHash: true,
                    geolocationMockupOptions: { latitude: geoLatitude, longitude: geoLongitude },
                })

                // check initial center and zoom
                checkStorePosition('state.position.center', x0, y0)
                const positionStore = usePositionStore()
                expect(positionStore.zoom).to.eq(startingZoom)

                getGeolocationButtonAndClickIt()
                checkStorePosition('state.geolocation.position', geoX, geoY)

                // check that the map has been centered on the geolocation and zoom is updated
                checkStorePosition('state.position.center', geoX, geoY)
                const positionStore2 = usePositionStore()
                expect(positionStore2.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP)

                // Check if the zoom is changed
                cy.get('[data-cy="zoom-in"]').click()
                const positionStore3 = usePositionStore()
                expect(positionStore3.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP + 1)
                checkStorePosition('state.position.center', geoX, geoY)

                cy.get('[data-cy="zoom-in"]').click()
                cy.get('[data-cy="zoom-in"]').click()
                const positionStore4 = usePositionStore()
                expect(positionStore4.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP + 3)

                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                const positionStore5 = usePositionStore()
                expect(positionStore5.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP)
                checkStorePosition('state.position.center', geoX, geoY)
            })
            it('access from outside Switzerland shows an error message', () => {
                // undefined island
                cy.goToMapView({
                    withHash: true,
                    geolocationMockupOptions: { latitude: 0, longitude: 0 },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')

                // Java island
                cy.goToMapView({
                    withHash: true,
                    geolocationMockupOptions: { latitude: -7.71, longitude: 110.37 },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')
            })
        }
    )

    context('Test geolocation when geolocation is failed to be retrieved', () => {
        testCases.forEach(({ description, is3D }: TestCase) => {
            it(`shows an error telling the user geolocation is denied ${description}`, () => {
                cy.goToMapView({
                    queryParams: { '3d': is3D },
                    withHash: true,
                    geolocationMockupOptions: {
                        errorCode: GeolocationPositionError.PERMISSION_DENIED,
                        latitude: 0,
                        longitude: 0,
                    },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_permission_denied')
            })

            it(`shows an alert telling the user geolocation is not able to be retrieved due to time out ${description}`, () => {
                cy.goToMapView({
                    queryParams: { '3d': is3D },
                    withHash: true,
                    geolocationMockupOptions: {
                        errorCode: GeolocationPositionError.TIMEOUT,
                        latitude: 0,
                        longitude: 0,
                    },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_time_out')
            })
            it(`shows an alert telling the user geolocation is not available for other reason ${description}`, () => {
                cy.goToMapView({
                    queryParams: { '3d': is3D },
                    withHash: true,
                    geolocationMockupOptions: {
                        errorCode: GeolocationPositionError.POSITION_UNAVAILABLE,
                        latitude: 0,
                        longitude: 0,
                    },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_unknown')
            })
        })
    })
})
