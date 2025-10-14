import type { FlatExtent, NormalizedExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoAdminLayer, Layer } from '@swissgeo/layers'
import type { Geometry } from 'geojson'

import { extentUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { containsCoordinate, getIntersection as getExtentIntersection } from 'ol/extent'
import { defineStore } from 'pinia'

import type { DrawingIcon } from '@/api/icon.api'
import type { ActionDispatcher } from '@/store/types'

import {
    type EditableFeature,
    EditableFeatureTypes,
    type IdentifyConfig,
    type LayerFeature,
    type SelectableFeature,
} from '@/api/features.api'
import getFeature, { identify, identifyOnGeomAdminLayer } from '@/api/features.api'
import { sendFeatureInformationToIFrameParent } from '@/api/iframePostMessageEvent.api'
import {
    DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION,
    DEFAULT_FEATURE_COUNT_SINGLE_POINT,
} from '@/config/map.config'
import { useI18nStore } from '@/store/modules/i18n.store'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map.store'
import useProfileStore from '@/store/modules/profile.store'
import useUIStore from '@/store/modules/ui.store'
import {
    allStylingColors,
    allStylingSizes,
    type FeatureStyleColor,
    type FeatureStyleSize,
    TextPlacement,
} from '@/utils/featureStyleUtils'

import usePositionStore from './position.store'

function getEditableFeatureWithId(
    selectedEditableFeatures: EditableFeature[],
    featureId: string | number
): EditableFeature | undefined {
    return selectedEditableFeatures.find((selectedFeature) => selectedFeature.id === featureId)
}

export function getFeatureCountForCoordinate(coordinate: SingleCoordinate | FlatExtent): number {
    return coordinate.length === 2
        ? DEFAULT_FEATURE_COUNT_SINGLE_POINT
        : DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION
}

interface MultipleIdentifyConfig extends Omit<IdentifyConfig, 'layer'> {
    layers: Layer[]
}

export enum IdentifyMode {
    /** Clear previous selection and identify features at the given coordinate */
    New = 'NEW',
    /** Toggle selection: remove if already selected, add if not */
    Toggle = 'TOGGLE',
}

/**
 * Identifies feature at the given coordinates
 *
 * @returns A promise that will contain all feature identified by the different requests (won't be
 *   grouped by layer)
 */
export const identifyOnAllLayers = (config: MultipleIdentifyConfig): Promise<LayerFeature[]> => {
    const {
        layers,
        coordinate,
        resolution,
        mapExtent,
        screenWidth,
        screenHeight,
        lang,
        projection,
        featureCount = getFeatureCountForCoordinate(coordinate),
    } = config
    return new Promise((resolve, reject) => {
        const allFeatures: LayerFeature[] = []
        const pendingRequests: Promise<LayerFeature[]>[] = []
        const commonParams = {
            coordinate,
            resolution,
            mapExtent,
            screenWidth,
            screenHeight,
            lang,
            projection,
            featureCount,
        }
        // for each layer we run a backend request
        // NOTE: in theory for the Geoadmin layers we could run one single backend request to API3 instead of one per layer, however
        // this would not be more efficient as a single request would take more time that several in parallel (this has been tested).
        layers
            // only request layers that have getFeatureInfo capabilities (or are flagged has having a tooltip in their config for GeoAdmin layers)
            .filter((layer) => layer.hasTooltip)
            // filtering out any layer for which their extent doesn't contain the wanted coordinate (no data anyway, no need to request)
            .filter((layer) => {
                if (
                    !('extent' in layer) ||
                    (Array.isArray(layer.extent) && [2, 4].includes(layer.extent.length))
                ) {
                    return true
                }
                const layerExtent: FlatExtent | NormalizedExtent = layer.extent as
                    | FlatExtent
                    | NormalizedExtent
                if (coordinate.length === 2) {
                    return containsCoordinate(extentUtils.flattenExtent(layerExtent), coordinate)
                }
                return getExtentIntersection(
                    extentUtils.flattenExtent(layerExtent),
                    extentUtils.flattenExtent(coordinate)
                ).every((value) => !isNaN(value))
            })
            .forEach((layer) => {
                pendingRequests.push(
                    identify({
                        layer,
                        ...commonParams,
                    })
                )
            })
        // grouping all features from the different requests
        Promise.allSettled(pendingRequests)
            .then((responses) => {
                responses.forEach((response) => {
                    if (response.status === 'fulfilled' && response.value) {
                        allFeatures.push(...response.value)
                    } else {
                        log.error(
                            'Error while identifying features on external layer, response is',
                            response
                        )
                        // no reject, so that we may see at least the result of requests that have been fulfilled
                    }
                })
                // filtering out duplicates
                resolve(
                    Array.from(
                        new Map(allFeatures.map((feature) => [feature.id, feature])).values()
                    )
                )
            })
            .catch((error) => {
                log.error({
                    title: 'Feature store / identify',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Purple,
                    },
                    messages: ['Error while identifying features', error],
                })
                reject(new Error(error))
            })
    })
}

export interface FeaturesForLayer {
    layerId: string
    features: LayerFeature[]
    /**
     * If there are more data to load, this will be greater than 0. If no more data can be requested
     * from the backend, this will be set to 0.
     */
    featureCountForMoreData: number
}

export interface FeaturesState {
    selectedFeaturesByLayerId: FeaturesForLayer[]
    selectedEditableFeatures: EditableFeature[]
    highlightedFeatureId: string | undefined
}

const useFeaturesStore = defineStore('features', {
    state: (): FeaturesState => ({
        selectedFeaturesByLayerId: [],
        selectedEditableFeatures: [],
        highlightedFeatureId: undefined,
    }),
    getters: {
        selectedLayerFeatures(): LayerFeature[] {
            return this.selectedFeaturesByLayerId
                .map((featuresForLayer: FeaturesForLayer) => featuresForLayer.features)
                .flat()
        },

        selectedFeatures(): (EditableFeature | LayerFeature)[] {
            return [...this.selectedEditableFeatures, ...this.selectedLayerFeatures]
        },
    },
    actions: {
        /**
         * Tells the map to highlight a list of features (place a round marker at their location).
         * Those features are currently shown by the tooltip. If in drawing mode, this functions
         * tells the store which features are selected (it does not select the features by itself)
         *
         * @param payload
         * @param payload.features A list of feature we want to highlight/select on the map
         * @param payload.paginationSize How many features were requested, will help set if a layer
         *   can have more data or not (if its feature count is a multiple of paginationSize)
         * @param dispatcher
         */
        setSelectedFeatures(
            payload: { features: SelectableFeature<boolean>[]; paginationSize?: number },
            dispatcher: ActionDispatcher
        ) {
            const { features, paginationSize = DEFAULT_FEATURE_COUNT_SINGLE_POINT } = payload
            // clearing up any relevant selected features stuff
            if (this.highlightedFeatureId) {
                this.highlightedFeatureId = undefined
            }
            const profileStore = useProfileStore()
            if (profileStore.feature) {
                profileStore.setProfileFeature({ feature: undefined }, dispatcher)
            }
            const layerFeaturesByLayerId: FeaturesForLayer[] = []
            let drawingFeatures: EditableFeature[] = []
            if (Array.isArray(features)) {
                const layerFeatures = features.filter(
                    (feature) => !feature.isEditable
                ) as LayerFeature[]
                drawingFeatures = features.filter(
                    (feature) => feature.isEditable
                ) as EditableFeature[]
                layerFeatures.forEach((feature) => {
                    if (
                        !layerFeaturesByLayerId.some(
                            (featureForLayer) => featureForLayer.layerId === feature.layer.id
                        )
                    ) {
                        layerFeaturesByLayerId.push({
                            layerId: feature.layer.id,
                            features: [],
                            featureCountForMoreData: paginationSize,
                        })
                    }
                    const featureForLayer = layerFeaturesByLayerId.find(
                        (featureForLayer) => featureForLayer.layerId === feature.layer.id
                    )
                    if (featureForLayer) {
                        featureForLayer.features.push(feature)
                    }
                })
                layerFeaturesByLayerId.forEach((layerFeatures) => {
                    // if less feature than the pagination size are present, we can already tell there won't be more data to load
                    layerFeatures.featureCountForMoreData =
                        layerFeatures.features.length % paginationSize === 0 ? paginationSize : 0
                })

                // as described by this example on our documentation: https://codepen.io/geoadmin/pen/yOBzqM?editors=0010
                // our app should send a message (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
                // when a feature is selected while embedded, so that the parent can get the selected feature(s) ID(s)
                sendFeatureInformationToIFrameParent(layerFeatures)
            }
            this.selectedFeaturesByLayerId = layerFeaturesByLayerId
            this.selectedEditableFeatures = [...drawingFeatures]
        },

        /**
         * Identify features in layers at the given coordinate.
         *
         * @param payload
         * @param payload.layers List of layers for which we want to know if features are present at
         *   given coordinates
         * @param payload.vectorFeatures List of existing vector features at given coordinate (that
         *   should be added to the selected features after identification has been run on the
         *   backend). Default is `[]`
         * @param payload.coordinate A point ([x,y]), or a rectangle described by a flat extent
         *   ([minX, maxX, minY, maxY]). 10 features will be requested for a point, 50 for a
         *   rectangle.
         * @param dispatcher
         * @returns As some callers might want to know when identify has been done/finished, this
         *   returns a promise that will be resolved when this is the case
         */
        async identifyFeatureAt(
            payload: {
                layers: Layer[]
                coordinate: SingleCoordinate | FlatExtent
                vectorFeatures: SelectableFeature<false>[]
                identifyMode?: IdentifyMode
            },
            dispatcher: ActionDispatcher
        ) {
            const {
                layers,
                coordinate,
                vectorFeatures = [],
                identifyMode = IdentifyMode.New,
            } = payload
            const featureCount = getFeatureCountForCoordinate(coordinate)

            const i18nStore = useI18nStore()
            const positionStore = usePositionStore()
            const uiStore = useUIStore()

            const features = [
                ...vectorFeatures,
                ...(await identifyOnAllLayers({
                    layers,
                    coordinate,
                    resolution: positionStore.resolution,
                    mapExtent: extentUtils.flattenExtent(positionStore.extent),
                    screenWidth: uiStore.width,
                    screenHeight: uiStore.height,
                    lang: i18nStore.lang,
                    projection: positionStore.projection,
                    featureCount,
                })),
            ]
            if (features.length > 0) {
                if (identifyMode === IdentifyMode.New) {
                    this.setSelectedFeatures(
                        {
                            features,
                            paginationSize: featureCount,
                        },
                        dispatcher
                    )
                } else if (identifyMode === IdentifyMode.Toggle) {
                    // Toggle features: remove if already selected, add if not
                    const oldFeatures = this.selectedLayerFeatures
                    const newFeatures = features
                    // Use feature.id for comparison
                    const oldFeatureIds = new Set(oldFeatures.map((f) => f.id))
                    const newFeatureIds = new Set(newFeatures.map((f) => f.id))
                    // features that are present on the map AND in the identify-request result are meant to be toggled
                    const deselectedFeatures = oldFeatures.filter((f) => newFeatureIds.has(f.id))
                    const newlyAddedFeatures = newFeatures.filter((f) => !oldFeatureIds.has(f.id))
                    if (
                        // Do not add new features if one existing feature was toggled off. Doing so would confuse
                        // the user, as it would look like the CTRL+Click had no effect (a new feature was added at
                        // the same spot as the one that was just toggled off)
                        deselectedFeatures.length > 0
                    ) {
                        // Set features to all existing features minus those that were toggled off
                        this.setSelectedFeatures(
                            {
                                features: oldFeatures.filter(
                                    (f) => !deselectedFeatures.includes(f)
                                ),
                                paginationSize: featureCount,
                            },
                            dispatcher
                        )
                    } else if (newlyAddedFeatures.length > 0) {
                        // no feature was "deactivated" we can add the newly selected features
                        this.setSelectedFeatures(
                            {
                                features: newlyAddedFeatures.concat(oldFeatures),
                                paginationSize: featureCount,
                            },
                            dispatcher
                        )
                    } else {
                        this.clearAllSelectedFeatures(dispatcher)
                    }
                }
            } else {
                this.clearAllSelectedFeatures(dispatcher)
            }
        },

        /**
         * Loads (if possible) more features for the given layer.
         *
         * Only GeoAdmin layers support this for the time being. For external layer, as we use
         * GetFeatureInfo from WMS, there's no such capabilities (we would have to switch to a WFS
         * approach to gain access to similar things).
         *
         * @param payload
         * @param payload.layer
         * @param payload.coordinate A point ([x,y]), or a rectangle described by a flat extent
         *   ([minX, maxX, minY, maxY]).
         * @param dispatcher
         */
        loadMoreFeaturesForLayer(
            payload: { layer: GeoAdminLayer; coordinate: SingleCoordinate | FlatExtent },
            dispatcher: ActionDispatcher
        ) {
            const { layer, coordinate } = payload
            if (!layer) {
                return
            }
            const featuresAlreadyLoaded = this.selectedFeaturesByLayerId.find(
                (featureForLayer) => featureForLayer.layerId === layer.id
            )
            if (featuresAlreadyLoaded && featuresAlreadyLoaded.featureCountForMoreData > 0) {
                const i18nStore = useI18nStore()
                const positionStore = usePositionStore()
                const uiStore = useUIStore()

                identifyOnGeomAdminLayer({
                    layer,
                    coordinate,
                    resolution: positionStore.resolution,
                    mapExtent: extentUtils.flattenExtent(positionStore.extent),
                    screenWidth: uiStore.width,
                    screenHeight: uiStore.height,
                    lang: i18nStore.lang,
                    projection: positionStore.projection,
                    offset: featuresAlreadyLoaded.features.length,
                    featureCount: featuresAlreadyLoaded.featureCountForMoreData,
                })
                    .then((moreFeatures) => {
                        const featuresForLayer = this.selectedFeaturesByLayerId.find(
                            (featureForLayer) => featureForLayer.layerId === layer.id
                        )
                        if (!featuresForLayer) {
                            return
                        }
                        const canLoadMore =
                            moreFeatures.length > 0 &&
                            moreFeatures.length % featuresAlreadyLoaded.featureCountForMoreData ===
                                0

                        featuresForLayer.features.push(...moreFeatures)
                        featuresForLayer.featureCountForMoreData = canLoadMore
                            ? featuresAlreadyLoaded.featureCountForMoreData
                            : 0
                    })
                    .catch((error) => {
                        log.error({
                            title: 'Feature store / identify',
                            titleStyle: {
                                backgroundColor: LogPreDefinedColor.Purple,
                            },
                            messages: ['Error while identifying features', error],
                        })
                    })
            } else {
                log.error(
                    'No more features can be loaded for layer',
                    layer,
                    'at coordinate',
                    coordinate
                )
            }
        },

        /** Removes all selected features from the map */
        clearAllSelectedFeatures(dispatcher: ActionDispatcher) {
            this.selectedFeaturesByLayerId = []
            this.selectedEditableFeatures = []
            if (this.highlightedFeatureId) {
                this.highlightedFeatureId = undefined
            }
            const profileStore = useProfileStore()
            if (profileStore.feature) {
                profileStore.setProfileFeature({ feature: undefined }, dispatcher)
            }
        },

        setHighlightedFeatureId(
            highlightedFeatureId: string | undefined,
            dispatcher: ActionDispatcher
        ) {
            this.highlightedFeatureId = highlightedFeatureId
        },

        /**
         * In drawing mode, informs the store about the new coordinates of the feature. (It does not
         * move the feature.) Only change the coordinates if the feature is editable and part of the
         * currently selected features.
         *
         * Coordinates is an array of coordinate. Marker and text feature have only one entry in
         * this array while line and measure store each points describing them in this coordinates
         * array
         *
         * @param payload
         * @param payload.feature
         * @param payload.coordinates
         * @param dispatcher
         */
        changeFeatureCoordinates(
            payload: { feature: EditableFeature; coordinates: SingleCoordinate[] },
            dispatcher: ActionDispatcher
        ) {
            const { feature, coordinates } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (selectedFeature && selectedFeature.isEditable && Array.isArray(coordinates)) {
                selectedFeature.coordinates = coordinates
            }
        },

        changeFeatureGeometry(
            payload: { feature: EditableFeature; geometry: Geometry },
            dispatcher: ActionDispatcher
        ) {
            const { feature, geometry } = payload

            const selectedFeature: EditableFeature | undefined = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (selectedFeature && selectedFeature.isEditable && geometry) {
                selectedFeature.geometry = geometry
                const profileStore = useProfileStore()
                profileStore.setProfileFeature({ feature: selectedFeature }, dispatcher)
            }
        },

        /**
         * Changes the title of the feature. Only change the title if the feature is editable and
         * part of the currently selected features
         */
        changeFeatureTitle(
            payload: { feature: EditableFeature; title: string },
            dispatcher: ActionDispatcher
        ) {
            const { feature, title } = payload
            const selectedFeature: EditableFeature | undefined = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (selectedFeature && selectedFeature.isEditable) {
                selectedFeature.title = title
            }
        },

        /**
         * Changes the description of the feature. Only change the description if the feature is
         * editable and part of the currently selected features
         */
        changeFeatureDescription(
            payload: {
                feature: EditableFeature
                description: string
            },
            dispatcher: ActionDispatcher
        ) {
            const { feature, description } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (selectedFeature && selectedFeature.isEditable) {
                selectedFeature.description = description
            }
        },

        changeFeatureShownDescriptionOnMap(
            payload: { feature: EditableFeature; showDescriptionOnMap: boolean },
            dispatcher: ActionDispatcher
        ) {
            const { feature, showDescriptionOnMap } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (selectedFeature && selectedFeature.isEditable) {
                selectedFeature.showDescriptionOnMap = showDescriptionOnMap
            }
        },

        /**
         * Changes the color used to fill the feature. Only change the color if the feature is
         * editable, part of the currently selected features and that the given color is a valid
         * color from {@link FeatureStyleColor}
         */
        changeFeatureColor(
            payload: { feature: EditableFeature; color: FeatureStyleColor },
            dispatcher: ActionDispatcher
        ) {
            const { feature, color } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === color.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                selectedFeature.fillColor = color
            }
        },

        /**
         * Changes the text size of the feature. Only change the text size if the feature is
         * editable, part of the currently selected features and that the given size is a valid size
         * from {@link FeatureStyleSize}
         */
        changeFeatureTextSize(
            payload: { feature: EditableFeature; textSize: FeatureStyleSize },
            dispatcher: ActionDispatcher
        ) {
            const { feature, textSize } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            const wantedSize = allStylingSizes.find((size) => size.textScale === textSize.textScale)
            if (wantedSize && selectedFeature && selectedFeature.isEditable) {
                selectedFeature.textSize = textSize
            }
        },

        /**
         * Changes the text placement of the title of the feature. Only changes the text placement
         * if the feature is editable and part of the currently selected features
         */
        changeFeatureTextPlacement(
            payload: { feature: EditableFeature; textPlacement: TextPlacement },
            dispatcher: ActionDispatcher
        ) {
            const { feature, textPlacement } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            const wantedPlacement = Object.values(TextPlacement).find(
                (position) => position === textPlacement
            )
            if (wantedPlacement && selectedFeature && selectedFeature.isEditable) {
                selectedFeature.textPlacement = textPlacement
            }
        },

        /**
         * Changes the text offset of the feature. Only change the text offset if the feature is
         * editable and part of the currently selected features
         */
        changeFeatureTextOffset(
            payload: { feature: EditableFeature; textOffset: [number, number] },
            dispatcher: ActionDispatcher
        ) {
            const { feature, textOffset } = payload
            const editableFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (editableFeature && editableFeature.isEditable) {
                editableFeature.textOffset = textOffset
            }
        },

        /**
         * Changes the text color of the feature. Only change the text color if the feature is
         * editable, part of the currently selected features and that the given color is a valid
         * color from {@link FeatureStyleColor}
         */
        changeFeatureTextColor(
            payload: { feature: EditableFeature; textColor: FeatureStyleColor },
            dispatcher: ActionDispatcher
        ) {
            const { feature, textColor } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            const wantedColor = allStylingColors.find(
                (styleColor) => styleColor.name === textColor.name
            )
            if (wantedColor && selectedFeature && selectedFeature.isEditable) {
                selectedFeature.textColor = textColor
            }
        },

        /**
         * Changes the icon of the feature. Only change the icon if the feature is editable, part of
         * the currently selected feature, is a marker type feature and that the given icon is valid
         * (non-null)
         */
        changeFeatureIcon(
            payload: { feature: EditableFeature; icon: DrawingIcon },
            dispatcher: ActionDispatcher
        ) {
            const { feature, icon } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (
                icon &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.Marker
            ) {
                selectedFeature.icon = icon
            }
        },

        /**
         * Changes the icon size of the feature. Only change the icon size if the feature is
         * editable, part of the currently selected features, is a marker type feature and that the
         * given size is a valid size from {@link FeatureStyleSize}
         */
        changeFeatureIconSize(
            payload: { feature: EditableFeature; iconSize: FeatureStyleSize },
            dispatcher: ActionDispatcher
        ) {
            const { feature, iconSize } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            const wantedSize = allStylingSizes.find((size) => size.textScale === iconSize.textScale)
            if (
                wantedSize &&
                selectedFeature &&
                selectedFeature.isEditable &&
                selectedFeature.featureType === EditableFeatureTypes.Marker
            ) {
                selectedFeature.iconSize = iconSize
            }
        },

        /** In drawing mode, tells the state if a given feature is being dragged. */
        changeFeatureIsDragged(
            payload: { feature: EditableFeature; isDragged: boolean },
            dispatcher: ActionDispatcher
        ) {
            const { feature, isDragged } = payload
            const selectedFeature = getEditableFeatureWithId(
                this.selectedEditableFeatures,
                feature.id
            )
            if (selectedFeature && selectedFeature.isEditable) {
                selectedFeature.isDragged = isDragged
            }
        },

        /**
         * The goal of this function is to refresh the selected features according to changes that
         * happened in the store, but outside feature selection. For example, when we change the
         * language, we need to update the selected features otherwise we keep them in the old
         * language until new features are selected.
         */
        async updateFeatures(dispatcher: ActionDispatcher) {
            const featuresPromises: Promise<LayerFeature>[] = []

            const i18nStore = useI18nStore()
            const layersStore = useLayersStore()
            const mapStore = useMapStore()
            const positionStore = usePositionStore()
            const uiStore = useUIStore()

            this.selectedLayerFeatures.forEach((feature) => {
                // we avoid requesting the drawings and external layers, they're not handled here
                const currentFeatureLayer = layersStore.config.find(
                    (layer) => layer.id === feature.layer.id
                )
                if (currentFeatureLayer) {
                    featuresPromises.push(
                        getFeature(currentFeatureLayer, feature.id, positionStore.projection, {
                            lang: i18nStore.lang,
                            screenWidth: uiStore.width,
                            screenHeight: uiStore.height,
                            mapExtent: extentUtils.flattenExtent(positionStore.extent),
                            coordinate: mapStore.clickInfo?.coordinate,
                        })
                    )
                }
            })
            if (featuresPromises.length > 0) {
                try {
                    const responses = await Promise.allSettled(featuresPromises)
                    const features: LayerFeature[] = responses
                        .filter((response) => response.status === 'fulfilled')
                        .map((response) => response.value)
                    if (features.length > 0) {
                        // TODO: refactor this to use the new store and filter/map instead of reduce
                        // const updatedFeaturesByLayerId = state.selectedFeaturesByLayerId.reduce(
                        //     (updated_array, layer) => {
                        //         const rawLayer = toRaw(layer)
                        //         const rawLayerFeatures = rawLayer.features
                        //         rawLayer.features = features.reduce((features_array, feature) => {
                        //             if (feature.layer.id === rawLayer.layerId) {
                        //                 features_array.push(feature)
                        //             }
                        //             return features_array
                        //         }, [])
                        //         if (rawLayer.features.length === 0) {
                        //             rawLayer.features = rawLayerFeatures
                        //         }
                        //         updated_array.push(rawLayer)
                        //         return updated_array
                        //     },
                        //     []
                        // )
                        // await commit('setSelectedFeatures', {
                        //     layerFeaturesByLayerId: updatedFeaturesByLayerId,
                        //     drawingFeatures: state.selectedEditableFeatures,
                        //     ...dispatcher,
                        // })
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        log.error({
                            title: 'Feature store',
                            titleStyle: {
                                backgroundColor: LogPreDefinedColor.Purple,
                            },
                            messages: [
                                'Error while attempting to update already selected features',
                                error,
                            ],
                        })
                    }
                }
            }
        },
    },
})

export default useFeaturesStore
