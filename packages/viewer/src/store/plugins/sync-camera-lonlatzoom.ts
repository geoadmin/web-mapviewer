import { WGS84, type SingleCoordinate } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { Math as CesiumMath } from 'cesium'
import proj4 from 'proj4'

import {
    calculateHeight,
    calculateResolution,
} from '@/modules/map/components/cesium/utils/cameraUtils'

import type { ActionDispatcher } from '@/store/types'
import usePositionStore, { normalizeAngle } from '@/store/modules/position.store'
import useUIStore from '@/store/modules/ui.store'
import useCesiumStore from '@/store/modules/cesium.store'

/**
 * Plugin to synchronize the 3d camera position and orientation with the center and zoom.
 *
 * @param {Vuex.Store} store
 */
const registerSyncCameraLonLatZoom = (): void => {
    const dispatcher: ActionDispatcher = { name: 'sync-camera-lonlatzoom.plugin' }

    const positionStore = usePositionStore()
    const uiStore = useUIStore()
    const cesiumStore = useCesiumStore()

    positionStore.$onAction(({ name, store, args }) => {
        if (name === 'setCameraPosition' && store.camera) {
            const lon = store.camera.x
            const lat = store.camera.y
            const height = store.camera.z
            const rotation = -store.camera.heading

            const centerWGS84: SingleCoordinate = [lon, lat]

            const centerExpressedInWantedProjection = proj4<SingleCoordinate>(
                WGS84.epsg,
                positionStore.projection.epsg,
                centerWGS84
            )

            const resolution = calculateResolution(height, uiStore.width)
            const zoom = store.projection.getZoomForResolutionAndCenter(
                resolution,
                centerExpressedInWantedProjection
            )

            store.setCenter(centerExpressedInWantedProjection, dispatcher)
            store.setZoom(zoom, dispatcher)
            store.setRotation(normalizeAngle((rotation * Math.PI) / 180), elf)
        } else if (name === 'setCenter' && cesiumStore.active && store.camera) {
            const setCenterArgs: Parameters<typeof store.setCenter> = args

            // transform the center to camera
            const centerWgs84 = proj4<SingleCoordinate>(store.projection.epsg, WGS84.epsg, [
                setCenterArgs[0][0], // x
                setCenterArgs[0][1], // y
            ])

            store.setCameraPosition(
                {
                    x: centerWgs84[0],
                    y: centerWgs84[1],
                    z: store.camera.z,
                    roll: store.camera.roll,
                    pitch: store.camera.pitch,
                    heading: store.camera.heading,
                },
                dispatcher
            )
        } else if (name === 'setZoom' && cesiumStore.active && store.camera) {
            // Notes(IS): It should be cesium viewer clientWidth, but we do not have access to it here.
            // We are using the store width instead.
            const newHeight = calculateHeight(store.resolution, uiStore.width)
            store.setCameraPosition(
                {
                    x: store.camera.x,
                    y: store.camera.y,
                    z: newHeight,
                    roll: store.camera.roll,
                    pitch: store.camera.pitch,
                    heading: store.camera.heading,
                },
                dispatcher
            )
        } else if (['zoomToExtent', 'selectResultEntry'].includes(name) && store.camera) {
            log.debug('Adapting camera position to match zoomToExtent/selectResultEntry')
            const newHeight = calculateHeight(positionStore.resolution, uiStore.width)
            positionStore.setCameraPosition(
                {
                    x: positionStore.centerEpsg4326[0],
                    y: positionStore.centerEpsg4326[1],
                    z: newHeight,
                    heading: 0,
                    pitch: CesiumMath.toDegrees(-CesiumMath.PI_OVER_TWO),
                    roll: 0,
                },
                dispatcher
            )
        }
    })
}

export default registerSyncCameraLonLatZoom
