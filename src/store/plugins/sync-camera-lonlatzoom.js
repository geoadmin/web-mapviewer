import proj4 from 'proj4'

import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import { normalizeAngle } from '@/store/modules/position.store'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

/**
 * Plugin to synchronize the 3d camera position and orientation with the center and zoom.
 *
 * @param {Vuex.Store} store
 */
export default function syncCameraLonLatZoom(store) {
    store.subscribe((mutation, state) => {
        // only reacting to mutation when the camera is set (when 3D is active and loaded)
        if (state.position.camera === null) {
            return
        }
        if (mutation.type === 'setCameraPosition') {
            const lon = parseFloat(state.position.camera.x)
            const lat = parseFloat(state.position.camera.y)
            const height = parseFloat(state.position.camera.z)
            const rotation = -parseFloat(state.position.camera.heading)

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
            store.dispatch(
                'setCenter',
                proj4(WGS84.epsg, state.position.projection.epsg, centerWGS84)
            )
            store.dispatch('setZoom', zoom)
            store.dispatch('setRotation', normalizeAngle((rotation * Math.PI) / 180))
        }
    })
}
