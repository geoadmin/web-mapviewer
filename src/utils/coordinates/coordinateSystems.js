import LV03CoordinateSystem from '@/utils/coordinates/LV03CoordinateSystem.class'
import LV95CoordinateSystem from '@/utils/coordinates/LV95CoordinateSystem.class'
import WebMercatorCoordinateSystem from '@/utils/coordinates/WebMercatorCoordinateSystem.class'
import WGS84CoordinateSystem from '@/utils/coordinates/WGS84CoordinateSystem.class'
import setupProj4 from '@/utils/setupProj4'

export const LV95 = new LV95CoordinateSystem()
export const LV03 = new LV03CoordinateSystem()
export const WGS84 = new WGS84CoordinateSystem()
export const WEBMERCATOR = new WebMercatorCoordinateSystem()

/** Representation of many (available in this app) projection systems */
const allCoordinateSystems = [LV95, LV03, WGS84, WEBMERCATOR]
setupProj4(allCoordinateSystems)
export default allCoordinateSystems
