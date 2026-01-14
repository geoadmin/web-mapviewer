import type { Viewer } from 'cesium';
import type {ShallowRef} from 'vue';

import { registerProj4, WGS84 } from '@swissgeo/coordinates'
import {
    CAMERA_MAX_ZOOM_DISTANCE,
    CAMERA_MIN_ZOOM_DISTANCE,
} from '@swissgeo/staging-config/constants'
import { Cartesian3 } from 'cesium'
import proj4 from 'proj4'
import { toValue  } from 'vue'

import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import usePositionStore from '@/store/modules/position'

registerProj4(proj4)

describe('Testing 3D navigation', () => {
    context('camera limits', () => {
        beforeEach(() => {
            cy.goToMapView({
                queryParams: { '3d': true },
            })
        })
        it('minimum distance from the terrain', () => {
            cy.waitUntilCesiumTilesLoaded()
            cy.window()
                .its('cesiumViewer')
                .then((viewer: ShallowRef<Viewer>) => {
                    const currentViewer: Viewer = toValue(viewer)
                    // Move close to the ground and try to zoom closer with the mouse wheel
                    currentViewer.camera.flyTo({
                        destination: Cartesian3.fromDegrees(
                            7.451498,
                            46.92805,
                            CAMERA_MIN_ZOOM_DISTANCE + 500
                        ),
                        duration: 0.0,
                    })
                    cy.get('[data-cy="cesium-map"] .cesium-viewer').trigger('wheel', {
                        deltaY: -5000,
                    })

                    cy.window()
                        .its('cesiumViewer')
                        .then(() => {
                            expect(currentViewer.scene.camera.positionCartographic.height).gt(
                                CAMERA_MIN_ZOOM_DISTANCE
                            )
                        })
                })
        })
        it('maximum distance from the terrain', () => {
            cy.waitUntilCesiumTilesLoaded()
            cy.window()
                .its('cesiumViewer')
                .then((viewer: ShallowRef<Viewer>) => {
                    const currentViewer: Viewer = toValue(viewer)
                    // Move far from the ground and try to zoom higher with the mouse wheel
                    currentViewer.camera.flyTo({
                        destination: Cartesian3.fromDegrees(
                            7.451498,
                            46.92805,
                            CAMERA_MAX_ZOOM_DISTANCE - 500
                        ),
                        duration: 0.0,
                    })
                    cy.get('[data-cy="cesium-map"] .cesium-viewer').trigger('wheel', {
                        deltaY: 5000,
                    })
                    cy.window()
                        .its('cesiumViewer')
                        .then(() => {
                            expect(currentViewer.scene.camera.positionCartographic.height).lt(
                                CAMERA_MAX_ZOOM_DISTANCE
                            )
                        })
                })
        })
        it('updates the position in store', () => {
            cy.waitUntilCesiumTilesLoaded()
            cy.wait('@routeChange')
            cy.wait('@routeChange')
            cy.window()
                .its('cesiumViewer')
                .then((viewer: ShallowRef<Viewer>) => {
                    const currentViewer: Viewer = toValue(viewer)
                    const lon = 7.451498
                    const lat = 46.92805
                    currentViewer.camera.flyTo({
                        destination: Cartesian3.fromDegrees(lon, lat, 1000),
                        orientation: {
                            heading: Math.PI,
                        },
                        duration: 0.0,
                    })
                    cy.wait('@routeChange')
                    cy.window()
                        .its('cesiumViewer')
                        .then(() => {
                            cy.getPinia().then((pinia) => {
                                const positionStore = usePositionStore(pinia)
                                const center = positionStore.centerEpsg4326
                                expect(center?.[0]).to.eq(lon)
                                expect(center?.[1]).to.eq(lat)

                                const { zoom, projection } = positionStore
                                const height = currentViewer.camera.positionCartographic.height
                                const resolution = calculateResolution(
                                    height,
                                    currentViewer.canvas.clientWidth
                                )
                                expect(zoom).to.approximately(
                                    projection?.getZoomForResolution(
                                        resolution,
                                        proj4(WGS84.epsg, projection.epsg, [lon, lat])
                                    ),
                                    0.001
                                )

                                const rotation = positionStore.rotation
                                expect(rotation).to.eq(Math.PI)
                            })
                        })
                })
        })
    })

    it('2d camera does not go out of bounds if url parameter is out of bounds', () => {
        cy.goToMapView({
            queryParams: { center: '0,0' },
        })
        cy.log('check if center is moved to out of bounds location')
        cy.getPinia().then((pinia) => {
            const positionStore2 = usePositionStore(pinia)
            expect(positionStore2.center).to.deep.equal([2660000, 1190000])
        })
    })
    it('3d camera does not go out of bounds if url parameter is out of bounds', () => {
        cy.goToMapView({
            queryParams: {
                '3d': true,
                camera: '0,0',
            },
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.log('check if camera is moved to out of bounds location')
        cy.getPinia().then((pinia) => {
            const positionStore3 = usePositionStore(pinia)
            expect(positionStore3.camera?.x).to.deep.equal(8.225457)
            expect(positionStore3.camera?.y).to.deep.equal(46.858429)
        })
    })
})
