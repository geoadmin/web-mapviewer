import { MAP_VIEWS } from '@/router/viewNames'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { isNumber } from '@/utils/numberUtils'

/**
 * @param {String} param_name
 * @param {any} param_value
 * @param {Object} newQuery The modified query for the router
 */
const preProcessParam = (param_name, param_value, query) => {
    switch (param_name) {
        case '3d':
            // if the 3d flag is set, we need to ensure that we are in the webmercator projection
            if (
                ((typeof param_value === 'boolean' && param_value) ||
                    param_value === 'true' ||
                    param_value === null) &&
                (!isNumber(query.sr) || Number(query.sr) !== WEBMERCATOR.epsgNumber)
            ) {
                log.info(
                    `[URL Param pre process] 3d parameter found. Ensuring spatial reference system is set to web mercator`
                )
                query['sr'] = WEBMERCATOR.epsgNumber
            }
            break
        default:
            break
    }
}

const handleParams = async (query) => {
    // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
    // we will also transform legacy zoom level here (see comment below)
    const newQuery = structuredClone(query)
    for (const [param_name, param_value] of Object.entries(query)) {
        preProcessParam(param_name, param_value, newQuery)
    }
    return {
        query: newQuery,
        replace: true,
    }
}

/**
 * Go through all params that need pre-processing before being handed to the map view.
 *
 * For example : 3d needs the projection to be web mercator to work.
 *
 * @param {Router} router
 * @param {Store} store
 */
const parametersPreProcessRouterPlugin = (router, store) => {
    let wentThrough = false
    const unsubscribeRouter = router.beforeEach(async (to) => {
        if (MAP_VIEWS.includes(to.name)) {
            if (!wentThrough && store.state.app.isReady) {
                // We process the parameters once we are ready to enter the mapview. This means the legacy
                // router has finished his job.
                log.info(
                    `[URL Param Pre Process] : handling all parameters that require pre processing`
                )
                const newRoute = await handleParams(to.query)
                log.info(`[URL Param Pre Process] redirect to the converted params`, newRoute)
                log.debug(
                    `[URL Param Pre Process]: finished pre processing, preparing to deactivate the router.`
                )
                newRoute.name = to.name
                wentThrough = true
                return newRoute
            }

            if (wentThrough && store.state.app.isReady) {
                log.info('[URL Param Pre Process] Work is done, deactivating the router')
                unsubscribeRouter()

                log.debug('[URL Param Pre Process] exiting the parameter pre processor.')
                return true
            }
            return undefined
        }
        return undefined
    })
}

export default parametersPreProcessRouterPlugin
