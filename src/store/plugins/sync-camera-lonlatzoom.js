import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import { calculateWebMercatorZoom, normalizeAngle } from '@/store/modules/position.store'

/**
 * Plugin to synchronize the 3d camera position and orientation with the center and zoom.
 *
 * @param {Vuex.Store} store
 */
export default function syncCameraLonLatZoom(store) {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setCameraPosition' && state.position.camera !== null) {
            const lon = parseFloat(state.position.camera.x)
            const lat = parseFloat(state.position.camera.y)
            const height = parseFloat(state.position.camera.z)
            const rotation = -parseFloat(state.position.camera.heading)

            const resolution = calculateResolution(height, state.ui.width)
            const zoom = calculateWebMercatorZoom(resolution, lat)

            store.dispatch('setLongitude', lon)
            store.dispatch('setLatitude', lat)
            store.dispatch('setZoom', zoom)
            store.dispatch('setRotation', normalizeAngle((rotation * Math.PI) / 180))
        }
    })
}
