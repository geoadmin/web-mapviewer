import { Math as CesiumMath } from 'cesium'
import proj4 from 'proj4'

import {
    calculateHeight,
    calculateResolution,
} from '@/modules/map/components/cesium/utils/cameraUtils'
import { normalizeAngle } from '@/store/modules/position.store'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

/**
 * Plugin to synchronize the 3d camera position and orientation with the center and zoom.
 *
 * @param {Vuex.Store} store
 */
export default function syncCameraLonLatZoom(store) {
    const triggeredByThisModule = {
        setCenter: false,
        setZoom: false,
        setCameraPosition: false,
    }
    store.subscribe((mutation, state) => {
        // only reacting to mutation when the camera is set (when 3D is active and loaded)
        if (state.position.camera === null) {
            return
        }
        if (mutation.type === 'setCameraPosition') {
            if (!triggeredByThisModule.setCameraPosition) {
                const lon = state.position.camera.x
                const lat = state.position.camera.y
                const height = state.position.camera.z
                const rotation = -state.position.camera.heading

                const centerWGS84 = [lon, lat]
                const centerExpressedInWantedProjection = proj4(
                    WGS84.epsg,
                    state.position.projection.epsg,
                    centerWGS84
                )

                const resolution = calculateResolution(height, state.ui.width)
                const zoom = state.position.projection.getZoomForResolutionAndCenter(
                    resolution,
                    centerExpressedInWantedProjection
                )
                triggeredByThisModule.setCenter = true
                store.dispatch(
                    'setCenter',
                    proj4(WGS84.epsg, state.position.projection.epsg, centerWGS84)
                )
                triggeredByThisModule.setZoom = true
                store.dispatch('setZoom', zoom)
                store.dispatch('setRotation', normalizeAngle((rotation * Math.PI) / 180))
            } else {
                triggeredByThisModule.setCameraPosition = false
            }
        }
        if (state.position.camera && mutation.type === 'setCenter') {
            if (!triggeredByThisModule.setCenter) {
                triggeredByThisModule.setCameraPosition = true
                store.dispatch('setCameraPosition', {
                    x: store.getters.centerEpsg4326[0],
                    y: store.getters.centerEpsg4326[1],
                    z: state.position.camera.z,
                    heading: 0,
                    pitch: CesiumMath.toDegrees(-CesiumMath.PI_OVER_TWO),
                    roll: 0,
                })
            } else {
                triggeredByThisModule.setCenter = false
            }
        }
        if (state.position.camera && mutation.type === 'setZoom') {
            if (!triggeredByThisModule.setZoom) {
                const newHeight = calculateHeight(store.getters.resolution, state.ui.width)
                triggeredByThisModule.setCameraPosition = true
                store.dispatch('setCameraPosition', {
                    x: state.position.camera.x,
                    y: state.position.camera.y,
                    z: newHeight,
                    heading: 0,
                    pitch: CesiumMath.toDegrees(-CesiumMath.PI_OVER_TWO),
                    roll: 0,
                })
            } else {
                triggeredByThisModule.setZoom = false
            }
        }
    })
}
