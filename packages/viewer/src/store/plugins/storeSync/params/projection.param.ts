import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { allCoordinateSystems } from '@swissgeo/coordinates'
import log from '@swissgeo/log'

import { DEFAULT_PROJECTION } from '@/config'
import usePositionStore from '@/store/modules/position'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/store/plugins/storeSync/validation'

const projectionParamConfig = new UrlParamConfig<number>({
    urlParamName: 'sr',
    actionsToWatch: ['setProjection'],
    setValuesInStore: (_: RouteLocationNormalizedGeneric, queryValue?: number) => {
        if (typeof queryValue === 'number') {
            const matchingProjection = allCoordinateSystems.find(
                (cs: CoordinateSystem) => cs.epsgNumber === queryValue
            )
            if (matchingProjection) {
                usePositionStore().setProjection(matchingProjection, STORE_DISPATCHER_ROUTER_PLUGIN)
            } else {
                log.error({
                    title: 'projection URL param',
                    messages: [
                        'Invalid/unsupported EPSG number received',
                        queryValue,
                        'projection change will be ignored',
                    ],
                })
            }
        }
    },
    extractValueFromStore: () => usePositionStore().projection.epsgNumber,
    keepInUrlWhenDefault: false,
    valueType: Number,
    // Unit tests somehow come to this line without having set DEFAULT_PROJECTION correctly.
    // So as defensive measure for this, we set a "just in case" default hard-coded value.
    defaultValue: DEFAULT_PROJECTION?.epsgNumber ?? 2056,
    validateUrlInput: (queryValue?: number) =>
        getDefaultValidationResponse(
            queryValue,
            !!queryValue &&
                allCoordinateSystems
                    .map((cs: CoordinateSystem) => cs.epsgNumber)
                    .includes(queryValue),
            'sr'
        ),
})

export default projectionParamConfig
