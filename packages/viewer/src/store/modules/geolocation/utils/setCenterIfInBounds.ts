import type { SingleCoordinate } from '@swissgeo/coordinates'

import { LV95 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import { Math as CesiumMath } from 'cesium'
import { isEqual } from 'lodash'

import type { GeolocationStore } from '@/store/modules/geolocation/types/geolocation'
import type { ActionDispatcher } from '@/store/types'

import useCesiumStore from '@/store/modules/cesium'
import usePositionStore from '@/store/modules/position.store'
import useUIStore from '@/store/modules/ui.store'

/**
 * Flag telling if this is the first time the geolocation is activated. This is useful when deciding
 * to center the view on the geolocation position at activation.
 */
let firstTime: boolean = true

export default function setCenterIfInBounds(
    this: GeolocationStore,
    center: SingleCoordinate,
    dispatcher: ActionDispatcher
): void {
    const cesiumStore = useCesiumStore()
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    const lv95BoundsInCurrentProjection = LV95.getBoundsAs(positionStore.projection)

    if (lv95BoundsInCurrentProjection?.isInBounds(center[0], center[1])) {
        if (!isEqual(positionStore.center, center)) {
            positionStore.setCenter(center, dispatcher)

            if (firstTime) {
                firstTime = false
                if (cesiumStore.active && positionStore.camera) {
                    positionStore.setCameraPosition(
                        {
                            x: positionStore.camera.x,
                            y: positionStore.camera.y,
                            z: positionStore.camera.z,

                            heading: -CesiumMath.toRadians(positionStore.rotation),
                            pitch: -90,
                            roll: 0,
                        },
                        dispatcher
                    )
                }
                positionStore.setZoom(positionStore.projection.get1_25000ZoomLevel(), dispatcher)
            }
        }
    } else {
        log.warn({
            title: 'Geolocation store / setCenterIfInBounds',
            titleColor: LogPreDefinedColor.Amber,
            messages: [`current geolocation is out of bounds: ${JSON.stringify(center)}`],
        })
        uiStore.addErrors([new ErrorMessage('geoloc_out_of_bounds')], dispatcher)
    }
}
