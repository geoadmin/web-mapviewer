import type { Layer } from "@/layers"

/** TODO this is currently a copy of the thing in src/utils of the mapviewer. Maybe belongs somewhere
 * else or maybe this should be de-generalized?
 * Is it used somewhere outside of layers?
 */
export default class ErrorMessage {
    msg: string
    params: Record<string, any>

    /**
     * @param {string} msg Translation key message
     * @param {any} params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg: string, params = null) {
        this.msg = msg
        this.params = params ?? {}
    }

    isEquals(object: ErrorMessage) {
        return (
            object instanceof ErrorMessage &&
            object.msg === this.msg &&
            Object.keys(this.params).length === Object.keys(object.params).length &&
            Object.keys(this.params).every((key) => this.params[key] === object.params[key])
        )
    }
}


export class InvalidLayerDataError extends Error {
    data: any
    constructor(message: string, data: any) {
        super(message)
        this.data = data
        this.name = 'InvalidLayerDataError'
    }
}


export const layerContainsErrorMessage = (layer: Layer, errorMessage: ErrorMessage):boolean => {
    if (layer.errorMessages) {
        return layer.errorMessages.has(errorMessage)
    }
    return false;
}

export const getFirstLayerErrorMessage = (layer: Layer): ErrorMessage | null => {
    if (layer.errorMessages) {
        return layer.errorMessages.values().next().value!
    }
    return null
}

export const addErrorMessageToLayer = (layer: Layer, errorMessage: ErrorMessage): void =>  {
    if (!layer.errorMessages) {
        layer.errorMessages = new Set()
    }
    layer.errorMessages.add(errorMessage)
    layer.hasError = true
}

export const removeErrorMessageFromLayer = (layer: Layer, errorMessage: ErrorMessage):void => {
    if (!layer.errorMessages) return;

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
    if (layer.errorMessages)  {
        layer.errorMessages.clear()
    }
    layer.hasError = false
}
