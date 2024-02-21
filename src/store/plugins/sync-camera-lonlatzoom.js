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
    const self = 'sync 3D camera'
    store.subscribe((mutation, state) => {
        // only reacting to mutation when the camera is set (when 3D is active and loaded)
        if (state.position.camera === null) {
            return
        }
        if (mutation.type === 'setCameraPosition' && mutation.payload.source !== self) {
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
            store.dispatch('setCenter', {
                center: proj4(WGS84.epsg, state.position.projection.epsg, centerWGS84),
                source: self,
            })
            store.dispatch('setZoom', { zoom, source: self })
            store.dispatch('setRotation', normalizeAngle((rotation * Math.PI) / 180))
        }
        if (mutation.type === 'setCenter' && mutation.payload.source !== self) {
            store.dispatch('setCameraPosition', {
                position: {
                    x: store.getters.centerEpsg4326[0],
                    y: store.getters.centerEpsg4326[1],
                    z: state.position.camera.z,
                    heading: 0,
                    pitch: CesiumMath.toDegrees(-CesiumMath.PI_OVER_TWO),
                    roll: 0,
                },
                source: self,
            })
        }
        if (mutation.type === 'setZoom' && mutation.payload.source !== self) {
            const newHeight = calculateHeight(store.getters.resolution, state.ui.width)
            store.dispatch('setCameraPosition', {
                position: {
                    x: state.position.camera.x,
                    y: state.position.camera.y,
                    z: newHeight,
                    heading: 0,
                    pitch: CesiumMath.toDegrees(-CesiumMath.PI_OVER_TWO),
                    roll: 0,
                },
                source: self,
            })
        }
    })
}
