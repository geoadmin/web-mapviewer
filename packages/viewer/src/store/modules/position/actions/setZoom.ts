import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'

import type { PositionStore } from '@/store/modules/position/types'
import type { ActionDispatcher } from '@/store/types'

import { calculateHeight } from '@/modules/map/components/cesium/utils/cameraUtils'
import useCesiumStore from '@/store/modules/cesium'
import useUIStore from '@/store/modules/ui'

export default function setZoom(
    this: PositionStore,
    zoom: number,
    dispatcher: ActionDispatcher
): void {
    if (!isNumber(zoom) || zoom < 0) {
        log.error({
            title: 'Position store / setZoom',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Invalid zoom level', zoom, dispatcher],
        })
        return
    }
    this.zoom = this.projection.roundZoomLevel(zoom)

    const cesiumStore = useCesiumStore()
    const uiStore = useUIStore()
    if (cesiumStore.active && this.camera) {
        // Notes(IS): It should be cesium viewer clientWidth, but we do not have access to it here.
        // We are using the store width instead.
        const newHeight = calculateHeight(this.resolution, uiStore.width)
        this.setCameraPosition(
            {
                x: this.camera.x,
                y: this.camera.y,
                z: newHeight,
                roll: this.camera.roll,
                pitch: this.camera.pitch,
                heading: this.camera.heading,
            },
            dispatcher
        )
    }
}
