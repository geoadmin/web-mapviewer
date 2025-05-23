import { ErrorMessage, WarningMessage } from '@geoadmin/log/Message'

import type { Layer } from '@/types'

export class InvalidLayerDataError extends Error {
    data: any
    constructor(message: string, data: any) {
        super(message)
        this.data = data
        this.name = 'InvalidLayerDataError'
    }
}

export const layerContainsErrorMessage = (layer: Layer, errorMessage: ErrorMessage): boolean => {
    if (layer.errorMessages) {
        return layer.errorMessages.has(errorMessage)
    }
    return false
}

export const getFirstErrorMessage = (layer: Layer): ErrorMessage | undefined => {
    if (layer.errorMessages) {
        return layer.errorMessages.values().next()?.value as ErrorMessage
    }
    return
}

export const addErrorMessageToLayer = (layer: Layer, errorMessage: ErrorMessage): void => {
    if (!layer.errorMessages) {
        layer.errorMessages = new Set()
    }
    layer.errorMessages.add(errorMessage)
    layer.hasError = true
}

export const removeErrorMessageFromLayer = (layer: Layer, errorMessage: ErrorMessage): void => {
    if (!layer.errorMessages) {
        return
    }

    // We need to find the error message that equals to remove it
    for (const msg of layer.errorMessages) {
        if (msg.isEquals(errorMessage)) {
            layer.errorMessages.delete(msg)
            break
        }
    }
    layer.hasError = !!layer.errorMessages.size
}

export const clearErrorMessages = (layer: Layer): void => {
    if (layer.errorMessages) {
        layer.errorMessages.clear()
    }
    layer.hasError = false
}

export const layerContainsWarningMessage = (
    layer: Layer,
    warningMessage: WarningMessage
): boolean => {
    if (layer.warningMessages) {
        return layer.warningMessages.has(warningMessage)
    }
    return false
}

export const getFirstWarningMessage = (layer: Layer): WarningMessage | undefined => {
    if (layer.warningMessages) {
        return layer.warningMessages.values().next().value!
    }
    return
}

export const addWarningMessageToLayer = (layer: Layer, warningMessage: WarningMessage): void => {
    if (!layer.warningMessages) {
        layer.warningMessages = new Set()
    }
    layer.warningMessages.add(warningMessage)
    layer.hasWarning = true
}

export const removeWarningMessageFromLayer = (
    layer: Layer,
    warningMessage: WarningMessage
): void => {
    if (!layer.warningMessages) {
        return
    }

    // We need to find the error message that equals to remove it
    for (const msg of layer.warningMessages) {
        if (msg.isEquals(warningMessage)) {
            layer.warningMessages.delete(msg)
            break
        }
    }
    layer.hasWarning = !!layer.warningMessages.size
}

export const clearWarningMessages = (layer: Layer): void => {
    layer.warningMessages?.clear()
    layer.hasWarning = false
}

/**
 * WMS or WMTS Capabilities Error
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 *
 * @property {string} message Technical english message
 * @property {string} key I18n translation key for user message
 */
export class CapabilitiesError extends Error {
    key?: string

    constructor(message: string, key?: string) {
        super(message)
        this.name = 'CapabilitiesError'
        this.key = key
    }
}

/**
 * Validate a component prop for basic layer type
 *
 * In cases where we don't yet use TS in vue components, we can't check the props against the
 * interfaces. It used to be done with a instanceof AbstractLayer check. This function helps solving
 * that issue by checking for the very basic and absolutely necessary properties of a Layer object.
 * This should be good enough in the transition to TS to ensure that the provided property is indeed
 * an implementation of Layer
 *
 * @param value Any Object
 * @returns Boolean
 */
export const validateLayerProp = (value: Record<any, any>): boolean => {
    const requiredProps = ['id', 'type', 'baseUrl', 'name']
    for (const prop of requiredProps) {
        if (!(prop in value)) {
            return false
        }
    }
    return true
}
