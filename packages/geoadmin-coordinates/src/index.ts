/** @module geoadmin/coordinates */

import proj4 from 'proj4'

import crs, { type GeoadminCoordinateCRS } from '@/proj'
import registerProj4 from '@/registerProj4'
import { coordinates as utils, type GeoadminCoordinatesUtils } from '@/utils'

export * from '@/proj'
export * from '@/registerProj4'
export * from '@/utils'

// registering local instance of proj4, needed for some @geoadmin/coordinates functions
registerProj4(proj4)

interface GeoadminCoordinates extends GeoadminCoordinateCRS {
    utils: GeoadminCoordinatesUtils
    registerProj4: typeof registerProj4
}

const coordinates: GeoadminCoordinates = { ...crs, utils, registerProj4 }
export default coordinates
