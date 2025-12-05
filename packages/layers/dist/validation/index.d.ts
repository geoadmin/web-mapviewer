import { ErrorMessage, WarningMessage } from '@swissgeo/log/Message';
import { Layer } from '../types';
export declare class InvalidLayerDataError extends Error {
    data: unknown;
    constructor(message: string, data: unknown);
}
export declare const layerContainsErrorMessage: (layer: Layer, errorMessage: ErrorMessage) => boolean;
export declare const getFirstErrorMessage: (layer: Layer) => ErrorMessage | undefined;
export declare const addErrorMessageToLayer: (layer: Layer, errorMessage: ErrorMessage) => void;
export declare const removeErrorMessageFromLayer: (layer: Layer, errorMessage: ErrorMessage) => void;
export declare const clearErrorMessages: (layer: Layer) => void;
export declare const layerContainsWarningMessage: (layer: Layer, warningMessage: WarningMessage) => boolean;
export declare const getFirstWarningMessage: (layer: Layer) => WarningMessage | undefined;
export declare const addWarningMessageToLayer: (layer: Layer, warningMessage: WarningMessage) => void;
export declare const removeWarningMessageFromLayer: (layer: Layer, warningMessage: WarningMessage) => void;
export declare const clearWarningMessages: (layer: Layer) => void;
/**
 * WMS or WMTS Capabilities Error
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 *
 * @property {string} message Technical english message
 * @property {string} key I18n translation key for user message
 */
export declare class CapabilitiesError extends Error {
    key?: string;
    constructor(message: string, key?: string);
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
export declare const validateLayerProp: (value: Record<string, unknown>) => boolean;
