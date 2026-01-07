/** @module swissgeo/coordinates/ol */

import type { ViewOptions } from 'ol/View'

import WMTSTileGrid from 'ol/tilegrid/WMTS'

import { LV95 } from '@/proj'
import { LV95_RESOLUTIONS } from '@/proj/SwissCoordinateSystem'

function indexOfMaxResolution(layerMaxResolution: number): number {
    const resolutionSteps = LV95.getResolutionSteps()
    const matchResolutionStep = resolutionSteps.find(
        (step) => step.resolution === layerMaxResolution
    )
    if (!matchResolutionStep) {
        return resolutionSteps.length - 1
    }
    return resolutionSteps.indexOf(matchResolutionStep)
}

export function getLV95TileGrid(maxResolution = 0.25): WMTSTileGrid {
    const maxResolutionIndex = indexOfMaxResolution(maxResolution)
    let resolutionSteps = LV95.getResolutionSteps()
    if (resolutionSteps.length > maxResolutionIndex) {
        resolutionSteps = resolutionSteps.slice(0, maxResolutionIndex + 1)
    }
    return new WMTSTileGrid({
        resolutions: resolutionSteps.map((step) => step.resolution),
        origin: LV95.getTileOrigin(),
        matrixIds: resolutionSteps.map((_, index) => index.toString()),
        extent: LV95.bounds?.flatten,
    })
}

export function getLV95ViewConfig(): ViewOptions {
    return {
        projection: LV95.epsg,
        center: LV95.bounds.center,
        zoom: LV95.getDefaultZoom(),
        minResolution: LV95_RESOLUTIONS[LV95_RESOLUTIONS.length - 1],
        resolutions: LV95_RESOLUTIONS,
        extent: LV95.bounds.flatten,
        constrainOnlyCenter: true,
    }
}
