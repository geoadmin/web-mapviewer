import type { Layer } from '@/layers'

/**
 * TODO this is currently a copy of the thing in src/utils of the mapviewer. Maybe belongs somewhere
 * else or maybe this should be de-generalized? Is it used somewhere outside of layers?
 */
export class LayerMessage {
    msg: string
    params: Record<string, any>

    /**
     * @param {string} msg Translation key message
     * @param {any} params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg: string, params: Record<string, any> | null = null) {
        this.msg = msg
        this.params = params ?? {}
    }

    isEquals(object: LayerMessage) {
        return (
            object instanceof LayerMessage &&
            object.msg === this.msg &&
            Object.keys(this.params).length === Object.keys(object.params).length &&
            Object.keys(this.params).every((key) => this.params[key] === object.params[key])
        )
    }
}

export class LayerErrorMessage extends LayerMessage {}
export class LayerWarningMessage extends LayerMessage {}

export class InvalidLayerDataError extends Error {
    data: any
    constructor(message: string, data: any) {
        super(message)
        this.data = data
        this.name = 'InvalidLayerDataError'
    }
}

export const layerContainsErrorMessage = (
    layer: Layer,
    errorMessage: LayerErrorMessage
): boolean => {
    if (layer.errorMessages) {
        return layer.errorMessages.has(errorMessage)
    }
    return false
}

export const getFirstLayerErrorMessage = (layer: Layer): LayerErrorMessage | null => {
    if (layer.errorMessages) {
        return layer.errorMessages.values().next().value!
    }
    return null
}

export const addErrorMessageToLayer = (layer: Layer, errorMessage: LayerErrorMessage): void => {
    if (!layer.errorMessages) {
        layer.errorMessages = new Set()
    }
    layer.errorMessages.add(errorMessage)
    layer.hasError = true
}

export const removeErrorMessageFromLayer = (
    layer: Layer,
    errorMessage: LayerErrorMessage
): void => {
    if (!layer.errorMessages) return

    // We need to find the error message that equals to remove it
    for (const msg of layer.errorMessages) {
        if (msg.isEquals(errorMessage)) {
            layer.errorMessages.delete(msg)
            break
        }
    }
    layer.hasError = !!layer.errorMessages.size
}

export const clearLayerErrorMessages = (layer: Layer): void => {
    if (layer.errorMessages) {
        layer.errorMessages.clear()
    }
    layer.hasError = false
}

export const layerContainsWarningMessage = (layer: Layer, warningMessage: LayerWarningMessage) => {
    if (layer.warningMessages) {
        return layer.warningMessages.has(warningMessage)
    }
    return false
}

export const getFirstLayerWarningMessage = (layer: Layer) => {
    if (layer.warningMessages) {
        return layer.warningMessages.values().next().value!
    }
    return null
}

export const addWarningMessageToLayer = (
    layer: Layer,
    warningMessage: LayerWarningMessage
): void => {
    if (!layer.warningMessages) {
        layer.warningMessages = new Set()
    }
    layer.warningMessages.add(warningMessage)
    layer.hasWarning = true
}

export const removeWarningMessageFromLayer = (
    layer: Layer,
    warningMessage: LayerWarningMessage
) => {
    if (!layer.warningMessages) return

    // We need to find the error message that equals to remove it
    for (const msg of layer.warningMessages) {
        if (msg.isEquals(warningMessage)) {
            layer.warningMessages.delete(msg)
            break
        }
    }
    layer.hasWarning = !!layer.warningMessages.size
}

export const clearLayerWarningMessages = (layer: Layer) => {
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
