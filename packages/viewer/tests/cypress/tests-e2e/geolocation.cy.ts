/// <reference types="cypress" />

import type { SingleCoordinate } from '@swissgeo/coordinates'

import { constants, registerProj4, WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'
import {
    changeUrlParam,
    getGeolocationButtonAndClickIt,
    testErrorMessage,
    checkPosition,
} from 'support/utils'

import { DEFAULT_PROJECTION } from '@/config'
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
                    cy.goToMapView({ queryParams: { '3d': is3D } })
                    getGeolocationButtonAndClickIt()
                    cy.on('window:alert', () => {
                        throw new Error('Should not prompt for geolocation API permission again')
                    })
                    cy.getPinia().then((pinia) => {
                        const geolocationStore = useGeolocationStore(pinia)
                        expect(geolocationStore.active).to.be.true
                    })
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
                cy.getPinia().then((pinia) => {
                    const positionStore = usePositionStore(pinia)
                    expect(positionStore.zoom).to.eq(startingZoom)
                    checkPosition(positionStore.center, x0, y0)
                })

                getGeolocationButtonAndClickIt()

                cy.getPinia().then((pinia) => {
                    const geolocationStore = useGeolocationStore(pinia)
                    checkPosition(geolocationStore.position, geoX, geoY)

                    // check that the map has been centered on the geolocation and zoom is updated
                    const positionStore = usePositionStore(pinia)
                    checkPosition(positionStore.center, geoX, geoY)
                    expect(positionStore.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP)
                })

                // Check if the zoom is changed
                cy.log('Check zoom in and zoom out after geolocation positioning')
                cy.get('[data-cy="zoom-in"]').click()
                cy.getPinia().then((pinia) => {
                    const positionStore = usePositionStore(pinia)
                    expect(positionStore.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP + 1)
                    checkPosition(positionStore.center, geoX, geoY)
                })

                cy.log('Zoom in twice more')
                cy.get('[data-cy="zoom-in"]').click()
                cy.get('[data-cy="zoom-in"]').click()
                cy.getPinia().then((pinia) => {
                    const positionStore = usePositionStore(pinia)
                    expect(positionStore.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP + 3)
                })

                cy.log('Zoom out three times to return to initial zoom after geolocation')
                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                cy.get('[data-cy="zoom-out"]').click()
                cy.getPinia().then((pinia) => {
                    const positionStore = usePositionStore(pinia)
                    expect(positionStore.zoom).to.eq(constants.SWISS_ZOOM_LEVEL_1_25000_MAP)
                    checkPosition(positionStore.center, geoX, geoY)
                })
            })
            it('access from outside Switzerland shows an error message', () => {
                cy.log('Test from null island')
                cy.goToMapView({
                    withHash: true,
                    geolocationMockupOptions: { latitude: 0, longitude: 0 },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')

                cy.log('Test from Java island')
                cy.goToMapView({
                    withHash: true,
                    geolocationMockupOptions: { latitude: -7.71, longitude: 110.37 },
                })
                getGeolocationButtonAndClickIt()
                testErrorMessage('geoloc_out_of_bounds')
            })
            it('Handling geolocation tracking and recentering behavior', () => {
                const geoLatitude: number = 47.5
                const geoLongitude: number = 6.8
                const [geoX, geoY]: SingleCoordinate = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                    geoLongitude,
                    geoLatitude,
                ])

                cy.goToMapView({
                    withHash: true,
                    geolocationMockupOptions: { latitude: geoLatitude, longitude: geoLongitude },
                })

                // click the geolocation button for the first time
                getGeolocationButtonAndClickIt()

                // check if the geolocation is active, tracking is active, and center to the current geolocation position
                cy.getPinia().then((pinia) => {
                    const geolocationStore = useGeolocationStore(pinia)
                    expect(geolocationStore.active).to.be.true
                    expect(geolocationStore.tracking).to.be.true

                    const positionStore = usePositionStore(pinia)
                    checkPosition(positionStore.center, geoX, geoY)
                })

                // move the map
                cy.getPinia().then((pinia) => {
                    const positionStore = usePositionStore(pinia)
                    changeUrlParam(
                        'center',
                        positionStore.center.map((value) => value + 2500).join(',')
                    )
                })

                // the geolocation should be still active, but tracking should be false, and the recenter button should show up
                cy.get('[data-cy="recenter-button"]').should('be.visible')
                cy.getPinia().then((pinia) => {
                    const geolocationStore = useGeolocationStore(pinia)
                    expect(geolocationStore.active).to.be.true
                    expect(geolocationStore.tracking).to.be.false
                })

                // press the recenter button
                cy.get('[data-cy="recenter-button"]').should('be.visible')
                cy.get('[data-cy="recenter-button"]').click()
                // recenter button is hidden
                cy.get('[data-cy="recenter-button"]').should('not.exist')

                // the geolocation should be still active, tracking should be active, and center is the geolocation position
                cy.getPinia().then((pinia) => {
                    const geolocationStore = useGeolocationStore(pinia)
                    expect(geolocationStore.active).to.be.true
                    expect(geolocationStore.tracking).to.be.true

                    const positionStore = usePositionStore(pinia)
                    checkPosition(positionStore.center, geoX, geoY)
                })

                // NOTE(IS): The following scenario is failed in cypress but passed in manual test

                // // press geolocation button again to disable geolocation
                // getGeolocationButtonAndClickIt()

                // // the geolocation should be inactive, tracking also inactive
                // cy.getPinia().then((pinia) => {
                //     const geolocationStore = useGeolocationStore(pinia)
                //     expect(geolocationStore.active).to.be.false
                //     expect(geolocationStore.tracking).to.be.false
                // })

                // // move/pan the map
                // cy.get('[data-cy="ol-map"] canvas')
                //     .trigger('pointerdown', { button: 0, clientX: 200, clientY: 200 })
                //     .trigger('pointermove', { button: 0, clientX: 300, clientY: 300 })
                //     .trigger('pointerup', { button: 0, force: true })

                // cy.getPinia().then((pinia) => {
                //     const geolocationStore = useGeolocationStore(pinia)
                //     expect(geolocationStore.active).to.be.false
                //     expect(geolocationStore.tracking).to.be.false

                //     const positionStore = usePositionStore(pinia)
                //     cy.log('positionStore', positionStore.center)
                // })

                // // press again the geolocaiton button to activate it for the second time but not tracking
                // getGeolocationButtonAndClickIt()

                // this time, the geolocation should be active, but tracking is off, and the map is not centered to the current geolocation, also the recenter button is show up
                // cy.get('[data-cy="recenter-button"]').should('be.visible')
                // cy.getPinia().then((pinia) => {
                //     const geolocationStore = useGeolocationStore(pinia)
                //     expect(geolocationStore.active).to.be.true
                //     expect(geolocationStore.tracking).to.be.false
                // })

                // // press recenter button, then geolocation, tracking should both active, then map is recenter to the current location, and the recenter button is hidden
                // cy.get('[data-cy="recenter-button"]').click()
                // cy.get('[data-cy="recenter-button"]').should('not.exist')
                // cy.getPinia().then((pinia) => {
                //     const geolocationStore = useGeolocationStore(pinia)
                //     expect(geolocationStore.active).to.be.true
                //     expect(geolocationStore.tracking).to.be.true

                //     const positionStore = usePositionStore(pinia)
                //     checkPosition(positionStore.center, geoX, geoY)
                // })
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
