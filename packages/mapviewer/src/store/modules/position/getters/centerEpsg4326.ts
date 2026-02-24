import type { SingleCoordinate } from '@swissgeo/coordinates'

import { WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import type { PositionStore } from '@/store/modules/position/types'

export default function centerEpsg4326(this: PositionStore): SingleCoordinate {
    const centerEpsg4326Unrounded = proj4(this.projection.epsg, WGS84.epsg, this.center)
    return [
        WGS84.roundCoordinateValue(centerEpsg4326Unrounded[0]),
        WGS84.roundCoordinateValue(centerEpsg4326Unrounded[1]),
    ]
}
