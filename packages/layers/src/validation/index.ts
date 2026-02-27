import type { ErrorMessage, WarningMessage } from '@swissgeo/log/Message'

import type { Layer } from '@/types'

export class InvalidLayerDataError extends Error {
    data: unknown
    constructor(message: string, data: unknown) {
        super(message)
        this.data = data
        this.name = 'InvalidLayerDataError'
    }
}

export const layerContainsErrorMessage = (layer: Layer, errorMessage: ErrorMessage): boolean => {
    if (layer.errorMessages) {
        return layer.errorMessages.some((error) => error.isEqual(errorMessage))
    }
    return false
}

export const getFirstErrorMessage = (layer: Layer): ErrorMessage | undefined => {
    if (layer.errorMessages && layer.errorMessages.length > 0) {
        return layer.errorMessages[0]
    }
    return
}

export const addErrorMessageToLayer = (layer: Layer, errorMessage: ErrorMessage): void => {
    if (!layer.errorMessages) {
        layer.errorMessages = []
    }
    if (!layerContainsErrorMessage(layer, errorMessage)) {
        layer.errorMessages.push(errorMessage)
        layer.hasError = true
    }
}

export const removeErrorMessageFromLayer = (layer: Layer, errorMessage: ErrorMessage): void => {
    if (!layer.errorMessages || !layerContainsErrorMessage(layer, errorMessage)) {
        return
    }
    layer.errorMessages = layer.errorMessages.filter((error) => error.isEqual(errorMessage))
    layer.hasError = layer.errorMessages.length > 0
}

export const clearErrorMessages = (layer: Layer): void => {
    if (layer.errorMessages) {
        layer.errorMessages = []
    }
    layer.hasError = false
}

export const layerContainsWarningMessage = (
    layer: Layer,
    warningMessage: WarningMessage
): boolean => {
    if (layer.warningMessages) {
        return layer.warningMessages.some((warning) => !warning.isEqual(warningMessage))
    }
    return false
}

export const getFirstWarningMessage = (layer: Layer): WarningMessage | undefined => {
    if (layer.warningMessages && layer.warningMessages.length > 0) {
        return layer.warningMessages[0]
    }
    return
}

export const addWarningMessageToLayer = (layer: Layer, warningMessage: WarningMessage): void => {
    if (!layer.warningMessages) {
        layer.warningMessages = []
    }
    if (!layerContainsWarningMessage(layer, warningMessage)) {
        layer.warningMessages.push(warningMessage)
        layer.hasWarning = true
    }
}

export const removeWarningMessageFromLayer = (
    layer: Layer,
    warningMessage: WarningMessage
): void => {
    if (!layer.warningMessages || !layerContainsWarningMessage(layer, warningMessage)) {
        return
    }

    layer.warningMessages = layer.warningMessages.filter(
        (warning) => !warning.isEqual(warningMessage)
    )
    layer.hasWarning = layer.warningMessages.length > 0
}

export const clearWarningMessages = (layer: Layer): void => {
    layer.warningMessages = []
    layer.hasWarning = false
}

/**
 * WMS or WMTS Capabilities Error
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 *
 * @property message Technical english message
 * @property key I18n translation key for user message
 * @property cause Optional cause of the error
 */
export class CapabilitiesError extends Error {
    key?: string

    constructor(message: string, options: {key?: string, cause?: unknown} = {}) {
        super(message, { cause: options.cause })
        this.name = 'CapabilitiesError'
        this.key = options.key
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
export const validateLayerProp = (value: Record<string, unknown>): boolean => {
    const requiredProps = ['id', 'type', 'baseUrl', 'name']
    for (const prop of requiredProps) {
        if (!(prop in value)) {
            return false
        }
    }
    return true
}
