import { calculateResolution } from '@/modules/map/components/cesium/utils/cameraUtils'
import { normalizeAngle } from '@/store/modules/position.store'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { calculateWebMercatorZoom } from '@/utils/zoomLevelUtils'
import proj4 from 'proj4'

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

            const centerWGS84 = [lon, lat]
            if (state.position.projection.epsg !== WGS84.epsg) {
                store.dispatch(
                    'setCenter',
                    proj4(WGS84.epsg, state.position.projection.epsg, centerWGS84)
                )
            } else {
                store.dispatch('setCenter', centerWGS84)
            }
            store.dispatch('setZoom', zoom)
            store.dispatch('setRotation', normalizeAngle((rotation * Math.PI) / 180))
        }
    })
}
