import CoordinateSystem, {
    STANDARD_ZOOM_LEVEL_1_25000_MAP,
    SWISS_ZOOM_LEVEL_1_25000_MAP,
} from '@/proj/CoordinateSystem'
import LV03CoordinateSystem from '@/proj/LV03CoordinateSystem'
import LV95CoordinateSystem from '@/proj/LV95CoordinateSystem'
import { LV95_RESOLUTIONS, SWISSTOPO_TILEGRID_RESOLUTIONS } from '@/proj/SwissCoordinateSystem'
import WebMercatorCoordinateSystem from '@/proj/WebMercatorCoordinateSystem'
import WGS84CoordinateSystem from '@/proj/WGS84CoordinateSystem'

export const LV95: LV95CoordinateSystem = new LV95CoordinateSystem()
export const LV03: LV03CoordinateSystem = new LV03CoordinateSystem()
export const WGS84: WGS84CoordinateSystem = new WGS84CoordinateSystem()
export const WEBMERCATOR: WebMercatorCoordinateSystem = new WebMercatorCoordinateSystem()

export type * from '@/proj/CoordinatesChunk'

/** Representation of many (available in this app) projection systems */
export const allCoordinateSystems: CoordinateSystem[] = [LV95, LV03, WGS84, WEBMERCATOR]

const constants = {
    STANDARD_ZOOM_LEVEL_1_25000_MAP,
    SWISS_ZOOM_LEVEL_1_25000_MAP,
    LV95_RESOLUTIONS,
    SWISSTOPO_TILEGRID_RESOLUTIONS,
}

const crs = {
    LV95,
    LV03,
    WGS84,
    WEBMERCATOR,
    allCoordinateSystems,
}
export { crs, constants, CoordinateSystem }
export default crs
