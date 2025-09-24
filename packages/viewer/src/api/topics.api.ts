import type { GeoAdminLayer, Layer } from '@swissgeo/layers'
import { LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import { getApi3BaseUrl } from '@/config/baseUrl.config'
import { ENVIRONMENT } from '@/config/staging.config'
import {
    getBackgroundLayerFromLegacyUrlParams,
    getLayersFromLegacyUrlParams,
} from '@/utils/legacyLayerParamUtils'
import GeoAdminGroupOfLayers from './layers/GeoAdminGroupOfLayers.class'

/** Representation of a topic (a subset of layers to be shown to the user) */
export interface Topic {
    readonly id: string
    /** The list of layers eligible for background when this topic is active */
    readonly backgroundLayers: GeoAdminLayer[]
    /**
     * The layer that should be activated as the background layer by default when this topic is
     * selected. The value will be set to null when the void layer should be selected.
     */
    readonly defaultBackgroundLayer: GeoAdminLayer | null
    /**
     * All layers that should be added to the displayed layer (but not necessarily visible, that
     * will depend on their state)
     */
    readonly layersToActivate: Layer[]
}

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

const validateBaseData = (values: Partial<Layer>): void => {
    if (!values.name) {
        throw new Error('Missing layer name')
    }
    if (!values.id) {
        throw new Error('Missing layer ID')
    }
}

function makeGeoAdminGroupOfLayers(values: Partial<GeoAdminGroupOfLayers>): GeoAdminGroupOfLayers {
    const layer = new GeoAdminGroupOfLayers({
        id: values.id,
        name: values.name,
        uuid: uuidv4(),
        layers: values.layers ?? [],
        type: LayerType.GROUP,
        opacity: 1,
        isVisible: true,
        attributions: [],
        hasTooltip: false,
        hasDescription: false,
        hasLegend: false,
        isExternal: false,
        isLoading: false,
        timeConfig: {
            timeEntries: [],
        },
        hasError: false,
        hasWarning: false,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateBaseData(layer as any)
    return layer
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
): GeoAdminLayer | GeoAdminGroupOfLayers => {
    if (node.category === 'topic') {
        const children: (GeoAdminLayer | GeoAdminGroupOfLayers)[] = []
        node.children.forEach((topicChild) => {
            try {
                children.push(readTopicTreeRecursive(topicChild, availableLayers))
            } catch (err) {
                if (ENVIRONMENT === 'development') {
                    log.warn({
                        title: 'Topics API',
                        titleColor: LogPreDefinedColor.Amber,
                        messages: [
                            `Child ${topicChild.id} can't be loaded, probably due to data integration work ongoing`,
                            err,
                        ],
                    })
                } else {
                    log.error({
                        title: 'Topics API',
                        titleColor: LogPreDefinedColor.Amber,
                        messages: [`Child ${topicChild.id} can't be loaded`, err],
                    })
                }
            }
        })
        // TODO: check why children is 0
        if (children.length === 0) {
            return {} as GeoAdminGroupOfLayers
        }
        // TODO: can't use layerUtils.makeGeoAdminGroupOfLayers for this as it does not return a GeoAdminGroupOfLayers object 
        return makeGeoAdminGroupOfLayers({
            id: `${node.id}`,
            name: node.label,
            layers: children,
        })
    } else if (node.category === 'layer') {
        // we have to match IDs first, some layers have the same technicalNames (when 3D counterpart config exist for instance), and
        // matching both together will result sometimes in the 3D config being displayed in the topic instead of the correct layer
        let matchingLayer = availableLayers.find((layer) => layer.id === node.layerBodId)
        if (!matchingLayer) {
            matchingLayer = availableLayers.find((layer) => layer.technicalName === node.layerBodId)
        }
        if (matchingLayer) {
            return matchingLayer
        }
        throw new Error(`Layer with BOD ID ${node.layerBodId} not found in the layers config`)
    }
    throw new Error('unknown topic node type')
}

interface CatalogServerResponseLayer {
    id: string
    category: 'layer'
    staging: 'dev' | 'int' | 'prod'
    label: string
    layerBodId: string
}

interface CatalogServerResponseCategory {
    id: string
    category: 'topic'
    staging: 'dev' | 'int' | 'prod'
    label: string
    selectedOpen: boolean
    children: (CatalogServerResponseCategory | CatalogServerResponseLayer)[]
}

interface CatalogServerResponseRoot {
    id: string
    children: CatalogServerResponseCategory[]
}

interface CatalogServerResponse {
    results: {
        root: CatalogServerResponseRoot
    }
}

interface TopicTree {
    layers: (GeoAdminLayer | GeoAdminGroupOfLayers)[]
    itemIdToOpen: string[]
}

/**
 * Loads the topic tree for a topic. This will be used to create the UI of the topic in the menu.
 *
 * @param lang The lang in which to load the topic tree
 * @param topicId The topic we want to load the topic tree
 * @param layersConfig All available layers for this app (the "layers config")
 * @returns A list of topic's layers
 */
export async function loadTopicTreeForTopic(
    lang: string,
    topicId: string,
    layersConfig: GeoAdminLayer[]
): Promise<TopicTree> {
    try {
        const response = await axios.get(
            `${getApi3BaseUrl()}rest/services/${topicId}/CatalogServer?lang=${lang}`
        )
        const data = response.data as CatalogServerResponse
        const topicRoot: CatalogServerResponseRoot = data.results.root

        const treeItems: (GeoAdminLayer | GeoAdminGroupOfLayers)[] = []
        topicRoot.children.forEach((child) => {
            try {
                const topic = readTopicTreeRecursive(child, layersConfig)
                if (topic.id) {
                    treeItems.push(topic)
                }
            } catch (err) {
                log.error({
                    title: 'Topics API',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: [`Error while loading Layer ${child.id} for Topic ${topicId}`, err],
                })
            }
        })
        const itemIdToOpen = gatherItemIdThatShouldBeOpened(topicRoot)
        return { layers: treeItems, itemIdToOpen }
    } catch (error) {
        const errorMessage = `Failed to load topic tree for topic ${topicId}`
        log.error({
            title: 'Topics API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [errorMessage, error],
        })
        throw new Error(errorMessage)
    }
}

interface ServicesResponseTopic {
    id: string
    defaultBackground: string
    backgroundLayers: string[]
    selectedLayers: string[]
    activatedLayers: string[]
    plConfig: string
    groupId: number
}

interface ServicesResponse {
    topics: ServicesResponseTopic[]
}

/**
 * Loads all topics (without their tree) from the backend.
 *
 * @returns Raw topics from backend
 */
export async function loadTopics(): Promise<ServicesResponse> {
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
        throw new Error(errorMessage)
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
export function parseTopics(layersConfig: GeoAdminLayer[], rawTopics: ServicesResponse): Topic[] {
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
        const backgroundLayerFromUrlParam = getBackgroundLayerFromLegacyUrlParams(
            layersConfig,
            legacyUrlParams
        )
        // first we get the background from the "plConfig" of the API response
        let defaultBackgroundLayer = backgroundLayerFromUrlParam
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
            ...getLayersFromLegacyUrlParams(
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
            let layer = layersConfig.find((layer) => layer.id === layerId)
            if (layer) {
                // deep copy so that we can reassign values later on
                // (layers come from the Vuex store so it can't be modified directly)
                layer = layerUtils.cloneLayer(layer)
                    // checking if the layer should be also visible
                    // TODO: GeoAdminLayer is missing the "visible" property but is necessary to make the layer visible when activating the topic, isVisible is currently not used for this
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ; (layer as any).visible = rawTopic.selectedLayers?.indexOf(layerId) !== -1
                // In the backend the layers are in the wrong order
                // so we need to reverse the order here by simply adding
                // the layer at the beginning of the array
                layersToActivate.unshift(layer)
            }
        })
        topics.push({
            id: topicId,
            backgroundLayers,
            defaultBackgroundLayer: defaultBackgroundLayer ?? null,
            layersToActivate,
        })
    })
    return topics
}
