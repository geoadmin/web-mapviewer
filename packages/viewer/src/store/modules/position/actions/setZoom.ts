import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'

import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

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
}
