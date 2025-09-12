/** @module geoadmin/coordinates */

import proj4 from 'proj4'

import { coordinatesUtils, type GeoadminCoordinatesUtils } from '@/coordinatesUtils'
import { extentUtils, type GeoadminExtentUtils } from '@/extentUtils'
import crs, { type GeoadminCoordinateCRS } from '@/proj'
import registerProj4 from '@/registerProj4'

export * from '@/proj'
export * from '@/registerProj4'
export * from '@/coordinatesUtils'
export * from '@/extentUtils'

// registering local instance of proj4, needed for some @swissgeo/coordinates functions
registerProj4(proj4)

interface GeoadminCoordinates extends GeoadminCoordinateCRS {
    coordinatesUtils: GeoadminCoordinatesUtils
    extentUtils: GeoadminExtentUtils
    registerProj4: typeof registerProj4
}

const coordinates: GeoadminCoordinates = { ...crs, coordinatesUtils, extentUtils, registerProj4 }
export default coordinates
