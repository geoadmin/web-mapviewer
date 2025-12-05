/** @module swissgeo/coordinates */

import proj4 from 'proj4'

import { coordinatesUtils, type SwissGeoCoordinatesUtils } from '@/coordinatesUtils'
import { extentUtils, type SwissGeoExtentUtils } from '@/extentUtils'
import crs, { type SwissGeoCoordinateCRS } from '@/proj'
import registerProj4 from '@/registerProj4'

export * from '@/proj'
export * from '@/registerProj4'
export * from '@/coordinatesUtils'
export * from '@/extentUtils'

// registering local instance of proj4, needed for some @swissgeo/coordinates functions
registerProj4(proj4)

interface SwissGeoCoordinates extends SwissGeoCoordinateCRS {
    coordinatesUtils: SwissGeoCoordinatesUtils
    extentUtils: SwissGeoExtentUtils
    registerProj4: typeof registerProj4
}

const coordinates: SwissGeoCoordinates = { ...crs, coordinatesUtils, extentUtils, registerProj4 }
export default coordinates
