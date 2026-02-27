import type { GeoAdminGroupOfLayers, GeoAdminLayer, Layer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'
import { getApi3BaseUrl } from '@swissgeo/staging-config'
import axios from 'axios'

import type {
    CatalogServerResponse,
    CatalogServerResponseCategory,
    CatalogServerResponseLayer,
    CatalogServerResponseRoot,
    ServicesResponse,
    Topic,
    TopicTree,
} from '@/types/topics'

import legacyLayerParamUtils from '@/utils/legacyLayerParamUtils'

function gatherItemIdThatShouldBeOpened(
    node: CatalogServerResponseRoot | CatalogServerResponseCategory | CatalogServerResponseLayer
): string[] {
    const ids: string[] = []
    if ('category' in node) {
        if (node.category === 'layer') {
            return ids
        } else {
            node.children.forEach((child) => {
                ids.push(...gatherItemIdThatShouldBeOpened(child))
            })
            if (node.selectedOpen) {
                ids.push(`${node.id}`)
            }
        }
    } else {
        // we are dealing with the root node
        ids.push(...node.children.flatMap((child) => gatherItemIdThatShouldBeOpened(child)))
    }
    return ids
}

/**
 * Reads the output of the topic tree endpoint, and creates all themes and layers object accordingly
 *
 * @param node The node for whom we are looking into
 * @param availableLayers All layers available from the layers' config
 */
const readTopicTreeRecursive = (
    node: CatalogServerResponseCategory | CatalogServerResponseLayer,
    availableLayers: GeoAdminLayer[]
): { layer: GeoAdminLayer | GeoAdminGroupOfLayers; warnings: WarningMessage[] } => {
    if (node.category === 'topic') {
        const children: {
            layer: GeoAdminLayer | GeoAdminGroupOfLayers
            warnings: WarningMessage[]
        }[] = []
        const warnings: WarningMessage[] = []
        node.children.forEach((topicChild) => {
            try {
                children.push(readTopicTreeRecursive(topicChild, availableLayers))
            } catch (err) {
                log.warn({
                    title: 'Topics API',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: [
                        `Child ${topicChild.id} can't be loaded, probably due to data integration work ongoing`,
                        err,
                    ],
                })
                if (err instanceof Error) {
                    warnings.push(
                        new WarningMessage(
                            `Topic element ${topicChild.id} can't be loaded, probably due to data integration work ongoing. cause: ${err.message}`
                        )
                    )
                }
            }
        })
        return {
            layer: layerUtils.makeGeoAdminGroupOfLayers({
                id: `${node.id}`,
                name: node.label,
                layers: children.flatMap(({ layer }) => layer),
            }),
            warnings,
        }
    } else if (node.category === 'layer') {
        // we have to match IDs first, some layers have the same technicalNames (when 3D counterpart config exist for instance), and
        // matching both together will result sometimes in the 3D config being displayed in the topic instead of the correct layer
        let matchingLayer = availableLayers.find((layer) => layer.id === node.layerBodId)
        if (!matchingLayer) {
            matchingLayer = availableLayers.find((layer) => layer.technicalName === node.layerBodId)
        }
        if (matchingLayer) {
            return { layer: matchingLayer, warnings: [] }
        }
        throw new Error(`Layer with BOD ID ${node.layerBodId} not found in the layers config`)
    }
    throw new Error('unknown topic node type')
}

/**
 * Loads the topic tree for a topic. This will be used to create the UI of the topic in the menu.
 *
 * @param lang The lang in which to load the topic tree
 * @param topicId The topic we want to load the topic tree
 * @param layersConfig All available layers for this app (the "layers config")
 * @returns A list of topic's layers
 */
async function loadTopicTreeForTopic(
    lang: string,
    topicId: string,
    layersConfig: GeoAdminLayer[]
): Promise<{ tree: TopicTree; warnings: WarningMessage[] }> {
    try {
        const response = await axios.get(
            `${getApi3BaseUrl()}rest/services/${topicId}/CatalogServer?lang=${lang}`
        )
        const data = response.data as CatalogServerResponse
        const topicRoot: CatalogServerResponseRoot = data.results.root

        const treeItems: (GeoAdminLayer | GeoAdminGroupOfLayers)[] = []
        const warnings: WarningMessage[] = []
        topicRoot.children.forEach((child) => {
            try {
                const { layer, warnings: layerWarnings } = readTopicTreeRecursive(
                    child,
                    layersConfig
                )
                if (layer.id) {
                    treeItems.push(layer)
                }
                warnings.push(...layerWarnings)
            } catch (err) {
                log.error({
                    title: 'Topics API',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: [`Error while loading Layer ${child.id} for Topic ${topicId}`, err],
                })
            }
        })
        const itemIdToOpen = gatherItemIdThatShouldBeOpened(topicRoot)
        return { tree: { layers: treeItems, itemIdToOpen }, warnings }
    } catch (error) {
        const errorMessage = `Failed to load topic tree for topic ${topicId}`
        log.error({
            title: 'Topics API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [errorMessage, error],
        })
        throw new Error(errorMessage, { cause: error})
    }
}

/**
 * Loads all topics (without their tree) from the backend.
 *
 * @returns Raw topics from backend
 */
async function loadTopics(): Promise<ServicesResponse> {
    try {
        const response = await axios.get(`${getApi3BaseUrl()}rest/services`)
        return response.data as ServicesResponse
    } catch (error) {
        const errorMessage = `Failed to load topics from backend`
        log.error({
            title: 'Topics API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [errorMessage, error],
        })
        throw new Error(errorMessage, { cause: error})
    }
}

/**
 * Parse topics from backend response.
 *
 * The topics will already by filled with the correct layer object, coming from the `layersConfig`
 * param
 *
 * @param layersConfig All available layers for this app (the "layers config")
 * @param rawTopics
 * @returns All topics available for this app
 */
function parseTopics(layersConfig: GeoAdminLayer[], rawTopics: ServicesResponse): Topic[] {
    if (!rawTopics.topics) {
        log.error(`Invalid topics input`, rawTopics)
        throw new Error('Invalid topics input')
    }
    const topics: Topic[] = []
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
        const backgroundLayerFromUrlParam =
            legacyLayerParamUtils.getBackgroundLayerFromLegacyUrlParams(
                layersConfig,
                legacyUrlParams
            )
        // first we get the background from the "plConfig" of the API response
        let defaultBackgroundLayer: GeoAdminLayer | null | undefined = undefined
        // checking if there was something in the "plConfig"
        // null is a valid background as it is the void layer in our app
        // so we have to exclude only the "undefined" value and fill this variable
        // with what is in "defaultBackground" in this case
        if (backgroundLayerFromUrlParam === undefined) {
            defaultBackgroundLayer = backgroundLayers.find(
                (layer) => layer.id === defaultBackgroundLayerId
            )
        }
        const params = new URLSearchParams(legacyUrlParams)
        const layersToActivate: Layer[] = [
            ...legacyLayerParamUtils.getLayersFromLegacyUrlParams(
                layersConfig,
                params.get('layers') ?? '',
                params.get('layers_visibility') ?? '',
                params.get('layers_opacity') ?? '',
                params.get('layers_timestamp') ?? ''
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
            const layer = layersConfig.find((layer) => layer.id === layerId)

            if (layer) {
                // deep copy so that we can reassign values later on
                // (layers come from the pinia store so it can't be modified directly)
                const layerClone: GeoAdminLayer = layerUtils.cloneLayer(layer)
                // checking if the layer should be also visible
                layerClone.isVisible = rawTopic.selectedLayers?.indexOf(layerId) !== -1
                // In the backend the layers are in the wrong order
                // so we need to reverse the order here by simply adding
                // the layer at the beginning of the array
                layersToActivate.unshift(layerClone)
            }
        })
        topics.push({
            id: topicId,
            backgroundLayers,
            defaultBackgroundLayer: defaultBackgroundLayer,
            layersToActivate,
        })
    })
    return topics
}

export const topicsAPI = {
    loadTopicTreeForTopic,
    loadTopics,
    parseTopics,
}
export default topicsAPI
