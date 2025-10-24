import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { type SingleCoordinate, WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { Math as CesiumMath } from 'cesium'
import proj4 from 'proj4'

import type { ActionDispatcher } from '@/store/types'

import {
    calculateHeight,
    calculateResolution,
} from '@/modules/map/components/cesium/utils/cameraUtils'
import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position'
import { normalizeAngle } from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

const dispatcher: ActionDispatcher = { name: 'sync-camera-lonlatzoom.plugin' }

/** Plugin to synchronize the 3d camera position and orientation with the center and zoom. */
const registerSyncCameraLonLatZoom: PiniaPlugin = (context: PiniaPluginContext): void => {
    const { store } = context

    const positionStore = usePositionStore()
    const uiStore = useUIStore()
    const cesiumStore = useCesiumStore()

    store.$onAction(({ name, args }) => {
        if (
            name === 'setCameraPosition' &&
            positionStore.camera
        ) {
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
            store.setRotation(normalizeAngle((rotation * Math.PI) / 180), self)
        } else if (
            name === 'setCenter' &&
            cesiumStore.active &&
            positionStore.camera
        ) {
            const [newCenter] = args as Parameters<typeof positionStore.setCenter>

            // transform the center to camera
            const centerWgs84 = proj4<SingleCoordinate>(store.projection.epsg, WGS84.epsg, [
                newCenter[0], // x
                newCenter[1], // y
            ])

            positionStore.setCameraPosition(
                {
                    x: centerWgs84[0],
                    y: centerWgs84[1],
                    z: positionStore.camera.z,
                    roll: positionStore.camera.roll,
                    pitch: positionStore.camera.pitch,
                    heading: positionStore.camera.heading,
                },
                dispatcher
            )
        } else if (
            name === 'setZoom' &&
            cesiumStore.active &&
            positionStore.camera
        ) {
            // Notes(IS): It should be cesium viewer clientWidth, but we do not have access to it here.
            // We are using the store width instead.
            const newHeight = calculateHeight(positionStore.resolution, uiStore.width)
            positionStore.setCameraPosition(
                {
                    x: positionStore.camera.x,
                    y: positionStore.camera.y,
                    z: newHeight,
                    roll: positionStore.camera.roll,
                    pitch: positionStore.camera.pitch,
                    heading: positionStore.camera.heading,
                },
                dispatcher
            )
        } else if (
            (name === 'zoomToExtent' ||
                name === 'selectResultEntry') &&
            positionStore.camera
        ) {
            log.debug({
                title: 'Sync camera lon-lat-zoom plugin',
                messages: ['Adapting camera position to match zoomToExtent/selectResultEntry'],
            })
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
