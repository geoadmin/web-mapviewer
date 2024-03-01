import axios from 'axios'

import GeoAdminGroupOfLayers from '@/api/layers/GeoAdminGroupOfLayers.class'
import { API_BASE_URL } from '@/config'
import {
    getBackgroundLayerFromLegacyUrlParams,
    getLayersFromLegacyUrlParams,
} from '@/utils/legacyLayerParamUtils'
import log from '@/utils/logging'

/** Representation of a topic (a subset of layers to be shown to the user) */
export class Topic {
    /**
     * @param {String} id The id of the topic (unique)
     * @param {GeoAdminLayer[]} backgroundLayers The list of layers eligible for background when
     *   this topic is active
     * @param {GeoAdminLayer} defaultBackgroundLayer The layer that should be activated as
     *   background layer by default when this topic is selected
     * @param {GeoAdminLayer[]} layersToActivate All layers that should be added to the displayed
     *   layer (but not necessarily visible, that will depend on their state)
     */
    constructor(id, backgroundLayers, defaultBackgroundLayer, layersToActivate) {
        this.id = id
        this.backgroundLayers = [...backgroundLayers]
        this.defaultBackgroundLayer = defaultBackgroundLayer
        this.layersToActivate = [...layersToActivate]
    }
}

const gatherItemIdThatShouldBeOpened = (node) => {
    const ids = []
    node?.children?.forEach((child) => {
        ids.push(...gatherItemIdThatShouldBeOpened(child))
    })
    if (node?.selectedOpen) {
        ids.push(`${node.id}`)
    }
    return ids
}
/**
 * Reads the output of the topic tree endpoint, and creates all themes and layers object accordingly
 *
 * @param {Object} node The node for whom we are looking into
 * @param {GeoAdminLayer[]} availableLayers All layers available from the layers' config
 * @returns {GeoAdminLayer}
 */
const readTopicTreeRecursive = (node, availableLayers) => {
    if (node.category === 'topic') {
        const children = []
        node.children.forEach((topicChild) => {
            try {
                children.push(readTopicTreeRecursive(topicChild, availableLayers))
            } catch (err) {
                log.error(`Child ${topicChild.id} can't be loaded`, err)
            }
        })
        return new GeoAdminGroupOfLayers(`${node.id}`, node.label, children)
    } else if (node.category === 'layer') {
        const matchingLayer = availableLayers.find(
            (layer) => layer.technicalName === node.layerBodId || layer.id === node.layerBodId
        )
        if (matchingLayer) {
            return matchingLayer
        }
        throw new Error(`Layer with BOD ID ${node.layerBodId} not found in the layers config`)
    }
    throw new Error(`unknown topic node type : ${node.category}`)
}

/**
 * Loads the topic tree for a topic. This will be used to create the UI of the topic in the menu.
 *
 * @param {String} lang The lang in which to load the topic tree
 * @param {String} topicId The topic we want to load the topic tree
 * @param {GeoAdminLayer[]} layersConfig All available layers for this app (the "layers config")
 * @returns {Promise<{ layers: GeoAdminLayer[]; itemIdToOpen: String[] }>} A list of topic's layers
 */
export const loadTopicTreeForTopic = (lang, topicId, layersConfig) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`${API_BASE_URL}rest/services/${topicId}/CatalogServer?lang=${lang}`)
            .then((response) => {
                const treeItems = []
                const topicRoot = response.data.results.root
                topicRoot.children.forEach((child) => {
                    try {
                        treeItems.push(readTopicTreeRecursive(child, layersConfig))
                    } catch (err) {
                        log.error(`Error while loading Layer ${child.id} for Topic ${topicId}`, err)
                    }
                })
                const itemIdToOpen = gatherItemIdThatShouldBeOpened(topicRoot)
                resolve({ layers: treeItems, itemIdToOpen })
            })
            .catch((error) => {
                reject(error)
            })
    })
}

/**
 * Loads all topics (without their tree) from the backend.
 *
 * @returns {Promise<{ topics: [] }>} Raw topics from backend
 */
export async function loadTopics() {
    try {
        const response = await axios.get(`${API_BASE_URL}rest/services`)
        return response.data
    } catch (error) {
        log.error(`Failed to load topics from backend`, error)
        return {}
    }
}

/**
 * Parse topics from backend response.
 *
 * The topics will already by filled with the correct layer object, coming from the `layersConfig`
 * param
 *
 * @param {GeoAdminLayer[]} layersConfig All available layers for this app (the "layers config")
 * @returns {Topic[]} All topics available for this app
 */
export function parseTopics(layersConfig, rawTopics) {
    if (!rawTopics.topics) {
        log.error(`Invalid topics input`, rawTopics)
        throw new Error('Invalid topics input')
    }
    const topics = []
    rawTopics.topics.forEach((rawTopic) => {
        const {
            id: topicId,
            backgroundLayers: backgroundLayersId,
            defaultBackground: defaultBackgroundLayerId,
            plConfig: legacyUrlParams,
        } = rawTopic
        const backgroundLayers = layersConfig.filter(
            (layer) => backgroundLayersId.indexOf(layer.id) !== -1
        )
        const backgroundLayerFromUrlParam = getBackgroundLayerFromLegacyUrlParams(
            layersConfig,
            legacyUrlParams
        )
        // first we get the background from the "plConfig" of the API response
        let defaultBackground = backgroundLayerFromUrlParam
        // checking if there was something in the "plConfig"
        // null is a valid background as it is the void layer in our app
        // so we have to exclude only the "undefined" value and fill this variable
        // with what is in "defaultBackground" in this case
        if (backgroundLayerFromUrlParam === undefined) {
            defaultBackground = backgroundLayers.find(
                (layer) => layer.id === defaultBackgroundLayerId
            )
        }
        const params = new URLSearchParams(legacyUrlParams)
        const layersToActivate = [
            ...getLayersFromLegacyUrlParams(
                layersConfig,
                params.get('layers'),
                params.get('layers_visibility'),
                params.get('layers_opacity'),
                params.get('layers_timestamp')
            ),
        ]
        const activatedLayers = [
            ...new Set([...(rawTopic.activatedLayers ?? []), ...(rawTopic.selectedLayers ?? [])]),
        ]
            // Filter out layers that have been already added by the infamous
            // plConfig topic config that has priority, this avoid duplicate
            // layers
            .filter((layerId) => !layersToActivate.some((layer) => layer.id === layerId))
        activatedLayers.forEach((layerId) => {
            let layer = layersConfig.find((layer) => layer.id === layerId)
            if (layer) {
                // deep copy so that we can reassign values later on
                // (layers come from the Vuex store so it can't be modified directly)
                layer = layer.clone()
                // checking if the layer should be also visible
                layer.visible = rawTopic.selectedLayers?.indexOf(layerId) !== -1 ?? false
                // In the backend the layers are in the wrong order
                // so we need to reverse the order here by simply adding
                // the layer at the beginning of the array
                layersToActivate.unshift(layer)
            }
        })
        topics.push(new Topic(topicId, backgroundLayers, defaultBackground, layersToActivate))
    })
    return topics
}
