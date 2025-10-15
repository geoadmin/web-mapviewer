import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoAdminLayer, GPXLayer, KMLLayer, Layer } from '@swissgeo/layers'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'

import {
    constants,
    coordinatesUtils,
    CoordinateSystem,
    CustomCoordinateSystem,
    extentUtils,
    LV03,
} from '@swissgeo/coordinates'
import { LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import GeoJSON from 'ol/format/GeoJSON'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import getFeature, {
    extractOlFeatureCoordinates,
    type LayerFeature,
    type SelectableFeature,
} from '@/api/features.api'
import reframe from '@/api/lv03Reframe.api'
import search, {
    type LayerFeatureSearchResult,
    type LayerSearchResult,
    type LocationSearchResult,
    type SearchResult,
    SearchResultTypes,
} from '@/api/search.api'
import { isWhat3WordsString, retrieveWhat3WordsLocation } from '@/api/what3words.api'
import useFeaturesStore from '@/store/modules/features.store'
import { useI18nStore } from '@/store/modules/i18n.store'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map.store'
import usePositionStore from '@/store/modules/position.store'
import useUIStore, { FeatureInfoPositions } from '@/store/modules/ui.store'
import coordinateFromString from '@/utils/coordinates/coordinateExtractors'
import { parseGpx } from '@/utils/gpxUtils'
import { parseKml } from '@/utils/kmlUtils'

function zoomToSearchResult(
    entry: LocationSearchResult | LayerFeatureSearchResult,
    dispatcher: ActionDispatcher
) {
    const positionStore = usePositionStore()
    if (entry.extent) {
        positionStore.zoomToExtent({ extent: entry.extent }, dispatcher)
    } else if (entry.zoom && entry.coordinate) {
        positionStore.setCenter(entry.coordinate, dispatcher)
        positionStore.setZoom(entry.zoom, dispatcher)
    }
}

export interface SearchState {
    /** The search query. It will trigger a search to the backend if it contains 3 or more characters */
    query: string
    /** Search results from the backend for the current query */
    results: SearchResult[]
    /** If true, the first search result will be automatically selected */
    autoSelect: boolean
}

export const useSearchStore = defineStore('search', {
    state: (): SearchState => ({
        query: '',
        results: [],
        autoSelect: false,
    }),
    getters: {},
    actions: {
        setAutoSelect(autoSelect: boolean, dispatcher: ActionDispatcher) {
            this.autoSelect = autoSelect
        },

        async setSearchQuery(
            payload: {
                query: string
                /**
                 * Used to select the first result if there is only one. Else it will not be,
                 * because this redo search is done every time the page loads
                 */
                originUrlParam?: boolean
            },
            dispatcher: ActionDispatcher
        ) {
            const { query, originUrlParam = false } = payload
            const i18nStore = useI18nStore()
            const layerStore = useLayersStore()
            const mapStore = useMapStore()
            const positionStore = usePositionStore()

            const currentProjection: CoordinateSystem = positionStore.projection

            let results: SearchResult[] = []
            this.query = query

            // only firing search if the query is longer than or equal to 2 chars
            if (query.length >= 2) {
                // checking first if this corresponds to a set of coordinates (or a what3words)
                const extractedCoordinate = coordinateFromString(query)
                let what3wordLocation: SingleCoordinate | undefined
                if (!extractedCoordinate && isWhat3WordsString(query)) {
                    try {
                        what3wordLocation = await retrieveWhat3WordsLocation(
                            query,
                            currentProjection
                        )
                    } catch (error) {
                        log.info({
                            title: 'Search store / setSearchQuery',
                            titleStyle: {
                                backgroundColor: LogPreDefinedColor.Red,
                            },
                            messages: [
                                `Query "${query}" is not a valid What3Words, fallback to service search`,
                                error,
                            ],
                        })
                        what3wordLocation = undefined
                    }
                }

                if (extractedCoordinate) {
                    let coordinates: SingleCoordinate = extractedCoordinate.coordinate
                    if (extractedCoordinate.coordinateSystem !== currentProjection) {
                        // Special case for LV03 input, we can't use proj4 to transform them into
                        // LV95 or others, as the deformation between LV03 and the others is not constant.
                        // So we pass through a LV95 REFRAME (done by a backend service that knows all deformations between the two)
                        // and then go to the wanted coordinate system
                        if (extractedCoordinate.coordinateSystem === LV03) {
                            coordinates = await reframe({
                                inputProjection: LV03,
                                inputCoordinates: coordinates,
                                outputProjection: currentProjection,
                            })
                        } else {
                            coordinates = coordinatesUtils.reprojectAndRound(
                                extractedCoordinate.coordinateSystem,
                                currentProjection,
                                coordinates
                            )
                        }
                    }
                    positionStore.setCenter(coordinates, dispatcher)
                    if (currentProjection instanceof CustomCoordinateSystem) {
                        positionStore.setZoom(
                            currentProjection.transformStandardZoomLevelToCustom(
                                constants.STANDARD_ZOOM_LEVEL_1_25000_MAP
                            ),
                            dispatcher
                        )
                    } else {
                        positionStore.setZoom(constants.STANDARD_ZOOM_LEVEL_1_25000_MAP, dispatcher)
                    }
                    mapStore.setPinnedLocation(coordinates, dispatcher)
                } else if (what3wordLocation) {
                    positionStore.setCenter(what3wordLocation, dispatcher)
                    if (currentProjection instanceof CustomCoordinateSystem) {
                        positionStore.setZoom(
                            currentProjection.transformStandardZoomLevelToCustom(
                                constants.STANDARD_ZOOM_LEVEL_1_25000_MAP
                            ),
                            dispatcher
                        )
                    } else {
                        positionStore.setZoom(constants.STANDARD_ZOOM_LEVEL_1_25000_MAP, dispatcher)
                    }
                    mapStore.setPinnedLocation(what3wordLocation, dispatcher)
                } else {
                    try {
                        results = await search({
                            outputProjection: currentProjection,
                            queryString: query,
                            lang: i18nStore.lang,
                            layersToSearch: layerStore.visibleLayers,
                            resolution: positionStore.resolution,
                            limit: this.autoSelect ? 1 : undefined,
                        })

                        if (
                            (originUrlParam && results.length === 1) ||
                            (originUrlParam && this.autoSelect && results.length >= 1)
                        ) {
                            await this.selectResultEntry(
                                getResultForAutoselect(results),
                                dispatcher
                            )
                        }
                    } catch (error) {
                        log.error({
                            title: 'Search store / setSearchQuery',
                            titleStyle: {
                                backgroundColor: LogPreDefinedColor.Red,
                            },
                            messages: [`Error while searching for "${query}"`, error],
                        })
                    }
                }
            } else if (query.length === 0) {
                mapStore.clearPreviewPinnedLocation(dispatcher)
            }
            this.results = results
        },

        async selectResultEntry(entry: SearchResult, dispatcher: ActionDispatcher) {
            const i18nStore = useI18nStore()
            const layerStore = useLayersStore()
            const mapStore = useMapStore()
            const positionStore = usePositionStore()
            const featuresStore = useFeaturesStore()
            const uiStore = useUIStore()

            if (entry.resultType === SearchResultTypes.LAYER) {
                const layerEntry = entry as LayerSearchResult
                if (layerStore.getActiveLayersById(layerEntry.layerId, false).length === 0) {
                    layerStore.addLayer(
                        { layerId: layerEntry.id, layerConfig: { isVisible: true } },
                        dispatcher
                    )
                } else {
                    layerStore.updateLayer(
                        { layerId: layerEntry.layerId, values: { isVisible: true } },
                        dispatcher
                    )
                }
                // launching a new search to get (potential) layer features
                try {
                    const resultIncludingLayerFeatures = await search({
                        outputProjection: positionStore.projection,
                        queryString: this.query,
                        lang: i18nStore.lang,
                        layersToSearch: layerStore.visibleLayers,
                        resolution: positionStore.resolution,
                        limit: this.autoSelect ? 1 : undefined,
                    })
                    if (resultIncludingLayerFeatures.length > this.results.length) {
                        this.results = resultIncludingLayerFeatures
                    }
                } catch (error) {
                    log.error({
                        title: 'Search store / selectResultEntry',
                        titleStyle: {
                            backgroundColor: LogPreDefinedColor.Red,
                        },
                        messages: [
                            'Error while searching for layer features',
                            entry,
                            error,
                            dispatcher,
                        ],
                    })
                }
            } else if (entry.resultType === SearchResultTypes.LOCATION) {
                const locationEntry = entry as LocationSearchResult
                zoomToSearchResult(locationEntry, dispatcher)
                if (locationEntry.coordinate) {
                    mapStore.setPinnedLocation(locationEntry.coordinate, dispatcher)
                }
                await this.setSearchQuery(
                    { query: locationEntry.sanitizedTitle.trim() },
                    dispatcher
                )
            } else if (entry.resultType === SearchResultTypes.FEATURE) {
                const featureEntry = entry as LayerFeatureSearchResult
                zoomToSearchResult(featureEntry, dispatcher)

                // Automatically select the feature
                try {
                    if (layerUtils.getTopicForIdentifyAndTooltipRequests(featureEntry.layer)) {
                        const feature = await getFeature(
                            // probably all feature results have to be geoadminlayer
                            featureEntry.layer as GeoAdminLayer,
                            featureEntry.featureId,
                            positionStore.projection,
                            {
                                lang: i18nStore.lang,
                                screenWidth: uiStore.width,
                                screenHeight: uiStore.height,
                                mapExtent: extentUtils.flattenExtent(positionStore.extent),
                                coordinate: featureEntry.coordinate,
                            }
                        )

                        featuresStore.setSelectedFeatures(
                            {
                                features: [feature],
                            },
                            dispatcher
                        )

                        uiStore.setFeatureInfoPosition(FeatureInfoPositions.TOOLTIP, dispatcher)
                    } else {
                        // For imported KML and GPX files
                        let features: Feature[] = []

                        if (featureEntry.layer.type === LayerType.KML) {
                            const kmlLayer: KMLLayer = featureEntry.layer as KMLLayer

                            features = parseKml(
                                kmlLayer,
                                positionStore.projection,
                                [],
                                positionStore.resolution
                            )
                        } else if (featureEntry.layer.type === LayerType.GPX) {
                            const gpxLayer = featureEntry.layer as GPXLayer

                            if (gpxLayer.gpxData) {
                                features =
                                    parseGpx(gpxLayer.gpxData, positionStore.projection) || []
                            } else {
                                log.warn({
                                    messages: [`Unable to parse GPX layer because of missing Data`],
                                })
                            }
                        }

                        const layerFeatures = features
                            .map((feature) => createLayerFeature(feature, featureEntry.layer))
                            .filter((feature) => !!feature)

                        if (layerFeatures) {
                            featuresStore.setSelectedFeatures(
                                {
                                    features: layerFeatures,
                                },
                                dispatcher
                            )

                            uiStore.setFeatureInfoPosition(FeatureInfoPositions.TOOLTIP, dispatcher)
                        }
                    }
                } catch (error) {
                    log.error('Error getting feature:', { messages: [error] })
                }
            }
            if (this.autoSelect) {
                this.setAutoSelect(false, dispatcher)
            }
        },
    },
})

/**
 * Returns the appropriate result for autoselection from a list of search results.
 *
 * If there is only one result, it returns that result. Otherwise, it tries to find a result with
 * the resultType of LOCATION. If such a result is found, it returns that result. If no result with
 * resultType LOCATION is found, it returns the first result in the list.
 *
 * @param results - The list of search results.
 * @returns The selected search result for autoselection.
 */
function getResultForAutoselect(results: SearchResult[]): SearchResult {
    if (results.length === 1 && results[0]) {
        return results[0]
    }

    // Try to find a result with resultType LOCATION
    const locationResult = results.find(
        (result) => result.resultType === SearchResultTypes.LOCATION
    )

    // If a location result is found, return it; otherwise, return the first result
    return locationResult ?? results[0]! // the outer function established that this element should exist
}

function createLayerFeature(
    olFeature: Feature<Geometry>,
    layer: Layer
): SelectableFeature<false> | undefined {
    const geometry = olFeature.getGeometry()

    if (!geometry) {
        return
    }

    const coordinates = extractOlFeatureCoordinates(olFeature)

    const layerFeature: LayerFeature = {
        layer: layer,
        id: olFeature.getId() ?? olFeature.get('name'),
        title:
            olFeature.get('label') ??
            // exception for MeteoSchweiz GeoJSONs, we use the station name instead of the ID
            // some of their layers are
            // - ch.meteoschweiz.messwerte-niederschlag-10min
            // - ch.meteoschweiz.messwerte-lufttemperatur-10min
            olFeature.get('station_name') ??
            // GPX track feature don't have an ID but have a name !
            olFeature.get('name') ??
            olFeature.getId(),
        data: {
            title: olFeature.get('name'),
            description: olFeature.get('description'),
        },
        coordinates,
        geometry: new GeoJSON().writeGeometryObject(geometry),
        extent: geometry.getExtent() as FlatExtent,
        isEditable: false,
        popupDataCanBeTrusted: false,
    }
    return layerFeature
}

export default useSearchStore
