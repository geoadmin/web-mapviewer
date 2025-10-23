import {
    allCoordinateSystems,
    CoordinateSystem,
    CustomCoordinateSystem,
    StandardCoordinateSystem,
} from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'
import proj4 from 'proj4'

import type { PositionStore } from '@/store/modules/position/types/position'
import type { ActionDispatcher } from '@/store/types'

export default function setProjection(
    this: PositionStore,
    projection: CoordinateSystem | number | string,
    dispatcher: ActionDispatcher
): void {
    let matchingProjection: CoordinateSystem | undefined
    if (projection instanceof CoordinateSystem) {
        matchingProjection = projection
    } else if (typeof projection === 'number' || isNumber(projection)) {
        matchingProjection = allCoordinateSystems.find(
            (coordinateSystem) => coordinateSystem.epsgNumber === projection
        )
    } else {
        matchingProjection = allCoordinateSystems.find(
            (coordinateSystem) =>
                coordinateSystem.epsg === projection ||
                coordinateSystem.epsgNumber === parseInt(projection)
        )
    }
    if (matchingProjection) {
        if (matchingProjection.epsg === this.projection.epsg) {
            log.debug({
                title: 'Position store / setProjection',
                titleColor: LogPreDefinedColor.Red,
                messages: [
                    'Projection already set, ignoring',
                    this.projection,
                    matchingProjection,
                    dispatcher,
                ],
            })
            return
        }
        const oldProjection: CoordinateSystem = this.projection
        // reprojecting the center of the map
        this.center = proj4(oldProjection.epsg, matchingProjection.epsg, this.center)
        // adapting the zoom level (if needed)
        if (
            oldProjection instanceof StandardCoordinateSystem &&
            matchingProjection instanceof CustomCoordinateSystem
        ) {
            this.zoom = matchingProjection.transformStandardZoomLevelToCustom(this.zoom)
        } else if (
            oldProjection instanceof CustomCoordinateSystem &&
            matchingProjection instanceof StandardCoordinateSystem
        ) {
            this.zoom = oldProjection.transformCustomZoomLevelToStandard(this.zoom)
        }
        if (
            oldProjection instanceof CustomCoordinateSystem &&
            matchingProjection instanceof CustomCoordinateSystem &&
            oldProjection.epsg !== matchingProjection.epsg
        ) {
            // we have to revert the old projection zoom level to standard, and then transform it to the new projection custom zoom level
            this.zoom = oldProjection.transformCustomZoomLevelToStandard(
                matchingProjection.transformStandardZoomLevelToCustom(this.zoom)
            )
        }

        if (this.crossHairPosition) {
            this.crossHairPosition = proj4(
                oldProjection.epsg,
                matchingProjection.epsg,
                this.crossHairPosition
            )
        }

        this.projection = matchingProjection
    } else {
        log.error({
            title: 'Position store / setProjection',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Unsupported projection', projection, dispatcher],
        })
    }
}
