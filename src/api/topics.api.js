import { API_BASE_URL } from '@/config'
import {
    getBackgroundLayerFromLegacyUrlParams,
    getLayersFromLegacyUrlParams,
} from '@/utils/legacyLayerParamUtils'
import log from '@/utils/logging'
import axios from 'axios'

/** Representation of a topic (a subset of layers to be shown to the user) */
export class Topic {
    /**
     * @param {String} id The id of the topic (unique)
     * @param {GeoAdminLayer[]} backgroundLayers The list of layers eligible for background when
     *   this topic is active
     * @param {GeoAdminLayer} defaultBackgroundLayer The layer that should be activated as
     *   background layer by default when this topic is selected
     * @param {GeoAdminLayer[]} layersToActivate All layers that should be added to the displayed
     *   layer (but not necessarily visible, that will depends on their state)
     */
    constructor(id, backgroundLayers, defaultBackgroundLayer, layersToActivate) {
        this.id = id
        this.backgroundLayers = [...backgroundLayers]
        this.defaultBackgroundLayer = defaultBackgroundLayer
        this.layersToActivate = [...layersToActivate]
    }
}

/** @enum */
export const topicTypes = {
    THEME: 'THEME',
    LAYER: 'LAYER',
}

/**
 * Element of a topic tree, can be a node (or theme) or a leaf (a layer)
 *
 * @abstract
 */
class TopicTreeItem {
    /**
     * @param {Number | String} id The ID of the node
     * @param {String} name The name of this node translated in the current lang
     * @param {topicTypes} type The type of this node, layer or theme
     */
    constructor(id, name, type) {
        this.id = id
        this.name = name
        this.type = type
    }
}

/** Node of a topic three containing more themes and/or a list of layers */
export class TopicTreeTheme extends TopicTreeItem {
    /**
     * @param {Number} id The ID of this node
     * @param {String} name The name of the theme, in the current lang
     * @param {TopicTreeItem[]} children All the children of this node (can be either layers or
     *   themes, all mixed together)
     */
    constructor(id, name, children) {
        super(id, name, topicTypes.THEME)
        this.children = [...children]
        this.showChildren = false
    }
}

/** A layer in the topic tree */
export class TopicTreeLayer extends TopicTreeItem {
    /**
     * @param {String} layerId The BOD layer ID of this layer
     * @param {String} name The name of this layer in the current lang
     */
    constructor(layerId, name) {
        super(layerId, name, topicTypes.LAYER)
        this.layerId = layerId
    }
}

/**
 * Reads the output of the topic tree endpoint, and creates all themes and layers object accordingly
 *
 * @param {Object} node The node for whom we are looking into
 * @returns {TopicTreeItem}
 */
const readTopicTreeRecursive = (node) => {
    if (node.category === 'topic') {
        const children = []
        node.children.forEach((topicChild) => {
            children.push(readTopicTreeRecursive(topicChild))
        })
        return new TopicTreeTheme(node.id, node.label, children)
    } else if (node.category === 'layer') {
        return new TopicTreeLayer(node.layerBodId, node.label)
    } else {
        log.error('unknown topic node type', node.category)
        return null
    }
}

/**
 * Loads the topic tree for a topic. This will be used to create the UI of the topic in the menu.
 *
 * @param {String} lang The lang in which to load the topic tree
 * @param {Topic} topic The topic we want to load the topic tree
 * @returns {Promise<TopicTreeItem[]>} A list of topic tree nodes
 */
export const loadTopicTreeForTopic = (lang, topic) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${API_BASE_URL}rest/services/${topic.id}/CatalogServer?lang=${lang}`)
            .then((response) => {
                const treeItems = []
                const topicRoot = response.data.results.root
                topicRoot.children.forEach((child) => {
                    treeItems.push(readTopicTreeRecursive(child))
                })
                resolve(treeItems)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

/**
 * Loads all topics (without their tree) from the backend. Those topics will already by filled with
 * the correct layer object, coming from the `layersConfig` param)
 *
 * @param {GeoAdminLayer[]} layersConfig All available layers for this app (the "layers config")
 * @returns {Promise<Topic[]>} All topics available for this app
 */
const loadTopicsFromBackend = (layersConfig) => {
    return new Promise((resolve, reject) => {
        if (!API_BASE_URL) {
            // this could happen if we are testing the app in unit tests, we simply reject and do nothing
            reject('API base URL is undefined')
        } else {
            const topics = []
            axios
                .get(`${API_BASE_URL}rest/services`)
                .then(({ data: rawTopics }) => {
                    if ('topics' in rawTopics) {
                        rawTopics.topics.forEach((rawTopic) => {
                            const {
                                id: topicId,
                                backgroundLayers: backgroundLayersId,
                                defaultBackground: defaultBackgroundLayerId,
                                plConfig: legacyUrlParams,
                            } = rawTopic
                            const backgroundLayers = layersConfig.filter(
                                (layer) => backgroundLayersId.indexOf(layer.getID()) !== -1
                            )
                            const backgroundLayerFromUrlParam =
                                getBackgroundLayerFromLegacyUrlParams(layersConfig, legacyUrlParams)
                            // first we get the background from the "plConfig" of the API response
                            let defaultBackground = backgroundLayerFromUrlParam
                            // checking if there was something in the "plConfig"
                            // null is a valid background as it is the void layer in our app
                            // so we have to exclude only the "undefined" value and fill this variable
                            // with what is in "defaultBackground" in this case
                            if (backgroundLayerFromUrlParam === undefined) {
                                defaultBackground = backgroundLayers.find(
                                    (layer) => layer.getID() === defaultBackgroundLayerId
                                )
                            }
                            const layersToActivate = [
                                ...getLayersFromLegacyUrlParams(layersConfig, legacyUrlParams),
                            ]
                            if (
                                Array.isArray(rawTopic.activatedLayers) &&
                                rawTopic.activatedLayers.length > 0
                            ) {
                                rawTopic.activatedLayers.forEach((layerId) => {
                                    let layer = layersConfig.find(
                                        (layer) => layer.getID() === layerId
                                    )
                                    if (layer) {
                                        // deep copy so that we can reassign values later on
                                        // (layers come from the Vuex store so it can't be modified directly)
                                        layer = Object.assign(
                                            Object.create(Object.getPrototypeOf(layer)),
                                            layer
                                        )
                                        // checking if the layer should be also visible
                                        layer.visible =
                                            Array.isArray(rawTopic.selectedLayers) &&
                                            rawTopic.selectedLayers.indexOf(layerId) !== -1
                                        layersToActivate.push(layer)
                                    }
                                })
                            }
                            topics.push(
                                new Topic(
                                    topicId,
                                    backgroundLayers,
                                    defaultBackground,
                                    layersToActivate
                                )
                            )
                        })
                    } else {
                        reject('Wrong API output structure')
                    }
                    resolve(topics)
                })
                .catch((error) => {
                    const message = 'Error while loading topics config from backend'
                    log.error(message, error)
                    reject(message)
                })
        }
    })
}

export default loadTopicsFromBackend
