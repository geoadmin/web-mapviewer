/** @module ol/format/xsd */
import { padNumber } from 'ol/string'
import { getAllTextContent, getDocument } from 'ol/xml'

/**
 * @param {Node} node Node.
 * @returns {boolean | undefined} Boolean.
 */
export function readBoolean(node) {
    console.error('readString')

    const s = getAllTextContent(node, false)
    return readBooleanString(s)
}

/**
 * @param {string} string String.
 * @returns {boolean | undefined} Boolean.
 */
export function readBooleanString(string) {
    console.error('readString')
    const m = /^\s*(true|1)|(false|0)\s*$/.exec(string)
    if (m) {
        return m[1] !== undefined || false
    }
    return undefined
}

/**
 * @param {Node} node Node.
 * @returns {number | undefined} DateTime in seconds.
 */
export function readDateTime(node) {
    const s = getAllTextContent(node, false)
    console.error('readDateTime: ', s)
    const dateTime = Date.parse(s)
    console.error('readDateTime: ', dateTime)
    return isNaN(dateTime) ? undefined : dateTime / 1000
}

/**
 * @param {Node} node Node.
 * @returns {number | undefined} Decimal.
 */
export function readDecimal(node) {
    console.error('readString')
    const s = getAllTextContent(node, false)
    console.error('readDecimal: ', s)
    console.error('readDecimal: ', readDecimalString(s))
    return readDecimalString(s)
}

/**
 * @param {string} string String.
 * @returns {number | undefined} Decimal.
 */
export function readDecimalString(string) {
    console.error('readString')
    // FIXME check spec
    const m = /^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(string)
    if (m) {
        return parseFloat(m[1])
    }
    return undefined
}

/**
 * @param {Node} node Node.
 * @returns {number | undefined} Non negative integer.
 */
export function readPositiveInteger(node) {
    console.error('readString')
    const s = getAllTextContent(node, false)
    return readNonNegativeIntegerString(s)
}

/**
 * @param {string} string String.
 * @returns {number | undefined} Non negative integer.
 */
export function readNonNegativeIntegerString(string) {
    console.error('readString')
    const m = /^\s*(\d+)\s*$/.exec(string)
    if (m) {
        return parseInt(m[1], 10)
    }
    return undefined
}

/**
 * @param {Node} node Node.
 * @returns {string | undefined} String.
 */
export function readString(node) {
    console.error('readString', getAllTextContent(node, false).trim())
    return getAllTextContent(node, false).trim()
}

/**
 * @param {Node} node Node to append a TextNode with the boolean to.
 * @param {boolean} bool Boolean.
 */
export function writeBooleanTextNode(node, bool) {
    console.error('readString')

    writeStringTextNode(node, bool ? '1' : '0')
}

/**
 * @param {Node} node Node to append a CDATA Section with the string to.
 * @param {string} string String.
 */
export function writeCDATASection(node, string) {
    console.error('readString')

    node.appendChild(getDocument().createCDATASection(string))
}

/**
 * @param {Node} node Node to append a TextNode with the dateTime to.
 * @param {number} dateTime DateTime in seconds.
 */
export function writeDateTimeTextNode(node, dateTime) {
    console.error('readString')

    const date = new Date(dateTime * 1000)
    const string =
        date.getUTCFullYear() +
        '-' +
        padNumber(date.getUTCMonth() + 1, 2) +
        '-' +
        padNumber(date.getUTCDate(), 2) +
        'T' +
        padNumber(date.getUTCHours(), 2) +
        ':' +
        padNumber(date.getUTCMinutes(), 2) +
        ':' +
        padNumber(date.getUTCSeconds(), 2) +
        'Z'
    node.appendChild(getDocument().createTextNode(string))
}

/**
 * @param {Node} node Node to append a TextNode with the decimal to.
 * @param {number} decimal Decimal.
 */
export function writeDecimalTextNode(node, decimal) {
    console.error('readString')

    const string = decimal.toPrecision()
    node.appendChild(getDocument().createTextNode(string))
}

/**
 * @param {Node} node Node to append a TextNode with the decimal to.
 * @param {number} nonNegativeInteger Non negative integer.
 */
export function writeNonNegativeIntegerTextNode(node, nonNegativeInteger) {
    console.error('readString')

    const string = nonNegativeInteger.toString()
    node.appendChild(getDocument().createTextNode(string))
}

/**
 * @param {Node} node Node to append a TextNode with the string to.
 * @param {string} string String.
 */
export function writeStringTextNode(node, string) {
    console.error('readString')

    node.appendChild(getDocument().createTextNode(string))
}
