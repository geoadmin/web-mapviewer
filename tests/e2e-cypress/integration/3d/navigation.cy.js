/// <reference types="cypress" />
import {
    CAMERA_MAX_ZOOM_DISTANCE,
    CAMERA_MIN_ZOOM_DISTANCE,
} from '@/modules/map/components/cesium/constants'
import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import { calculateZoom } from '@/store/modules/position.store'
import { Cartesian3 } from 'cesium'

describe('Testing 3D navigation', () => {
    context('camera limits', () => {
        beforeEach(() => {
            cy.goToMapView({
                '3d': true,
            })
        })
        it('minimum distance from the terrain', () => {
            cy.waitUntilCesiumTilesLoaded().then((viewer) => {
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
                cy.waitUntilCesiumTilesLoaded().then(() => {
                    expect(viewer.scene.camera.positionCartographic.height).gt(
                        CAMERA_MIN_ZOOM_DISTANCE
                    )
                })
            })
        })
        it('maximum distance from the terrain', () => {
            cy.waitUntilCesiumTilesLoaded().then((viewer) => {
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
                cy.waitUntilCesiumTilesLoaded().then(() => {
                    expect(viewer.scene.camera.positionCartographic.height).lt(
                        CAMERA_MAX_ZOOM_DISTANCE
                    )
                })
            })
        })
        it('updates the position in store', () => {
            cy.waitUntilCesiumTilesLoaded().then((viewer) => {
                const lon = 7.451498
                const lat = 46.92805
                viewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(lon, lat, 1000),
                    orientation: {
                        heading: Math.PI,
                    },
                    duration: 0.0,
                })
                cy.waitUntilCesiumTilesLoaded().then(() => {
                    cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                        expect(center[0]).to.eq(lon)
                        expect(center[1]).to.eq(lat)
                    })
                    cy.readStoreValue('state.position.zoom').should((zoom) => {
                        const height = viewer.camera.positionCartographic.height
                        const resolution = calculateResolution(height, viewer.canvas.clientWidth)
                        expect(zoom).to.approximately(calculateZoom(resolution, lat), 0.001)
                    })
                    cy.readStoreValue('state.position.rotation').should((rotation) => {
                        expect(rotation).to.eq(Math.PI)
                    })
                })
            })
        })
    })
})
