/// <reference types="cypress" />
import { Cartesian3 } from 'cesium'
import { registerProj4, WGS84 } from 'geoadmin/proj'
import proj4 from 'proj4'

import { CAMERA_MAX_ZOOM_DISTANCE, CAMERA_MIN_ZOOM_DISTANCE } from '@/config/cesium.config'
import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'

registerProj4(proj4)

describe('Testing 3D navigation', () => {
    context('camera limits', () => {
        beforeEach(() => {
            cy.goToMapView({
                '3d': true,
            })
        })
        it('minimum distance from the terrain', () => {
            cy.waitUntilCesiumTilesLoaded()
            cy.readWindowValue('cesiumViewer').then((viewer) => {
                // Move close to the ground and try to zoom closer with the mouse wheel
                viewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(
                        7.451498,
                        46.92805,
                        CAMERA_MIN_ZOOM_DISTANCE + 500
                    ),
                    duration: 0.0,
                })
                cy.get('[data-cy="cesium-map"] .cesium-viewer').trigger('wheel', { deltaY: -5000 })

                cy.readWindowValue('cesiumViewer').then(() => {
                    expect(viewer.scene.camera.positionCartographic.height).gt(
                        CAMERA_MIN_ZOOM_DISTANCE
                    )
                })
            })
        })
        it('maximum distance from the terrain', () => {
            cy.waitUntilCesiumTilesLoaded()
            cy.readWindowValue('cesiumViewer').then((viewer) => {
                // Move far from the ground and try to zoom higher with the mouse wheel
                viewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(
                        7.451498,
                        46.92805,
                        CAMERA_MAX_ZOOM_DISTANCE - 500
                    ),
                    duration: 0.0,
                })
                cy.get('[data-cy="cesium-map"] .cesium-viewer').trigger('wheel', { deltaY: 5000 })
                cy.readWindowValue('cesiumViewer').then(() => {
                    expect(viewer.scene.camera.positionCartographic.height).lt(
                        CAMERA_MAX_ZOOM_DISTANCE
                    )
                })
            })
        })
        it('updates the position in store', () => {
            cy.waitUntilCesiumTilesLoaded()
            cy.readWindowValue('cesiumViewer').then((viewer) => {
                const lon = 7.451498
                const lat = 46.92805
                viewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(lon, lat, 1000),
                    orientation: {
                        heading: Math.PI,
                    },
                    duration: 0.0,
                })
                cy.readWindowValue('cesiumViewer').then(() => {
                    cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                        expect(center[0]).to.eq(lon)
                        expect(center[1]).to.eq(lat)
                    })
                    cy.readStoreValue('state').then((state) => {
                        const { zoom, projection } = state.position
                        const height = viewer.camera.positionCartographic.height
                        const resolution = calculateResolution(height, viewer.canvas.clientWidth)
                        expect(zoom).to.approximately(
                            projection.getZoomForResolutionAndCenter(
                                resolution,
                                proj4(WGS84.epsg, projection.epsg, [lon, lat])
                            ),
                            0.001
                        )
                    })
                    cy.readStoreValue('state.position.rotation').should((rotation) => {
                        expect(rotation).to.eq(Math.PI)
                    })
                })
            })
        })
    })

    it('2d camera does not go out of bounds if url parameter is out of bounds', () => {
        cy.goToMapView({
            center: '0,0',
        })
        cy.log('check if center is moved to out of bounds location')
        cy.readStoreValue('state.position').should((positionStore) => {
            expect(positionStore.center).to.deep.equal([2660000, 1190000])
        })
    })
    it('3d camera does not go out of bounds if url parameter is out of bounds', () => {
        cy.goToMapView({
            '3d': true,
            camera: '0,0',
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.log('check if camera is moved to out of bounds location')
        cy.readStoreValue('state.position').should((positionStore) => {
            expect(positionStore.camera.x).to.deep.equal(8.225457)
            expect(positionStore.camera.y).to.deep.equal(46.858429)
        })
    })
})
