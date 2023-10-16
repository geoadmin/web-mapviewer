import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'

// All bounds are coming from the epsg.io webste
// i.e. for LV95 from the page https://epsg.io/2056

export const LV95 = new CoordinateSystem(
    'LV95',
    'EPSG:2056',
    2056,
    'CH1903+ / LV95',
    '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
    new CoordinateSystemBounds(2485071.58, 2837119.8, 1074261.72, 1299941.79),
    1
)
export const LV03 = new CoordinateSystem(
    'LV03',
    'EPSG:21781',
    21781,
    'CH1903 / LV03',
    '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
    new CoordinateSystemBounds(485071.58, 837119.8, 74261.72, 299941.79),
    1
)
export const WGS84 = new CoordinateSystem(
    'WGS84',
    'EPSG:4326',
    4326,
    'WGS 84 (lat/lon)',
    '+proj=longlat +datum=WGS84 +no_defs +type=crs',
    new CoordinateSystemBounds(-180.0, 180.0, -90.0, 90.0),
    8,
    // center of LV95's extent transformed with epsg.io website
    [8.2394363, 46.8322597]
)
export const WEBMERCATOR = new CoordinateSystem(
    'WEBMERCATOR',
    'EPSG:3857',
    3857,
    'WebMercator',
    '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
    new CoordinateSystemBounds(-20037508.34, 20037508.34, -20048966.1, 20048966.1),
    8,
    // center of LV95's extent transformed with epsg.io website
    [917209.87, 5914737.43]
)

/**
 * Representation of many (available in this app) projection systems
 */
const allCoordinateSystems = [LV95, LV03, WGS84, WEBMERCATOR]
export default allCoordinateSystems
