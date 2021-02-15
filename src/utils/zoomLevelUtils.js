export const ZOOM_LEVEL_1_25000_MAP = 15.5

/**
 * Conversion matrix from swisstopo LV95 zoom level to Web Mercator zoom level
 */
const swisstopoPyramidZoomToMercatorZoomMatrix = {
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
 * Mapping between Swiss map zooms and Web Mercator zooms.
 * Copy/pasted from [MapUtilsService.js on mf-geoadmin3]{@link https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631}
 * @param {String|Number} swisstopoPyramidZoom a zoom level as desribed in [our backend's doc]{@link http://api3.geo.admin.ch/services/sdiservices.html#wmts}
 * @returns {Number} a web-mercator zoom level (as described on [OpenStreetMap's wiki]{@link https://wiki.openstreetmap.org/wiki/Zoom_levels}) or null if the input is not a valid swisstopo pyramid zoom level
 */
export const translateSwisstopoPyramidZoomToMercatorZoom = (swisstopoPyramidZoom) => {
  const key = `${swisstopoPyramidZoom}`
  if (Object.keys(swisstopoPyramidZoomToMercatorZoomMatrix).includes(key)) {
    const webmercatorZoom = swisstopoPyramidZoomToMercatorZoomMatrix[key]
    // for now, as there's no client zoom implemented, it's pointless to zoom further than 18
    // TODO: as soon as client zoom is implemented, remove this default value
    if (webmercatorZoom > 18) {
      return 18
    }
    return webmercatorZoom
  }
  return null
}
