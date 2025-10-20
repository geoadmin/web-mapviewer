import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { round } from '@swissgeo/numbers'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import {
    getDefaultValidationResponse,
    type ValidationResponse,
} from '@/router/storeSync/validation'
import usePositionStore, { CrossHairs, PositionStoreActions } from '@/store/modules/position.store'
import { isEnumValue } from '@/utils/utils'

interface ParsedCrosshair {
    crossHair?: CrossHairs
    crossHairPosition?: SingleCoordinate
}

function parseCrosshairParam(urlParamValue?: string): ParsedCrosshair {
    let crossHair: CrossHairs | undefined
    let crossHairPosition: SingleCoordinate | undefined

    if (urlParamValue) {
        const parts = urlParamValue.split(',')

        if (parts.length === 1) {
            crossHair = parseCrossHairValue(parts[0])
        } else if (parts.length === 3) {
            crossHair = parseCrossHairValue(parts[0])
            crossHairPosition = [parseFloat(parts[1]!), parseFloat(parts[2]!)]
        }
    }
    return {
        crossHair,
        crossHairPosition,
    }
}

function setValuesInStore(to: RouteLocationNormalizedGeneric, urlParamValue?: string) {
    const positionStore = usePositionStore()

    if (typeof urlParamValue !== 'string') {
        positionStore.setCrossHair({ crossHair: undefined }, STORE_DISPATCHER_ROUTER_PLUGIN)
    } else {
        const parsedValue = parseCrosshairParam(urlParamValue)

        if (!parsedValue.crossHair && !parsedValue.crossHairPosition) {
            positionStore.setCrossHair({ crossHair: undefined }, STORE_DISPATCHER_ROUTER_PLUGIN)
        } else if (parsedValue.crossHairPosition) {
            positionStore.setCrossHair(
                {
                    crossHair: parsedValue.crossHair ?? CrossHairs.marker,
                    crossHairPosition: parsedValue.crossHairPosition,
                },
                STORE_DISPATCHER_ROUTER_PLUGIN
            )
        }
    }
}

function extractValueFromStore(): string | undefined {
    const positionStore = usePositionStore()
    if (positionStore.crossHair) {
        let crossHairParamValue: string = positionStore.crossHair
        const { center, crossHairPosition } = positionStore
        if (
            crossHairPosition &&
            (center[0] !== crossHairPosition[0] || center[1] !== crossHairPosition[1])
        ) {
            crossHairParamValue += `,${crossHairPosition.map((val) => round(val, 2)).join(',')}`
        }
        return crossHairParamValue
    }
    return
}

function parseCrossHairValue(crosshair?: string): CrossHairs | undefined {
    if (!crosshair) {
        return undefined
    }
    if (isEnumValue<CrossHairs>(CrossHairs.bowl, crosshair)) {
        return CrossHairs.bowl
    }
    if (isEnumValue<CrossHairs>(CrossHairs.circle, crosshair)) {
        return CrossHairs.circle
    }
    if (isEnumValue<CrossHairs>(CrossHairs.cross, crosshair)) {
        return CrossHairs.cross
    }
    if (isEnumValue<CrossHairs>(CrossHairs.marker, crosshair)) {
        return CrossHairs.marker
    }
    if (isEnumValue<CrossHairs>(CrossHairs.point, crosshair)) {
        return CrossHairs.point
    }
    return undefined
}

/**
 * Possible use case for the crosshair param:
 *
 * 1. Crosshair=ID --> place the specified crosshair at the center of the map
 * 2. Crosshair=ID,x,y --> place the specified crosshair at the coordinates x,y
 * 3. Crosshair=,x,y --> place the default crosshair at the coordinates x,y
 */
function validateUrlInput(queryValue?: string): ValidationResponse {
    let isValid: boolean = false
    if (queryValue) {
        const parsedValue = parseCrosshairParam(queryValue)

        if (
            parsedValue.crossHair &&
            (!parsedValue.crossHairPosition ||
                parsedValue.crossHairPosition.every((coordinate) => !isNaN(coordinate)))
        ) {
            isValid = true
        }
        if (
            !parsedValue.crossHair &&
            parsedValue.crossHairPosition &&
            parsedValue.crossHairPosition.every((coordinate) => !isNaN(coordinate))
        ) {
            isValid = true
        }
    }
    return getDefaultValidationResponse(queryValue, isValid, 'crosshair')
}

const crosshairParamConfig = new UrlParamConfig<string>({
    urlParamName: 'crosshair',
    actionsToWatch: [PositionStoreActions.SetCrossHair],
    setValuesInStore,
    extractValueFromStore,
    keepInUrlWhenDefault: false,
    valueType: String,
    validateUrlInput,
})

export default crosshairParamConfig
