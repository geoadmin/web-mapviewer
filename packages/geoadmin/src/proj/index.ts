/** @module geoadmin/proj */

import proj4 from 'proj4'

import CoordinateSystem from '@/proj/CoordinateSystem'
import LV03CoordinateSystem from '@/proj/LV03CoordinateSystem'
import LV95CoordinateSystem from '@/proj/LV95CoordinateSystem'
import registerProj4 from '@/proj/registerProj4'
import WebMercatorCoordinateSystem from '@/proj/WebMercatorCoordinateSystem'
import WGS84CoordinateSystem from '@/proj/WGS84CoordinateSystem'

export {
    default as CoordinateSystem,
    STANDARD_ZOOM_LEVEL_1_25000_MAP,
    SWISS_ZOOM_LEVEL_1_25000_MAP,
} from '@/proj/CoordinateSystem'
export { default as CoordinateSystemBounds } from '@/proj/CoordinateSystemBounds'
export { default as CustomCoordinateSystem } from '@/proj/CustomCoordinateSystem'
export { default as LV03CoordinateSystem } from '@/proj/LV03CoordinateSystem'
export { default as LV95CoordinateSystem } from '@/proj/LV95CoordinateSystem'
export { default as registerProj4 } from '@/proj/registerProj4'
export { default as StandardCoordinateSystem } from '@/proj/StandardCoordinateSystem'
export {
    LV95_RESOLUTIONS,
    default as SwissCoordinateSystem,
    SWISSTOPO_TILEGRID_RESOLUTIONS,
} from '@/proj/SwissCoordinateSystem'
export { default as WebMercatorCoordinateSystem } from '@/proj/WebMercatorCoordinateSystem'
export { default as WGS84CoordinateSystem } from '@/proj/WGS84CoordinateSystem'

export const LV95: LV95CoordinateSystem = new LV95CoordinateSystem()
export const LV03: LV03CoordinateSystem = new LV03CoordinateSystem()
export const WGS84: WGS84CoordinateSystem = new WGS84CoordinateSystem()
export const WEBMERCATOR: WebMercatorCoordinateSystem = new WebMercatorCoordinateSystem()

/** Representation of many (available in this app) projection systems */
export const allCoordinateSystems: CoordinateSystem[] = [LV95, LV03, WGS84, WEBMERCATOR]

// registering local instance of proj4, needed for some geoadmin/proj functions
registerProj4(proj4)

export default allCoordinateSystems
