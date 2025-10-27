import type { FlatExtent, NormalizedExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { Position } from 'geojson'

import { CoordinateSystem, extentUtils, WGS84 } from '@swissgeo/coordinates'
import { center, points } from '@turf/turf'
import { Math as CesiumMath } from 'cesium'
import proj4 from 'proj4'

import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

import { calculateHeight } from '@/modules/map/components/cesium/utils/cameraUtils'
import useCesiumStore from '@/store/modules/cesium'
import useUIStore from '@/store/modules/ui'

interface ZoomToExtentOptions {
    extentProjection?: CoordinateSystem
    maxZoom?: number
}

export default function zoomToExtent(
    this: PositionStore,
    extent: FlatExtent | NormalizedExtent,
    options: ZoomToExtentOptions,
    dispatcher: ActionDispatcher
): void
export default function zoomToExtent(
    this: PositionStore,
    extent: FlatExtent | NormalizedExtent,
    dispatcher: ActionDispatcher
): void
export default function zoomToExtent(
    this: PositionStore,
    extent: FlatExtent | NormalizedExtent,
    optionsOrDispatcher: ZoomToExtentOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    const options = dispatcherOrNothing ? (optionsOrDispatcher as ZoomToExtentOptions) : {}
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)

    const { extentProjection, maxZoom } = options

    // Convert extent points to WGS84 as TurfJS needs them in this format
    const normalizedWGS84Extent: NormalizedExtent = extentUtils.projExtent(
        extentProjection ?? this.projection,
        WGS84,
        extentUtils.normalizeExtent(extent)
    )
    if (
        normalizedWGS84Extent &&
        Array.isArray(normalizedWGS84Extent) &&
        normalizedWGS84Extent.length === 2
    ) {
        // Calculate the center of the extent and convert it back to the wanted projection
        const centerOfExtent: SingleCoordinate = proj4(
            WGS84.epsg,
            this.projection.epsg,
            center(
                points([normalizedWGS84Extent[0] as Position, normalizedWGS84Extent[1] as Position])
            ).geometry.coordinates
        ) as SingleCoordinate

        if (centerOfExtent && Array.isArray(centerOfExtent) && centerOfExtent.length === 2) {
            this.center = centerOfExtent
        }
        const extentSize = {
            width: normalizedWGS84Extent[1][0] - normalizedWGS84Extent[0][0],
            height: normalizedWGS84Extent[1][1] - normalizedWGS84Extent[0][1],
        }

        const uiStore = useUIStore()
        let targetResolution
        // if the extent's height is greater than width, we base our resolution calculation on that
        if (extentSize.height > extentSize.width) {
            targetResolution = extentSize.height / (uiStore.height - uiStore.headerHeight)
        } else {
            targetResolution = extentSize.width / uiStore.width
        }

        const zoomForResolution = this.projection.getZoomForResolutionAndCenter(
            targetResolution,
            centerOfExtent
        )
        // if maxZoom is not set, we set it to the current projection value to
        // have a 1:25000 ratio.
        const computedMaxZoom = maxZoom ?? this.projection.get1_25000ZoomLevel()
        // Zoom levels are fixed value with LV95, the one calculated is the fixed zoom the closest to the floating
        // zoom level required to show the full extent on the map (scale to fill).
        // So the view will be too zoomed-in to have an overview of the extent.
        // We then set the zoom level to the one calculated minus one (expect when the calculated zoom is 0...).
        // We also cannot zoom further than the maxZoom specified if it is specified
        this.zoom = Math.min(Math.max(zoomForResolution - 1, 0), computedMaxZoom)

        const cesiumStore = useCesiumStore()
        if (cesiumStore.active && this.camera) {
            const newHeight = calculateHeight(this.resolution, uiStore.width)
            this.setCameraPosition(
                {
                    x: this.centerEpsg4326[0],
                    y: this.centerEpsg4326[1],
                    z: newHeight,
                    heading: 0,
                    pitch: CesiumMath.toDegrees(-CesiumMath.PI_OVER_TWO),
                    roll: 0,
                },
                dispatcher
            )
        }
    }
}
