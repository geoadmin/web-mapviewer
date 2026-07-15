import { Math as CesiumMath } from 'cesium'

import {
    buildSwissnamesTileKey,
    getVisibleSwissnamesTiles,
} from '@/modules/map/components/cesium/utils/swissnamesLabels'

export function getSwissnamesCameraRectangle(viewer) {
    const rectangle = viewer.camera.computeViewRectangle()
    if (!rectangle) {
        return null
    }
    return {
        west: CesiumMath.toDegrees(rectangle.west),
        east: CesiumMath.toDegrees(rectangle.east),
        north: CesiumMath.toDegrees(rectangle.north),
        south: CesiumMath.toDegrees(rectangle.south),
    }
}

export function getSwissnamesEffectiveCameraAltitude(viewer) {
    const rawAltitude = viewer.camera.positionCartographic.height
    const sinPitch = Math.max(Math.abs(Math.sin(viewer.camera.pitch)), 0.15)
    return rawAltitude / sinPitch
}

export function getVisibleSwissnamesTileEntries(layer, rectangle) {
    return getVisibleSwissnamesTiles(rectangle, layer.tileZoom).map((tile) => ({
        layer,
        tile,
        key: buildSwissnamesTileKey(layer.id, tile),
    }))
}
