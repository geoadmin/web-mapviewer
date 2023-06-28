/// <reference types="cypress" />
import { Cartesian3 } from 'cesium'
import {
    CAMERA_MIN_ZOOM_DISTANCE,
    CAMERA_MAX_ZOOM_DISTANCE,
} from '@/modules/map/components/cesium/constants'

describe('Testing 3D navigation', () => {
    context('camera limits', () => {
        beforeEach(() => {
            cy.goToMapView('en', {
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
                cy.get('[data-cy="cesium"] .cesium-viewer').trigger('wheel', { deltaY: -5000 })
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
                cy.get('[data-cy="cesium"] .cesium-viewer').trigger('wheel', { deltaY: 5000 })
                cy.waitUntilCesiumTilesLoaded().then(() => {
                    expect(viewer.scene.camera.positionCartographic.height).lt(
                        CAMERA_MAX_ZOOM_DISTANCE
                    )
                })
            })
        })
    })
})
