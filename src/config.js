// loading and exporting all values from the .env file as ES6 importable variables

export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL
export const DATA_BASE_URL = process.env.VUE_APP_DATA_BASE_URL
export const WMTS_BASE_URL = process.env.VUE_APP_WMTS_BASE_URL
export const WMS_BASE_URL = process.env.VUE_APP_WMS_BASE_URL

// comes from https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/map/TileGrid.js
export const WMS_TILE_SIZE = 512 // px

// stuff that comes from https://github.com/geoadmin/mf-geoadmin3/blob/master/mk/config.mk
export const TILEGRID_ORIGIN = [558147.8, 6152731.53] // [2420000, 1350000] projected from EPSG:2056 to EPSG:3857
// resolutions in meter/pixel
export const TILEGRID_RESOLUTIONS = [
  4000,
  3750,
  3500,
  3250,
  3000,
  2750,
  2500,
  2250,
  2000,
  1750,
  1500,
  1250,
  1000,
  750,
  650,
  500,
  250,
  100,
  50,
  20,
  10,
  5,
  2.5,
  2,
  1.5,
  1,
  0.5,
  0.25,
  0.1,
]
