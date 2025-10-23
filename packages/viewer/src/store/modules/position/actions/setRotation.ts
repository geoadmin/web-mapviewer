import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'

import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

import { normalizeAngle } from '@/store/modules/position'


export default function setRotation(
    this: PositionStore,
    rotation: number,
    dispatcher: ActionDispatcher
): void {
    if (!isNumber(rotation)) {
        log.error({
            title: 'Position store / setRotation',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Invalid rotation', rotation, dispatcher],
        })
        return
    }
    this.rotation = normalizeAngle(rotation)
}
