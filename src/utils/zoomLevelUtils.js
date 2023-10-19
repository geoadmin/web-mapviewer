export const ZOOM_LEVEL_1_25000_MAP = 15.5

/** Conversion matrix from swisstopo LV95 zoom level to Web Mercator zoom level */
export const swisstopoPyramidZoomToMercatorZoomMatrix = {
    0: 7.35,
    1: 7.75,
    2: 8.75,
    3: 10,
    4: 11,
    5: 12.5,
    6: 13.5,
    7: 14.5,
    8: ZOOM_LEVEL_1_25000_MAP,
    9: 15.75,
    10: 16.7,
    11: 17.75,
    12: 18.75,
    13: 20,
    14: 21, // not defined at the moment
}

/**
 * Mapping between Swiss map zooms and Web Mercator zooms. Copy/pasted from [MapUtilsService.js on
 * mf-geoadmin3]{@link https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631}
 *
 * @param {String | Number} swisstopoPyramidZoom A zoom level as desribed in [our backend's
 *   doc]{@link http://api3.geo.admin.ch/services/sdiservices.html#wmts}
 * @returns {Number} A web-mercator zoom level (as described on [OpenStreetMap's
 *   wiki]{@link https://wiki.openstreetmap.org/wiki/Zoom_levels}) or null if the input is not a
 *   valid swisstopo pyramid zoom level
 */
export const translateSwisstopoPyramidZoomToMercatorZoom = (swisstopoPyramidZoom) => {
    const key = `${Math.floor(parseFloat(swisstopoPyramidZoom))}`
    if (Object.keys(swisstopoPyramidZoomToMercatorZoomMatrix).includes(key)) {
        return swisstopoPyramidZoomToMercatorZoomMatrix[key]
    }
    // if no matching zoom level was found, we return the one for the 1:25'000 map
    return ZOOM_LEVEL_1_25000_MAP
}

/**
 * Mapping between Web-Mercator zoom levels and Swiss map zooms. It will find the closest (ceil)
 * LV95 zoom level for the given mercator zoom
 *
 * @param {Number} mercatorZoom
 * @returns {Number}
 */
export const translateMercatorZoomToSwisstopoPyramidZoom = (mercatorZoom) => {
    // checking first if the mercator zoom level is within range of LV95 zoom we have available
    if (
        mercatorZoom >= swisstopoPyramidZoomToMercatorZoomMatrix[0] &&
        mercatorZoom <= swisstopoPyramidZoomToMercatorZoomMatrix[14]
    ) {
        return Object.values(swisstopoPyramidZoomToMercatorZoomMatrix).filter(
            (zoom) => zoom < mercatorZoom
        ).length
    }
    if (mercatorZoom < swisstopoPyramidZoomToMercatorZoomMatrix[0]) {
        return 0
    }
    if (mercatorZoom > swisstopoPyramidZoomToMercatorZoomMatrix[14]) {
        return 14
    }
    // if no matching zoom level was found, we return the one for the 1:25'000 map
    return 8
}
