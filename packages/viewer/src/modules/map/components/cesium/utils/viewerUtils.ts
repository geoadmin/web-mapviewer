import type { Viewer } from "cesium"

import log, { LogPreDefinedColor } from "@swissgeo/log"
import { inject } from "vue"

const getViewer = inject<() => Viewer | undefined>('getViewer')

export function getCesiumViewer(): Viewer | undefined {
    if (!getViewer) {
        log.error({
            title: 'Cesium',
            titleColor: LogPreDefinedColor.Red,
            message: 'getViewer is undefined',
        })
        return undefined
    }
    return getViewer()
}
