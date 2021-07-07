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
        'EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs'
    )
    proj4.defs(
        'EPSG:2056',
        '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
    )
    proj4.defs(
        'EPSG:21781',
        '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
    )
}

export default setupProj4
