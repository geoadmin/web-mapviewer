/** @module ol/xml */
import { extend } from 'ol/array'

/**
 * When using {@link module:ol/xml.makeChildAppender} or {@link module:ol/xml.makeSimpleNodeFactory},
 * the top `objectStack` item needs to have this structure.
 *
 * @typedef {Object} NodeStackItem
 * @property {Element} node Node.
 */

/** @typedef {function(Element, ( any )[]): void} Parser */

/** @typedef {function(Element,  any , ( any )[]): void} Serializer */

/** @type {string} */
export const XML_SCHEMA_INSTANCE_URI = 'http://www.w3.org/2001/XMLSchema-instance'

/**
 * @param {string} namespaceURI Namespace URI.
 * @param {string} qualifiedName Qualified name.
 * @returns {Element} Node.
 */
export function createElementNS(namespaceURI, qualifiedName) {
    return getDocument().createElementNS(namespaceURI, qualifiedName)
}

/**
 * Recursively grab all text content of child nodes into a single string.
 *
 * @param {Node} node Node.
 * @param {boolean} normalizeWhitespace Normalize whitespace: remove all line breaks.
 * @returns {string} All text content.
 * @api
 */
export function getAllTextContent(node, normalizeWhitespace) {
    return getAllTextContent_(node, normalizeWhitespace, []).join('')
}

/**
 * Recursively grab all text content of child nodes into a single string.
 *
 * @private
 * @param {Node} node Node.
 * @param {boolean} normalizeWhitespace Normalize whitespace: remove all line breaks.
 * @param {string[]} accumulator Accumulator.
 * @returns {string[]} Accumulator.
 */
export function getAllTextContent_(node, normalizeWhitespace, accumulator) {
    if (node.nodeType == Node.CDATA_SECTION_NODE || node.nodeType == Node.TEXT_NODE) {
        if (normalizeWhitespace) {
            accumulator.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''))
        } else {
            accumulator.push(node.nodeValue)
        }
    } else {
        let n
        for (n = node.firstChild; n; n = n.nextSibling) {
            getAllTextContent_(n, normalizeWhitespace, accumulator)
        }
    }
    return accumulator
}

/**
 * @param {Object} object Object.
 * @returns {boolean} Is a document.
 */
export function isDocument(object) {
    return 'documentElement' in object
}

/**
 * @param {Element} node Node.
 * @param {string | null} namespaceURI Namespace URI.
 * @param {string} name Attribute name.
 * @returns {string} Value
 */
export function getAttributeNS(node, namespaceURI, name) {
    return node.getAttributeNS(namespaceURI, name) || ''
}

/**
 * Parse an XML string to an XML Document.
 *
 * @param {string} xml XML.
 * @returns {Document} Document.
 * @api
 */
export function parse(xml) {
    return new DOMParser().parseFromString(xml, 'application/xml')
}

/**
 * Make an array extender function for extending the array at the top of the object stack.
 *
 * @template T
 * @param {function(this: T, Node, ( any )[]): (( any )[]|undefined)} valueReader Value reader.
 * @param {T} [thisArg] The object to use as `this` in `valueReader`.
 * @returns {Parser} Parser.
 */
export function makeArrayExtender(valueReader, thisArg) {
    return (
        /**
         * @param {Node} node Node.
         * @param {any[]} objectStack Object stack.
         */
        function (node, objectStack) {
            const value = valueReader.call(
                thisArg !== undefined ? thisArg : this,
                node,
                objectStack
            )
            if (value !== undefined) {
                const array = /** @type {any[]} */ (objectStack[objectStack.length - 1])
                extend(array, value)
            }
        }
    )
}

/**
 * Make an array pusher function for pushing to the array at the top of the object stack.
 *
 * @template T
 * @param {function(this: T, Element, ( any )[]):  any} valueReader Value reader.
 * @param {T} [thisArg] The object to use as `this` in `valueReader`.
 * @returns {Parser} Parser.
 */
export function makeArrayPusher(valueReader, thisArg) {
    return (
        /**
         * @param {Element} node Node.
         * @param {any[]} objectStack Object stack.
         */
        function (node, objectStack) {
            const value = valueReader.call(
                thisArg !== undefined ? thisArg : this,
                node,
                objectStack
            )
            if (value !== undefined) {
                const array = /** @type {any[]} */ (objectStack[objectStack.length - 1])
                array.push(value)
            }
        }
    )
}

/**
 * Make an object stack replacer function for replacing the object at the top of the stack.
 *
 * @template T
 * @param {function(this: T, Node, ( any )[]):  any} valueReader Value reader.
 * @param {T} [thisArg] The object to use as `this` in `valueReader`.
 * @returns {Parser} Parser.
 */
export function makeReplacer(valueReader, thisArg) {
    return (
        /**
         * @param {Node} node Node.
         * @param {any[]} objectStack Object stack.
         */
        function (node, objectStack) {
            const value = valueReader.call(
                thisArg !== undefined ? thisArg : this,
                node,
                objectStack
            )
            if (value !== undefined) {
                objectStack[objectStack.length - 1] = value
            }
        }
    )
}

/**
 * Make an object property pusher function for adding a property to the object at the top of the
 * stack.
 *
 * @template T
 * @param {function(this: T, Element, ( any )[]):  any} valueReader Value reader.
 * @param {string} [property] Property.
 * @param {T} [thisArg] The object to use as `this` in `valueReader`.
 * @returns {Parser} Parser.
 */
export function makeObjectPropertyPusher(valueReader, property, thisArg) {
    return (
        /**
         * @param {Element} node Node.
         * @param {any[]} objectStack Object stack.
         */
        function (node, objectStack) {
            const value = valueReader.call(
                thisArg !== undefined ? thisArg : this,
                node,
                objectStack
            )
            if (value !== undefined) {
                const object = /** @type {!Object} */ (objectStack[objectStack.length - 1])
                const name = property !== undefined ? property : node.localName
                let array
                if (name in object) {
                    array = object[name]
                } else {
                    array = []
                    object[name] = array
                }
                array.push(value)
            }
        }
    )
}

/**
 * Make an object property setter function.
 *
 * @template T
 * @param {function(this: T, Element, ( any )[]):  any} valueReader Value reader.
 * @param {string} [property] Property.
 * @param {T} [thisArg] The object to use as `this` in `valueReader`.
 * @returns {Parser} Parser.
 */
export function makeObjectPropertySetter(valueReader, property, thisArg) {
    return (
        /**
         * @param {Element} node Node.
         * @param {any[]} objectStack Object stack.
         */
        function (node, objectStack) {
            const value = valueReader.call(
                thisArg !== undefined ? thisArg : this,
                node,
                objectStack
            )
            if (value !== undefined) {
                const object = /** @type {!Object} */ (objectStack[objectStack.length - 1])
                const name = property !== undefined ? property : node.localName
                object[name] = value
            }
        }
    )
}

/**
 * Create a serializer that appends nodes written by its `nodeWriter` to its designated parent. The
 * parent is the `node` of the {@link module:ol/xml~NodeStackItem} at the top of the `objectStack`.
 *
 * @template T, V
 * @param {function(this: T, Node, V, ( any )[]): void} nodeWriter Node writer.
 * @param {T} [thisArg] The object to use as `this` in `nodeWriter`.
 * @returns {Serializer} Serializer.
 */
export function makeChildAppender(nodeWriter, thisArg) {
    return function (node, value, objectStack) {
        nodeWriter.call(thisArg !== undefined ? thisArg : this, node, value, objectStack)
        const parent = /** @type {NodeStackItem} */ (objectStack[objectStack.length - 1])
        const parentNode = parent.node
        parentNode.appendChild(node)
    }
}

/**
 * Create a serializer that calls the provided `nodeWriter` from {@link module:ol/xml.serialize}.
 * This can be used by the parent writer to have the `nodeWriter` called with an array of values
 * when the `nodeWriter` was designed to serialize a single item. An example would be a LineString
 * geometry writer, which could be reused for writing MultiLineString geometries.
 *
 * @template T, V
 * @param {function(this: T, Element, V, ( any )[]): void} nodeWriter Node writer.
 * @param {T} [thisArg] The object to use as `this` in `nodeWriter`.
 * @returns {Serializer} Serializer.
 */
export function makeArraySerializer(nodeWriter, thisArg) {
    let serializersNS, nodeFactory
    return function (node, value, objectStack) {
        if (serializersNS === undefined) {
            serializersNS = {}
            const serializers = {}
            serializers[node.localName] = nodeWriter
            serializersNS[node.namespaceURI] = serializers
            nodeFactory = makeSimpleNodeFactory(node.localName)
        }
        serialize(serializersNS, nodeFactory, value, objectStack)
    }
}

/**
 * Create a node factory which can use the `keys` passed to {@link module:ol/xml.serialize} or
 * {@link module:ol/xml.pushSerializeAndPop} as node names, or a fixed node name. The namespace of
 * the created nodes can either be fixed, or the parent namespace will be used.
 *
 * @param {string} [fixedNodeName] Fixed node name which will be used for all created nodes. If not
 *   provided, the 3rd argument to the resulting node factory needs to be provided and will be the
 *   nodeName.
 * @param {string} [fixedNamespaceURI] Fixed namespace URI which will be used for all created nodes.
 *   If not provided, the namespace of the parent node will be used.
 * @returns {function( any , ( any )[], string=): (Node|undefined)} Node factory.
 */
export function makeSimpleNodeFactory(fixedNodeName, fixedNamespaceURI) {
    return (
        /**
         * @param {any} value Value.
         * @param {any[]} objectStack Object stack.
         * @param {string} [newNodeName] Node name.
         * @returns {Node} Node.
         */
        function (value, objectStack, newNodeName) {
            const context = /** @type {NodeStackItem} */ (objectStack[objectStack.length - 1])
            const node = context.node
            let nodeName = fixedNodeName
            if (nodeName === undefined) {
                nodeName = newNodeName
            }

            const namespaceURI =
                fixedNamespaceURI !== undefined ? fixedNamespaceURI : node.namespaceURI
            return createElementNS(namespaceURI, /** @type {string} */ (nodeName))
        }
    )
}

/**
 * A node factory that creates a node using the parent's `namespaceURI` and the `nodeName` passed by
 * {@link module:ol/xml.serialize} or {@link module:ol/xml.pushSerializeAndPop} to the node factory.
 *
 * @constant
 * @type {function( any , ( any )[], string=): (Node|undefined)}
 */
export const OBJECT_PROPERTY_NODE_FACTORY = makeSimpleNodeFactory()

/**
 * Create an array of `values` to be used with {@link module:ol/xml.serialize} or
 * {@link module:ol/xml.pushSerializeAndPop}, where `orderedKeys` has to be provided as `key`
 * argument.
 *
 * @param {Object<string, any>} object Key-value pairs for the sequence. Keys can be a subset of the
 *   `orderedKeys`.
 * @param {string[]} orderedKeys Keys in the order of the sequence.
 * @returns {any[]} Values in the order of the sequence. The resulting array has the same length as
 *   the `orderedKeys` array. Values that are not present in `object` will be `undefined` in the
 *   resulting array.
 */
export function makeSequence(object, orderedKeys) {
    const length = orderedKeys.length
    const sequence = new Array(length)
    for (let i = 0; i < length; ++i) {
        sequence[i] = object[orderedKeys[i]]
    }
    return sequence
}

/**
 * Create a namespaced structure, using the same values for each namespace. This can be used as a
 * starting point for versioned parsers, when only a few values are version specific.
 *
 * @template T
 * @param {string[]} namespaceURIs Namespace URIs.
 * @param {T} structure Structure.
 * @param {Object<string, T>} [structureNS] Namespaced structure to add to.
 * @returns {Object<string, T>} Namespaced structure.
 */
export function makeStructureNS(namespaceURIs, structure, structureNS) {
    structureNS = structureNS !== undefined ? structureNS : {}
    let i, ii
    for (i = 0, ii = namespaceURIs.length; i < ii; ++i) {
        structureNS[namespaceURIs[i]] = structure
    }
    return structureNS
}

/**
 * Parse a node using the parsers and object stack.
 *
 * @param {Object<string, Object<string, Parser>>} parsersNS Parsers by namespace.
 * @param {Element} node Node.
 * @param {any[]} objectStack Object stack.
 * @param {any} [thisArg] The object to use as `this`.
 */
export function parseNode(parsersNS, node, objectStack, thisArg) {
    let count = 0
    let n
    for (n = node.firstElementChild; n; n = n.nextElementSibling) {
        console.error('Start parseNode: ', node.localName, objectStack[objectStack.length - 1])
        const parsers = parsersNS[n.namespaceURI]
        if (parsers !== undefined) {
            const parser = parsers[n.localName]
            console.error('Loop parseNode: ', node.localName, ' iteration: ', n.localName, node)
            if (parser !== undefined) {
                parser.call(thisArg, n, objectStack)
                //console.error(
                //    count,
                //    'after call: ',
                //    objectStack[objectStack.length - 1]['flatCoordinates']
                //)
            }
        }
        count = count + 1
        console.error('End parseNode: ', node.localName, objectStack[objectStack.length - 1])
    }
}

/**
 * Push an object on top of the stack, parse and return the popped object.
 *
 * @template T
 * @param {T} object Object.
 * @param {Object<string, Object<string, Parser>>} parsersNS Parsers by namespace.
 * @param {Element} node Node.
 * @param {any[]} objectStack Object stack.
 * @param {any} [thisArg] The object to use as `this`.
 * @returns {T} Object.
 */
export function pushParseAndPop(object, parsersNS, node, objectStack, thisArg) {
    objectStack.forEach((object) => {
        if (object['flatCoordinates']) {
            console.error(
                'pushParseAndPop1 flatCoordinates: ',
                node.localName,
                object['flatCoordinates']
            )
        }
    })

    //do what you need here

    objectStack.push(object)
    console.error('pushParseAndPop: ', object)
    parseNode(parsersNS, node, objectStack, thisArg)
    objectStack.forEach((object) => {
        if (object['flatCoordinates']) {
            console.error(
                'pushParseAndPop2 flatCoordinates: ',
                node.localName,
                object['flatCoordinates']
            )
        }
    })
    return /** @type {T} */ (objectStack.pop())
}

/**
 * Walk through an array of `values` and call a serializer for each value.
 *
 * @template T
 * @param {Object<string, Object<string, Serializer>>} serializersNS Namespaced serializers.
 * @param {function(this: T,  any , ( any )[], (string|undefined)): (Node|undefined)} nodeFactory
 *   Node factory. The `nodeFactory` creates the node whose namespace and name will be used to choose
 *   a node writer from `serializersNS`. This separation allows us to decide what kind of node to
 *   create, depending on the value we want to serialize. An example for this would be different
 *   geometry writers based on the geometry type.
 * @param {any[]} values Values to serialize. An example would be an array of
 *   {@link module:ol/Feature~Feature} instances.
 * @param {any[]} objectStack Node stack.
 * @param {string[]} [keys] Keys of the `values`. Will be passed to the `nodeFactory`. This is used
 *   for serializing object literals where the node name relates to the property key. The array
 *   length of `keys` has to match the length of `values`. For serializing a sequence, `keys`
 *   determines the order of the sequence.
 * @param {T} [thisArg] The object to use as `this` for the node factory and serializers.
 */
export function serialize(serializersNS, nodeFactory, values, objectStack, keys, thisArg) {
    const length = (keys !== undefined ? keys : values).length
    let value, node
    for (let i = 0; i < length; ++i) {
        value = values[i]
        if (value !== undefined) {
            node = nodeFactory.call(
                thisArg !== undefined ? thisArg : this,
                value,
                objectStack,
                keys !== undefined ? keys[i] : undefined
            )
            if (node !== undefined) {
                serializersNS[node.namespaceURI][node.localName].call(
                    thisArg,
                    node,
                    value,
                    objectStack
                )
            }
        }
    }
}

/**
 * @template O, T
 * @param {O} object Object.
 * @param {Object<string, Object<string, Serializer>>} serializersNS Namespaced serializers.
 * @param {function(this: T,  any , ( any )[], (string|undefined)): (Node|undefined)} nodeFactory
 *   Node factory. The `nodeFactory` creates the node whose namespace and name will be used to choose
 *   a node writer from `serializersNS`. This separation allows us to decide what kind of node to
 *   create, depending on the value we want to serialize. An example for this would be different
 *   geometry writers based on the geometry type.
 * @param {any[]} values Values to serialize. An example would be an array of
 *   {@link module:ol/Feature~Feature} instances.
 * @param {any[]} objectStack Node stack.
 * @param {string[]} [keys] Keys of the `values`. Will be passed to the `nodeFactory`. This is used
 *   for serializing object literals where the node name relates to the property key. The array
 *   length of `keys` has to match the length of `values`. For serializing a sequence, `keys`
 *   determines the order of the sequence.
 * @param {T} [thisArg] The object to use as `this` for the node factory and serializers.
 * @returns {O | undefined} Object.
 */
export function pushSerializeAndPop(
    object,
    serializersNS,
    nodeFactory,
    values,
    objectStack,
    keys,
    thisArg
) {
    objectStack.push(object)
    serialize(serializersNS, nodeFactory, values, objectStack, keys, thisArg)
    return /** @type {O | undefined} */ (objectStack.pop())
}

let xmlSerializer_ = undefined

/**
 * Register a XMLSerializer. Can be used to inject a XMLSerializer where there is no globally
 * available implementation.
 *
 * @param {XMLSerializer} xmlSerializer A XMLSerializer.
 * @api
 */
export function registerXMLSerializer(xmlSerializer) {
    xmlSerializer_ = xmlSerializer
}

/** @returns {XMLSerializer} The XMLSerializer. */
export function getXMLSerializer() {
    if (xmlSerializer_ === undefined && typeof XMLSerializer !== 'undefined') {
        xmlSerializer_ = new XMLSerializer()
    }
    return xmlSerializer_
}

let document_ = undefined

/**
 * Register a Document to use when creating nodes for XML serializations. Can be used to inject a
 * Document where there is no globally available implementation.
 *
 * @param {Document} document A Document.
 * @api
 */
export function registerDocument(document) {
    document_ = document
}

/**
 * Get a document that should be used when creating nodes for XML serializations.
 *
 * @returns {Document} The document.
 */
export function getDocument() {
    if (document_ === undefined && typeof document !== 'undefined') {
        document_ = document.implementation.createDocument('', '', null)
    }
    return document_
}
