import { Math as CesiumMath } from 'cesium'
import proj4 from 'proj4'

import {
    calculateHeight,
    calculateResolution,
} from '@/modules/map/components/cesium/utils/cameraUtils'
import { normalizeAngle } from '@/store/modules/position.store'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

/**
 * Plugin to synchronize the 3d camera position and orientation with the center and zoom.
 *
 * @param {Vuex.Store} store
 */
export default function syncCameraLonLatZoom(store) {
    const self = 'sync-camera-lonlatzoom.plugin'
    store.subscribe((mutation, state) => {
        if (mutation.payload.dispatcher === self) {
            log.debug(`[${self}] ignore mutation triggered by this plugin`, mutation)
            return
        }
        if (mutation.type === 'setCameraPosition' && state.position.camera) {
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
                center: centerExpressedInWantedProjection,
                dispatcher: self,
            })
            store.dispatch('setZoom', { zoom, dispatcher: self })
            store.dispatch('setRotation', {
                rotation: normalizeAngle((rotation * Math.PI) / 180),
                dispatcher: self,
            })
        } else if (mutation.type === 'setCenter' && state.cesium?.active && state.position.camera) {
            // transform the center to camera
            const centerWgs84 = proj4(state.position.projection.epsg, WGS84.epsg, [
                mutation.payload.x,
                mutation.payload.y,
            ])
            store.dispatch('setCameraPosition', {
                position: {
                    x: centerWgs84[0],
                    y: centerWgs84[1],
                    z: state.position.camera.z,
                    roll: state.position.camera.roll,
                    pitch: state.position.camera.pitch,
                    heading: state.position.camera.heading,
                },
                dispatcher: self,
            })
        }
    })
    // Subscribing to action to listen to zoomToExtent and selectResultEntry specifically.
    // This way we do not have to hook ourselves to setCenter and setZoom mutation, that are triggered
    // way more often than extent actions - supporting extent camera positioning is what we are looking for.
    store.subscribeAction({
        after: (action, state) => {
            if (state.position.camera === null) {
                return
            }
            if (['zoomToExtent', 'selectResultEntry'].includes(action.type)) {
                log.debug('Adapting camera position to match zoomToExtent/selectResultEntry')
                const newHeight = calculateHeight(store.getters.resolution, state.ui.width)
                store.dispatch('setCameraPosition', {
                    position: {
                        x: store.getters.centerEpsg4326[0],
                        y: store.getters.centerEpsg4326[1],
                        z: newHeight,
                        heading: 0,
                        pitch: CesiumMath.toDegrees(-CesiumMath.PI_OVER_TWO),
                        roll: 0,
                    },
                    dispatcher: self,
                })
            }
        },
    })
}
