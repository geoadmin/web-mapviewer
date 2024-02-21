import axios from 'axios'

import { API_SERVICES_BASE_URL } from '@/config.js'
import log from '@/utils/logging.js'

/**
 * One parameter required to start a print job.
 *
 * This is where information about print capabilities for a specific layout will be stored (inside
 * the clientInfo object), e.g. which scales can be used on the map, available DPIs, etc...
 */
export class PrintLayoutAttribute {
    constructor(name, type, defaultValue = null, clientParams = null, clientInfo = null) {
        this.name = name
        this.type = type
        this.defaultValue = defaultValue
        this.clientParams = clientParams
        this.clientInfo = clientInfo
        this.value = defaultValue
    }

    /**
     * Flag telling of this layout attribute must be filled before sending a print job with its
     * layout
     *
     * @returns {boolean}
     */
    get isRequired() {
        return this.defaultValue === null
    }

    /**
     * Flag telling if this layout attribute is valid, and ready to be sent to the backend
     *
     * @returns {boolean}
     */
    get isValid() {
        return this.defaultValue !== null || this.value !== null
    }

    /**
     * Returns all the scales defined in this attribute, if a clientInfo object is present. It will
     * return an empty array if no clientInfo is defined.
     *
     * @returns {Number[]}
     */
    get scales() {
        return this.clientInfo?.scales || []
    }
}

/** Representation of a layout available to be printed on our service-print3 backend */
export class PrintLayout {
    /**
     * @param {String} name
     * @param {PrintLayoutAttribute} attributes
     */
    constructor(name, ...attributes) {
        this.name = name
        this.attributes = attributes.filter(
            (attribute) => attribute instanceof PrintLayoutAttribute
        )
    }

    /**
     * Flag telling of this print layout can be sent to the backend. Meaning all its attributes have
     * a valid value.
     *
     * @returns {boolean}
     */
    get isReadyToPrint() {
        return !this.attributes.some((attribute) => !attribute.isValid)
    }

    /**
     * Will returns all scales defined in the "map" attribute. Will return an empty array if no
     * "map" attribute is found, or if it doesn't contain any scale.
     *
     * @returns {Number[]}
     */
    get scales() {
        return this.attributes.find((attribute) => attribute.name === 'map')?.scales || []
    }
}

/** @returns Promise<PrintLayout[]> */
export function readPrintCapabilities() {
    return new Promise((resolve, reject) => {
        axios
            .get(`${API_SERVICES_BASE_URL}print3/print/default/capabilities.json`)
            .then((response) => response.data)
            .then((capabilities) => {
                resolve(
                    capabilities?.layouts.map((layout) => {
                        return new PrintLayout(
                            layout.name,
                            ...layout.attributes.map((attribute) => {
                                return new PrintLayoutAttribute(
                                    attribute.name,
                                    attribute.type,
                                    attribute.default,
                                    attribute.clientParams,
                                    attribute.clientInfo
                                )
                            })
                        )
                    })
                )
            })
            .catch((error) => {
                log.error('Error while loading print capabilities', error)
                reject(error)
            })
    })
}
