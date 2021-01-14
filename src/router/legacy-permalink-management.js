import proj4 from 'proj4'
import { round } from '@/utils/numberUtils'
import { translateSwisstopoPyramidZoomToMercatorZoom } from '@/utils/zoomLevelUtils'

/**
 * @param {String} search
 * @returns {*}
 */
const parseLegacyParams = (search) => {
  const parts = search.match(/(\?|&)([^=]+)=([^&]+)/g)
  const params = {}
  if (parts && Array.isArray(parts)) {
    parts.forEach((part) => {
      const equalSignIndex = part.indexOf('=')
      const paramName = part.substr(1, equalSignIndex - 1)
      params[paramName] = part.substr(equalSignIndex + 1)
    })
  }
  return params
}

/**
 * @param {VueRouter} router
 */
const legacyPermalinkManagement = (router) => {
  let isFirstRequest = true
  const legacyParams =
    window.location && window.location.search ? parseLegacyParams(window.location.search) : null

  router.beforeEach((to, from, next) => {
    if (isFirstRequest) {
      // before the first request, we check out if we need to manage any legacy params (from the old viewer)
      isFirstRequest = false
      if (legacyParams) {
        // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
        // we will also transform legacy zoom level here (see comment below)
        const newQuery = { ...to.query }
        const legacyCoordinates = []
        Object.keys(legacyParams).forEach((param) => {
          let value
          let key = param
          switch (param) {
            // we need te re-evaluate LV95 zoom, as it was a zoom level tailor made for this projection
            // (and not made to cover the whole globe)
            case 'zoom':
              value = translateSwisstopoPyramidZoomToMercatorZoom(legacyParams[param])
              if (!value) {
                // if the value is not defined in the old zoom system, we use the 'default' zoom level
                // of 8 (which will roughly show the whole territory of Switzerland)
                value = 8
              }
              key = 'z'
              break

            // storing coordinate parts for later conversion
            case 'E':
              legacyCoordinates[0] = Number(legacyParams[param])
              break
            case 'N':
              legacyCoordinates[1] = Number(legacyParams[param])
              break

            // if no special work to do, we just copy past legacy params to the new viewer
            default:
              value = legacyParams[param]
          }

          // if a legacy coordinate (x,y or N,E) was used, we need to guess the SRS used (either LV95 or LV03)
          // and covert it back to EPSG:4326 (Mercator)
          if (legacyCoordinates.length === 2 && legacyCoordinates[0] && legacyCoordinates[1]) {
            const center = proj4('EPSG:2056', 'EPSG:4326', legacyCoordinates)
            newQuery['lon'] = round(center[0], 6)
            newQuery['lat'] = round(center[1], 6)
          }
          if (value) {
            newQuery[key] = value
          }
        })
        // removing old query part (new ones will be added by vue-router after the /# part of the URL)
        const urlWithoutQueryParam = window.location.href.substr(
          0,
          window.location.href.indexOf('?')
        )
        window.history.replaceState({}, document.title, urlWithoutQueryParam)
        next({
          name: 'MapView',
          query: newQuery,
        })
      } else {
        next()
      }
    } else {
      next()
    }
  })
}

export default legacyPermalinkManagement
