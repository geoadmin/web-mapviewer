import { LV03, LV95, WEBMERCATOR } from '@/utils/coordinateSystems'
import { get as getProjection } from 'ol/proj'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

/**
 * Proj4 comes with [EPSG:4326]{@link https://epsg.io/4326} as default projection.
 *
 * This adds the two Swiss projections ([LV95/EPSG:2056]{@link https://epsg.io/2056} and
 * [LV03/EPSG:21781]{@link https://epsg.io/21781}) and metric Web Mercator
 * ([EPSG:3857]{@link https://epsg.io/3857}) definitions to proj4
 */
const setupProj4 = () => {
    proj4.defs(
        WEBMERCATOR.epsg,
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs'
    )
    proj4.defs(
        LV95.epsg,
        '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
    )
    proj4.defs(
        LV03.epsg,
        '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
    )

    // registering all "custom" projection with OpenLayers as well
    register(proj4)

    const proj2056 = getProjection(LV95.epsg)
    proj2056.setExtent([2420000, 1030000, 2900000, 1350000])
    const proj21781 = getProjection(LV03.epsg)
    proj21781.setExtent([420000, 30000, 900000, 350000])
}

export default setupProj4
