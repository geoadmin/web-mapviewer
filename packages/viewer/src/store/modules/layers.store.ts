import type { FlatExtent } from '@swissgeo/coordinates'
import type {
    GeoAdminGeoJSONLayer,
    GPXLayer,
    GPXMetadata,
    KMLLayer,
    KMLMetadata,
    LayerTimeConfigEntry,
} from '@swissgeo/layers'
import type { Interval } from 'luxon'

import { WGS84 } from '@swissgeo/coordinates'
import { extentUtils } from '@swissgeo/coordinates'
import {
    addErrorMessageToLayer,
    clearErrorMessages,
    type GeoAdminLayer,
    type Layer,
    LayerType,
    removeErrorMessageFromLayer,
} from '@swissgeo/layers'
import { layerUtils, timeConfigUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_OLDEST_YEAR, DEFAULT_YOUNGEST_YEAR } from '@/config/time.config'
import usePositionStore from '@/store/modules/position.store'
import { getGpxExtent } from '@/utils/gpxUtils'
import { getKmlExtent, parseKmlName } from '@/utils/kmlUtils'

export interface AddLayerPayload {
    layer?: Layer
    layerId?: string
    layerConfig?: Partial<Layer>
    zoomToLayerExtent?: boolean
}

export interface LayersState {
    /** Current background layer ID */
    currentBackgroundLayerId: string | undefined
    /**
     * Currently active layers (that have been selected by the user from the search bar or the layer
     * tree)
     *
     * Layers are ordered from bottom to top (last layer is shown on top of all the others)
     */
    activeLayers: Layer[]
    /** All layers' config available to this app */
    config: GeoAdminLayer[]
    /**
     * A layer to show on the map when hovering a layer (catalog and search) but not in the list of
     * active layers.
     */
    previewLayer: Layer | undefined
    /**
     * Interval being picked by the time slider. When set to a valid interval, each active layer
     * with multiple time entries will be looked up for matching time entry. Their current time
     * entry will be set accordingly (or set to undefined if no matching time entry is found)
     */
    previewInterval: Interval | undefined
    /**
     * System layers. List of system layers that are added on top and cannot be directly controlled
     * by the user.
     */
    systemLayers: Layer[]

    previewYear?: number
}

/**
 * Check if a layer match with the layerId, isExternal, and baseUrl
 *
 * @param layerId ID of the layer to compare
 * @param isExternal If the layer must be external, not, or both (null)
 * @param baseUrl Base URL of the layer(s) to retrieve. If null, accept all
 * @param layerToMatch Layer to compare with
 */
function matchTwoLayers(
    layerId: string,
    isExternal?: boolean,
    baseUrl?: string,
    layerToMatch?: Layer
): boolean {
    if (!layerToMatch) {
        return false
    }
    const matchesLayerId = layerToMatch.id === layerId
    const matchesIsExternal = isExternal === undefined || layerToMatch.isExternal === isExternal
    const matchesBaseUrl = baseUrl === undefined || layerToMatch.baseUrl === baseUrl
    return matchesLayerId && matchesIsExternal && matchesBaseUrl
}

const cloneActiveLayerConfig = (sourceLayer: Layer, activeLayerConfig: Partial<Layer>) => {
    const clone = layerUtils.cloneLayer(sourceLayer)
    if (clone) {
        if (typeof activeLayerConfig.isVisible === 'boolean') {
            clone.isVisible = activeLayerConfig.isVisible
        }
        if (typeof activeLayerConfig.opacity === 'number') {
            clone.opacity = activeLayerConfig.opacity
        }
        if (activeLayerConfig.customAttributes) {
            const { year, updateDelay } = activeLayerConfig.customAttributes
            if (year && clone.timeConfig) {
                timeConfigUtils.updateCurrentTimeEntry(
                    clone.timeConfig,
                    timeConfigUtils.getTimeEntryForYear(
                        clone.timeConfig,
                        typeof year === 'number' ? year : parseInt(year)
                    )
                )
            }
            if (updateDelay && clone.type === LayerType.GEOJSON) {
                ; (clone as GeoAdminGeoJSONLayer).updateDelay = updateDelay
            }
        }
    }
    return clone
}

const useLayersStore = defineStore('layers', {
    state: (): LayersState => ({
        currentBackgroundLayerId: undefined,
        activeLayers: [],
        config: [],
        previewLayer: undefined,
        previewInterval: undefined,
        systemLayers: [],
    }),
    getters: {
        getActiveLayersById(): (
            layerId: string,
            isExternal?: boolean,
            baseUrl?: string
        ) => Layer[] {
            /**
             * @param layerId ID of the layer(s) to retrieve
             * @param isExternal If the layer must be external, not, or both (not set = undefined)
             * @param baseUrl Base URL of the layer(s) to retrieve. If undefined, accept all baseUrl
             */
            return (layerId: string, isExternal?: boolean, baseUrl?: string): Layer[] => {
                return this.activeLayers.filter((layer) =>
                    matchTwoLayers(layerId, isExternal, baseUrl, layer)
                )
            }
        },

        getActiveLayerByIndex() {
            return (index: number): Layer | undefined => this.activeLayers.at(index)
        },

        /**
         * Return the current background layer from the list of layers via ID
         *
         * @returns The current background layer
         */
        currentBackgroundLayer(): Layer | undefined {
            if (!this.currentBackgroundLayerId) {
                return
            }
            return this.getLayerConfigById(this.currentBackgroundLayerId)
        },

        /**
         * Filter all the active layers and gives only those who are visible on the map.
         *
         * This includes system layers and the preview layer. The time enabled layer with invalid
         * year are filtered out.
         *
         * Layers are ordered from bottom to top (last layer is shown on top of all the others)
         *
         * @returns All layers that are currently visible on the map
         */
        visibleLayers(): Layer[] {
            const visibleLayers = this.activeLayers.filter((layer) => {
                // If the currently selected time entry is null (aka, the time selected has no data),
                // it is like the layer is not visible (even though the checkbox is still active)
                if (
                    layer.timeConfig &&
                    timeConfigUtils.hasMultipleTimestamps(layer) &&
                    layer.timeConfig.currentTimeEntry === null
                ) {
                    return false
                }
                return layer.isVisible
            })
            if (this.previewLayer) {
                visibleLayers.push(this.previewLayer)
            }
            if (this.systemLayers.length > 0) {
                visibleLayers.push(...this.systemLayers.filter((layer) => layer.isVisible))
            }
            return visibleLayers
        },

        /**
         * Return the visible layer on top
         *
         * @returns The top visible layer or undefined if no layers are visible
         */
        visibleLayerOnTop(): Layer | undefined {
            if (this.visibleLayers.length > 0) {
                return this.visibleLayers.slice(-1)[0]
            }
            return undefined
        },

        /**
         * Get the current KML layer selected for drawing.
         *
         * That is the KML layer that will be used when the drawing mode is opened.
         *
         * When no KML layer is in active layers, undefined is returned.
         */
        activeKmlLayer(): KMLLayer | undefined {
            const kmlLayer = this.activeLayers.findLast(
                (layer) => layer.isVisible && layer.type === LayerType.KML && !layer.isExternal
            )
            if (kmlLayer) {
                return kmlLayer as KMLLayer
            }
            return undefined
        },

        /**
         * Get index of the active layer by ID.
         *
         * When there exists no layer with this ID then -1 is returned.
         */
        getIndexOfActiveLayerById() {
            return (layerId: string): number =>
                this.activeLayers.findIndex((layer) => layer.id === layerId)
        },

        /**
         * All layers in the config that have the flag `background` to `true` (that can be shown as
         * a background layer).
         *
         * @returns List of background layers.
         */
        backgroundLayers(): GeoAdminLayer[] {
            return this.config.filter((layer: GeoAdminLayer) => layer.isBackground && layer.idIn3d)
        },

        /** Retrieves a layer config metadata defined by its unique ID */
        getLayerConfigById() {
            return (geoAdminLayerId: string): GeoAdminLayer | undefined =>
                this.config.find((layer) => layer.id === geoAdminLayerId)
        },

        /**
         * Retrieves layer(s) by ID, isExternal, and baseUrl properties.
         *
         * Search in active layer and in preview layer
         *
         * @returns All active layers matching the ID
         */
        getLayersById() {
            /**
             * @param layerId ID of the layer(s) to retrieve
             * @param isExternal If the layer must be external, not, or both (not set = undefined)
             * @param baseUrl Base URL of the layer(s) to retrieve. If undefined, accept all baseUrl
             */
            return (layerId: string, isExternal?: boolean, baseUrl?: string): Layer[] => {
                const layers = this.activeLayers.filter((layer) =>
                    matchTwoLayers(layerId, isExternal, baseUrl, layer)
                )
                if (
                    this.previewLayer !== undefined &&
                    matchTwoLayers(layerId, isExternal, baseUrl, this.previewLayer)
                ) {
                    layers.push(this.previewLayer)
                }
                return layers
            }
        },

        /**
         * Get visibleLayers with time config. (Preview layers and system layers are filtered)
         *
         * @returns List of layers with time config
         */
        visibleLayersWithTimeConfig(): Layer[] {
            // Here we cannot take the getter visibleLayers as it also contains the preview and system
            // layers as well as the layer without valid current timeEntry are filtered out
            return this.activeLayers.filter(
                (layer) => layer.isVisible && timeConfigUtils.hasMultipleTimestamps(layer)
            )
        },

        /**
         * Returns true if the layer comes from a third party (external layer or KML layer).
         *
         * KML layer are treated as external when they are generated by another user (no adminId).
         */
        hasDataDisclaimer() {
            /**
             * @param layerId ID of the layer(s) to retrieve
             * @param isExternal If the layer must be external, not, or both (not set = undefined)
             * @param baseUrl Base URL of the layer(s) to retrieve. If undefined, accept all baseUrl
             */
            return (layerId: string, isExternal?: boolean, baseUrl?: string): boolean => {
                return this.getActiveLayersById(layerId, isExternal, baseUrl).some(
                    (layer: Layer) =>
                        layer &&
                        (layer.isExternal ||
                            (layer.type === LayerType.KML && !(layer as KMLLayer).adminId))
                )
            }
        },

        /**
         * Returns true if the layer comes from a third party (external layer or KML layer) which
         * has been imported from a local file.
         *
         * KML layer are treated as external when they are generated by another user (no adminId).
         */
        isLocalFile() {
            return (layer?: Layer): boolean => {
                if (!layer) {
                    return false
                }
                const isBaseUrlValidUrl = /^\w+:\/\//.test(layer?.baseUrl)
                return (
                    layer &&
                    !isBaseUrlValidUrl &&
                    (layer.isExternal ||
                        (layer.type === LayerType.KML && !(layer as KMLLayer).adminId))
                )
            }
        },

        /**
         * Returns true if any layer comes from a third party (external layer or KML layer) which
         * has been imported from a local file.
         *
         * KML layer are treated as external when they are generated by another user (no adminId).
         */
        hasAnyLocalFile(): boolean {
            return this.activeLayers.some((layer) => this.isLocalFile(layer))
        },

        youngestYear(): number {
            return this.config.reduce((youngestYear: number, layer: GeoAdminLayer): number => {
                if (!layer.timeConfig || !timeConfigUtils.hasMultipleTimestamps(layer)) {
                    return youngestYear
                }
                const youngestLayerYear: number | undefined =
                    timeConfigUtils.getYearFromLayerTimeEntry(layer.timeConfig.timeEntries[0]!)
                if (youngestLayerYear && youngestYear < youngestLayerYear) {
                    return youngestLayerYear
                }
                return youngestYear
            }, DEFAULT_YOUNGEST_YEAR)
        },

        oldestYear(): number {
            return this.config.reduce((oldestYear, layer) => {
                if (!layer.timeConfig || !timeConfigUtils.hasMultipleTimestamps(layer)) {
                    return oldestYear
                }
                const oldestLayerYear: number | undefined =
                    timeConfigUtils.getYearFromLayerTimeEntry(
                        layer.timeConfig.timeEntries.slice(-1)[0]!
                    )
                if (oldestLayerYear && oldestYear > oldestLayerYear) {
                    return oldestLayerYear
                }
                return oldestYear
            }, DEFAULT_OLDEST_YEAR)
        },
    },
    actions: {
        /**
         * Will set the background to the given layer (or layer ID), but only if this layer's
         * configuration states that this layer can be a background layer (isBackground flag)
         *
         * @param bgLayerId The background layer id object
         * @param dispatcher Action dispatcher name
         */
        setBackground(bgLayerId: string | undefined, dispatcher: ActionDispatcher): void {
            if (bgLayerId === undefined || bgLayerId === 'void') {
                // setting it to no background
                this.currentBackgroundLayerId = undefined
            }
            if (bgLayerId && this.getLayerConfigById(bgLayerId)?.isBackground) {
                this.currentBackgroundLayerId = bgLayerId
            } else {
                log.debug({
                    title: 'Layers store / setBackground',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: `Layer ${bgLayerId} is not a background layer, ignoring`,
                })
            }
        },

        setPreviewYear(year: number | undefined) {
            this.previewYear = year
        },

        setTimedLayerCurrentYear(
            index: number,
            year: number | undefined,
            dispatcher: ActionDispatcher
        ) {
            const layer = this.getActiveLayerByIndex(index)
            if (!layer) {
                throw new Error(`Failed to setTimedLayerCurrentYear: invalid index ${index}`)
            }
            // checking that the year exists in this timeConfig
            if (!layer.timeConfig) {
                throw new Error(
                    `Failed to setTimedLayerCurrentYear: layer at index ${index} is not a timed layer`
                )
            }
            timeConfigUtils.updateCurrentTimeEntry(
                layer.timeConfig,
                year !== undefined
                    ? timeConfigUtils.getTimeEntryForYear(layer.timeConfig, year)
                    : undefined
            )
            // if this layer has a 3D counterpart, we also update its timestamp (keep it in sync)
            if ('idIn3d' in layer && layer.idIn3d !== undefined) {
                const layerIn3d = this.getLayerConfigById((layer as GeoAdminLayer).idIn3d!)
                if (layerIn3d?.timeConfig) {
                    timeConfigUtils.updateCurrentTimeEntry(
                        layerIn3d.timeConfig,
                        year !== undefined
                            ? timeConfigUtils.getTimeEntryForYear(layerIn3d.timeConfig, year)
                            : undefined
                    )
                }
            }
        },

        /**
         * Sets the configuration of all available layers for this application
         *
         * Will add layers back, if some were already added before the config was changed
         */
        setLayerConfig(config: GeoAdminLayer[], dispatcher: ActionDispatcher): void {
            const activeLayerBeforeConfigChange = [...this.activeLayers]
            if (Array.isArray(config)) {
                this.config = [...config]
            }
            this.activeLayers = activeLayerBeforeConfigChange.map((layer) => {
                const layerConfig: GeoAdminLayer | undefined = this.getLayerConfigById(layer.id)
                if (layerConfig) {
                    // If we found a layer config we use as it might have changed the i18n translation
                    const clone = layerUtils.cloneLayer(layerConfig)
                    clone.isVisible = layer.isVisible
                    clone.opacity = layer.opacity
                    clone.customAttributes = layer.customAttributes
                    if (layer.timeConfig && layer.timeConfig.currentTimeEntry && clone.timeConfig) {
                        const currentTimeEntry: LayerTimeConfigEntry =
                            layer.timeConfig.currentTimeEntry
                        timeConfigUtils.updateCurrentTimeEntry(
                            clone.timeConfig,
                            clone.timeConfig.timeEntries.find(
                                (entry) => entry.timestamp === currentTimeEntry.timestamp
                            )
                        )
                    }
                    return clone
                } else {
                    // if no config is found, then it is a layer that is not managed, like for example
                    // the KML layers, in this case we take the old active configuration as fallback.
                    return layerUtils.cloneLayer(layer)
                }
            })
        },

        /**
         * Add a layer on top of the active layers.
         *
         * It will do so by cloning the config that is given, or the one that matches the layer ID
         * in the layers' config. This is done so that we may add one "layer" multiple time to the
         * active layers list (for instance having a time enabled layer added multiple time with a
         * different timestamp)
         *
         * @param payload
         * @param dispatcher
         */
        addLayer(payload: AddLayerPayload, dispatcher: ActionDispatcher) {
            const { layer, layerId, layerConfig, zoomToLayerExtent = false } = payload

            let initialLayer: Layer | undefined = layer
            if (!initialLayer && layerId) {
                initialLayer = this.getLayerConfigById(layerId)
            }
            if (!initialLayer) {
                log.error({
                    title: 'Layers store / addLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['no layer found for payload:', layer, layerId],
                })
                return
            }

            // Creating a clone of the config, so that we do not modify the initial config of the app.
            // It is possible to add one layer many times, so we want to always have the correct
            // default values when we add it, not the settings from the layer already added.
            let clone: Layer | undefined
            if (initialLayer) {
                clone = layerUtils.cloneLayer(initialLayer)
            } else if (layerConfig) {
                // Get the Layer Config object, we need to clone it in order
                clone = cloneActiveLayerConfig(initialLayer, layerConfig)
            } else if (layerId) {
                const layerConfig = this.getLayerConfigById(layerId)
                if (layerConfig) {
                    clone = layerUtils.cloneLayer(layerConfig)
                }
            }
            if (clone) {
                this.activeLayers.push(clone)
                if (
                    zoomToLayerExtent &&
                    'extent' in initialLayer &&
                    Array.isArray(initialLayer.extent) &&
                    initialLayer.extent.length === 4
                ) {
                    const layerExtent = initialLayer.extent
                    usePositionStore().zoomToExtent(
                        {
                            extent: layerExtent,
                        },
                        dispatcher
                    )
                }
            } else {
                log.error({
                    title: 'Layers store / addLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'no layer found for payload:',
                        layer,
                        layerId,
                        layerConfig,
                        dispatcher,
                    ],
                })
            }
        },

        /**
         * Sets the list of active layers. This replaces the existing list.
         *
         * NOTE: the layer array is automatically deep cloned
         */
        // NOTE trying to get rid of the union type for " Partial<Layer>[]" here
        // TODO if possible, get rid of the string too man
        setLayers(layers: Layer[] | string[], dispatcher: ActionDispatcher) {
            this.activeLayers = layers
                .map((layer) => {
                    let clone: Layer | undefined
                    if (typeof layer === 'string') {
                        const matchingLayer = this.getLayerConfigById(layer)
                        if (matchingLayer) {
                            clone = layerUtils.cloneLayer(matchingLayer)
                        }
                    } else if ('id' in layer && typeof layer.id === 'string') {
                        const matchingLayer = this.getLayersById(layer.id)
                        if (matchingLayer.length > 0) {
                            clone = layerUtils.cloneLayer(matchingLayer[0]!)
                        }
                    }
                    return clone
                })
                .filter((layer) => !!layer)
        },

        /**
         * Remove a layer by ID or by index.
         *
         * @param payload
         * @param payload.layerId Layer ID to remove. NOTE: this removes all layers with the
         *   matching ID! Use index or UUID if you want to be 100% sure only one layer will be
         *   removed.
         * @param payload.index Index, in the active layers list, of the layer to remove
         * @param payload.isExternal If the layer must be external, not, or both (undefined)
         * @param payload.baseUrl Base URL of the layer(s) to retrieve. If undefined, accept all
         */
        removeLayer(
            payload: { index?: number; layerId?: string; isExternal?: boolean; baseUrl?: string },
            dispatcher: ActionDispatcher
        ) {
            const { index, layerId, isExternal, baseUrl } = payload
            if (layerId) {
                this.activeLayers = this.activeLayers.filter(
                    (layer) => !matchTwoLayers(layerId, isExternal, baseUrl, layer)
                )
            } else if (index !== undefined) {
                this.activeLayers.splice(index, 1)
            } else {
                log.error({
                    title: 'Layers store / removeLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to remove layer: invalid parameter',
                        index,
                        layerId,
                        dispatcher,
                    ],
                })
            }
        },

        /**
         * Full or partial update of a layer at index in the active layer list
         *
         * @param payload
         * @param payload.layerId ID of the layer we want to update
         * @param payload.values Full layer object (Layer) to update or an object with the
         *   properties to update (partial update)
         * @param dispatcher
         */
        updateLayer<T extends Layer>(
            payload: { layerId: string; values: Partial<T> },
            dispatcher: ActionDispatcher
        ) {
            const { layerId, values } = payload
            const layer2Update = this.activeLayers.find((layer) => layer.id === layerId)
            if (layer2Update) {
                Object.assign(layer2Update, values)
            } else {
                log.error({
                    title: 'Layers store / updateLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to update layer: invalid layerId (no matching layer found)',
                        layerId,
                        dispatcher,
                    ],
                })
            }
        },

        /**
         * Full or partial update of layers in the active layer list. The update is done by IDs and
         * updates all layer matching the IDs
         *
         * @param layers List of full layer object (Layer) to update or an object with the layer ID
         *   to update and any property to update (partial update)
         * @param dispatcher
         */
        updateLayers(
            // we want at least `Layer`, it can contain more
            layers: Partial<Layer>[],
            dispatcher: ActionDispatcher
        ) {
            layers
                .map((layer) => {
                    if (typeof layer === 'object' && 'id' in layer && layer.id !== undefined) {
                        const layers2Update = this.getActiveLayersById(
                            layer.id,
                            layer.isExternal,
                            layer.baseUrl
                        )
                        if (!layers2Update) {
                            throw new Error(
                                `Failed to updateLayers: "${layer.id}" not found in active layers`
                            )
                        }
                        return layers2Update.map((layer2Update) => {
                            const updatedLayer = layerUtils.cloneLayer(layer2Update)
                            Object.assign(updatedLayer, layer)
                            return updatedLayer
                        })
                    } else {
                        log.error({
                            title: 'Layers store / updateLayers',
                            titleStyle: {
                                backgroundColor: LogPreDefinedColor.Red,
                            },
                            messages: [
                                'Failed to updateLayers: insufficient data to update layer (missing id, or wrong type of layer received)',
                                layer,
                                dispatcher,
                            ],
                        })
                    }
                })
                .flat()
                .filter((layer) => layer !== undefined)
                .forEach((layer) => {
                    this.getActiveLayersById(layer.id, layer.isExternal, layer.baseUrl).forEach(
                        (layer2Update) => {
                            Object.assign(layer2Update, layer)
                        }
                    )
                })
        },

        /** Clear all active layers */
        clearLayers(dispatcher: ActionDispatcher) {
            this.activeLayers = []
        },

        /**
         * Toggle the layer visibility of the layer corresponding to this index, in the active layer
         * list
         */
        toggleLayerVisibility(index: number, dispatcher: ActionDispatcher) {
            const layer = this.getActiveLayerByIndex(index)
            if (layer) {
                layer.isVisible = !layer.isVisible
            } else {
                log.error({
                    title: 'Layers store / toggleLayerVisibility',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Failed to toggleLayerVisibility: invalid index', index, dispatcher],
                })
            }
        },

        /** Set a layer's visibility flag */
        setLayerVisibility(index: number, isVisible: boolean, dispatcher: ActionDispatcher) {
            const layer = this.getActiveLayerByIndex(index)
            if (layer) {
                layer.isVisible = isVisible
            } else {
                log.error({
                    title: 'Layers store / setLayerVisibility',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Failed to setLayerVisibility: invalid index', index, dispatcher],
                })
            }
        },

        /** Set a layer's opacity */
        setLayerOpacity(index: number, opacity: number, dispatcher: ActionDispatcher) {
            const layer = this.getActiveLayerByIndex(index)
            if (layer) {
                layer.opacity = Number(opacity)
            } else {
                log.error({
                    title: 'Layers store / setLayerOpacity',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Failed to setLayerOpacity: invalid index', index, dispatcher],
                })
            }
        },

        /** Set layer current year */
        setTimedLayerCurrentTimeEntry(
            index: number,
            timeEntry: LayerTimeConfigEntry | undefined,
            dispatcher: ActionDispatcher
        ) {
            const layer = this.getActiveLayerByIndex(index)

            if (layer && layer.timeConfig) {
                timeConfigUtils.updateCurrentTimeEntry(layer.timeConfig, timeEntry)

                // if this layer has a 3D counterpart, we also update its time entry (keep it in sync)
                if ('idIn3d' in layer && layer.idIn3d !== undefined) {
                    const geoadminLayer = layer as GeoAdminLayer
                    const layerIn3d = this.getLayerConfigById(geoadminLayer.idIn3d as string)
                    if (layerIn3d?.timeConfig) {
                        timeConfigUtils.updateCurrentTimeEntry(layerIn3d.timeConfig, timeEntry)
                    }
                }
            } else {
                log.error({
                    title: 'Layers store / setTimedLayerCurrentTimeEntry',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to setTimedLayerCurrentTimeEntry: invalid index or layer (not time-enabled)',
                        index,
                        layer,
                        dispatcher,
                    ],
                })
            }
        },

        /** Move an active layer to the given index */
        moveActiveLayerToIndex(index: number, newIndex: number, dispatcher: ActionDispatcher) {
            if (newIndex >= this.activeLayers.length || newIndex < 0) {
                log.error({
                    title: 'Layers store / moveActiveLayerToIndex',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to moveActiveLayerToIndex: invalid new index',
                        newIndex,
                        index,
                        dispatcher,
                    ],
                })
                return
            }
            const activeLayer = this.getActiveLayerByIndex(index)
            if (!activeLayer) {
                log.error({
                    title: 'Layers store / moveActiveLayerToIndex',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to moveActiveLayerToIndex: invalid index, no layer found',
                        index,
                    ],
                })
                return
            }
            const removed = this.activeLayers.splice(index, 1)
            if (removed.length > 0) {
                this.activeLayers.splice(newIndex, 0, removed[0]!)
            }
        },

        /** Set the preview layer */
        setPreviewLayer(layer: Layer | string, dispatcher: ActionDispatcher) {
            let clone
            if (typeof layer === 'object') {
                // got the layer, thus we copy it directly
                clone = layerUtils.cloneLayer(layer)
            } else {
                // got an ID, look for the layer
                const matchingLayer = this.getLayerConfigById(layer)
                if (matchingLayer) {
                    clone = layerUtils.cloneLayer(matchingLayer)
                }
            }
            if (!clone) {
                log.error({
                    title: 'Layers store / setPreviewLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to setPreviewLayer: invalid layer identifier or layer object',
                        layer,
                        dispatcher,
                    ],
                })
                return
            }
            clone.isVisible = true
            this.previewLayer = clone
        },

        /** Clear the preview layer */
        clearPreviewLayer(dispatcher: ActionDispatcher) {
            this.previewLayer = undefined
        },

        /**
         * Will take the first time entry that matches the interval for each layer (if multiple
         * entries are possible), or set the current time entry to undefined if no matching time
         * entry is found in the layer.
         */
        setPreviewInterval(interval: Interval, dispatcher: ActionDispatcher) {
            if (!interval.isValid) {
                log.error({
                    title: 'Layers store / setPreviewInterval',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to setPreviewInterval: invalid interval',
                        interval,
                        dispatcher,
                    ],
                })
                return
            }
            this.previewInterval = interval
            this.activeLayers
                .filter((layer) => timeConfigUtils.hasMultipleTimestamps(layer))
                .forEach((layer) => {
                    if (!layer.timeConfig) {
                        return
                    }
                    layer.timeConfig.currentTimeEntry = timeConfigUtils.getTimeEntryForInterval(
                        layer,
                        interval
                    )
                })
        },

        /** Clear preview year */
        clearPreviewInterval(dispatcher: ActionDispatcher) {
            this.previewInterval = undefined
            // we leave the active layers as they were and do not revert to any default time entry
            // (what was selected through the time slider is permanent)
        },

        /**
         * Add a layer error translation key.
         *
         * NOTE: This set the error key to all layers matching the ID, isExternal, and baseUrl
         * properties.
         */
        addLayerError(
            payload: {
                layerId: string
                isExternal?: boolean
                baseUrl?: string
                error: ErrorMessage
            },
            dispatcher: ActionDispatcher
        ) {
            const { layerId, isExternal, baseUrl, error } = payload
            const layers: Layer[] = this.getLayersById(layerId, isExternal, baseUrl)
            if (layers.length === 0) {
                log.error({
                    title: 'Layers store / addLayerError',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to add layer error: invalid layerId (no matching layer found)',
                        layerId,
                        isExternal,
                        baseUrl,
                    ],
                })
                return
            }
            const updatedLayers = layers.map((layer) => {
                const clone = layerUtils.cloneLayer(layer)
                addErrorMessageToLayer(clone, error)
                if (clone.isLoading) {
                    clone.isLoading = false
                }
                return clone
            })
            this.updateLayers(updatedLayers, dispatcher)
        },

        /**
         * Remove a layer error translation key.
         *
         * NOTE: This set the error key to all layers matching the ID, isExternal, and baseUrl
         * properties.
         */
        removeLayerError(
            payload: {
                layerId: string
                isExternal?: boolean
                baseUrl?: string
                error: ErrorMessage
            },
            dispatcher: ActionDispatcher
        ) {
            const { layerId, isExternal, baseUrl, error } = payload
            const layers = this.getLayersById(layerId, isExternal, baseUrl)
            if (layers.length === 0) {
                log.error({
                    title: 'Layers store / removeLayerError',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to remove layer error: invalid layerId (no matching layer found)',
                        layerId,
                        isExternal,
                        baseUrl,
                    ],
                })
                return
            }
            const updatedLayers = layers.map((layer) => {
                const clone = layerUtils.cloneLayer(layer)
                removeErrorMessageFromLayer(clone, error)
                return clone
            })
            this.updateLayers(updatedLayers, dispatcher)
        },

        /**
         * Remove all layer error translation keys.
         *
         * NOTE: This set the error key to all layers matching the ID.
         */
        clearLayerErrors(layerId: string, dispatcher: ActionDispatcher) {
            const layers = this.getLayersById(layerId)
            if (layers.length === 0) {
                log.error({
                    title: 'Layers store / clearLayerErrors',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to clear layer errors: invalid layerId (no matching layer found)',
                        layerId,
                    ],
                })
                return
            }
            const updatedLayers = layers.map((layer) => {
                const clone = layerUtils.cloneLayer(layer)
                clearErrorMessages(clone)
                return clone
            })
            this.updateLayers(updatedLayers, dispatcher)
        },

        /**
         * Set KML/GPX layer(s) with its data and metadata.
         *
         * NOTE: all matching layer id will be set.
         *
         * @param payload
         * @param payload.layerId Layer ID of KML to update
         * @param payload.data Data KML data to set
         * @param payload.metadata KML metadata to set (only for geoadmin KMLs).
         * @param payload.linkFiles Map of KML link files. Those files are usually sent with the kml
         *   inside a KMZ archive and can be referenced inside the KML (e.g. icon, image, ...).
         * @param dispatcher
         */
        setKmlGpxLayerData(
            payload: {
                layerId: string
                data?: string
                metadata?: KMLMetadata | GPXMetadata
                kmlInternalFiles?: Record<string, ArrayBuffer>
            },
            dispatcher: ActionDispatcher
        ) {
            const { layerId, data, metadata, kmlInternalFiles } = payload
            const layers = this.getActiveLayersById(layerId)
            if (
                !layers ||
                layers.some((layer) => [LayerType.KML, LayerType.GPX].includes(layer.type))
            ) {
                log.error({
                    title: 'Layers store / setKmlGpxLayerData',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to setKmlGpxLayerData: invalid layerId (no matching layer found)',
                        layerId,
                    ],
                })
                return
            }
            const updatedLayers = layers.map((layer) => {
                const clone = layerUtils.cloneLayer(layer) as GPXLayer | KMLLayer
                if (data) {
                    let extent: FlatExtent | undefined
                    if (clone.type === LayerType.KML) {
                        const kmlLayer = clone as KMLLayer
                        let kmlName: string | undefined = parseKmlName(data)
                        if (!kmlName || kmlName === '') {
                            kmlName = kmlLayer.kmlFileUrl
                        }
                        if (kmlName) {
                            kmlLayer.name = kmlName
                        }
                        kmlLayer.kmlData = data
                        extent = getKmlExtent(data)
                    } else if (clone.type === LayerType.GPX) {
                        const gpxLayer = clone as GPXLayer
                        // The name of the GPX is derived from the metadata below
                        gpxLayer.gpxData = data
                        extent = getGpxExtent(data)
                    }
                    clone.isLoading = false

                    // Always clean up the error messages before doing the check
                    const emptyFileErrorMessage = new ErrorMessage('kml_gpx_file_empty')
                    const outOfBoundsErrorMessage = new ErrorMessage('imported_file_out_of_bounds')
                    removeErrorMessageFromLayer(clone, emptyFileErrorMessage)
                    removeErrorMessageFromLayer(clone, outOfBoundsErrorMessage)

                    if (!extent) {
                        addErrorMessageToLayer(clone, emptyFileErrorMessage)
                    } else if (
                        !extentUtils.getExtentIntersectionWithCurrentProjection(
                            extent,
                            WGS84,
                            usePositionStore().projection
                        )
                    ) {
                        addErrorMessageToLayer(clone, outOfBoundsErrorMessage)
                    }
                }
                if (metadata) {
                    if (clone.type === LayerType.KML) {
                        const kmlLayer = clone as KMLLayer
                        kmlLayer.kmlMetadata = metadata as KMLMetadata
                    } else if (clone.type === LayerType.GPX) {
                        const gpxLayer = clone as GPXLayer
                        const gpxMetadata = metadata as GPXMetadata
                        gpxLayer.gpxMetadata = gpxMetadata
                        gpxLayer.name = gpxMetadata.name ?? 'GPX'
                    }
                }
                if (kmlInternalFiles && clone.type === LayerType.KML) {
                    const kmlLayer = clone as KMLLayer
                    kmlLayer.internalFiles = kmlInternalFiles
                }
                return clone
            })
            this.updateLayers(updatedLayers, dispatcher)
        },

        /**
         * Add a system layer
         *
         * NOTE: unlike the activeLayers, systemLayers cannot have duplicate and they are
         * added/remove by ID
         */
        addSystemLayer(layer: Layer, dispatcher: ActionDispatcher) {
            if (this.systemLayers.find((systemLayer) => systemLayer.id === layer.id)) {
                log.error({
                    title: 'Layers store / addSystemLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Failed to add system layer: duplicate layer ID', layer, dispatcher],
                })
            } else {
                this.systemLayers.push(layer)
            }
        },

        /** Update a system layer */
        updateSystemLayer(layer: Partial<Layer>, dispatcher: ActionDispatcher) {
            const layer2Update = this.systemLayers.find(
                (systemLayer) => systemLayer.id === layer.id
            )
            if (!layer2Update) {
                log.error({
                    title: 'Layers store / updateSystemLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Failed to update system layer: invalid layerId (no matching layer found)',
                        layer,
                        dispatcher,
                    ],
                })
                return
            }
            Object.assign(layer2Update, layer)
        },

        /**
         * Remove a system layer
         *
         * NOTE: unlike the activeLayers, systemLayers cannot have duplicate and they are
         * added/remove by ID
         */
        removeSystemLayer(layerId: string, dispatcher: ActionDispatcher) {
            const index = this.systemLayers.findIndex((systemLayer) => systemLayer.id === layerId)
            if (index === -1) {
                log.warn({
                    title: 'Layers store / removeSystemLayer',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Yellow,
                    },
                    messages: [
                        'Failed to remove system layer: invalid layerId (no matching layer found)',
                        layerId,
                        dispatcher,
                    ],
                })
            } else {
                this.systemLayers.splice(index, 1)
            }
        },

        /** Set all system layers */
        setSystemLayers(layers: Layer[], dispatcher: ActionDispatcher) {
            this.systemLayers = [...layers]
        },
    },
})

export default useLayersStore
