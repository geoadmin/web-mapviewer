import type { SingleCoordinate } from '@swissgeo/coordinates'

import {
    constants,
    coordinatesUtils,
    type CoordinateSystem,
    CustomCoordinateSystem,
    LV03,
} from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { SearchStore } from '@/store/modules/search/types/search'
import type { ActionDispatcher } from '@/store/types'

import reframe from '@/api/lv03Reframe.api'
import search, { type SearchResult } from '@/api/search.api'
import { isWhat3WordsString, retrieveWhat3WordsLocation } from '@/api/what3words.api'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position.store'
import getResultForAutoselect from '@/store/modules/search/utils/getResultForAutoselect'
import coordinateFromString from '@/utils/coordinates/coordinateExtractors'

interface SetSearchQueryOptions {
    /**
     * Used to select the first result if there is only one. Else it will not be, because this redo
     * search is done every time the page loads
     */
    originUrlParam?: boolean
}

export default function setSearchQuery(
    this: SearchStore,
    query: string,
    dispatcher: ActionDispatcher
): void
export default function setSearchQuery(
    this: SearchStore,
    query: string,
    options: SetSearchQueryOptions,
    dispatcher: ActionDispatcher
): void
export default function setSearchQuery(
    this: SearchStore,
    query: string,
    optionsOrDispatcher: SetSearchQueryOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
): void {
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)
    const options = dispatcherOrNothing ? (optionsOrDispatcher as SetSearchQueryOptions) : {}

    const originUrlParam = options.originUrlParam ?? false
    const mapStore = useMapStore()
    const positionStore = usePositionStore()

    const currentProjection: CoordinateSystem = positionStore.projection

    const results: SearchResult[] = []
    this.query = query

    // only firing search if the query is longer than or equal to 2 chars
    if (query.length >= 2) {
        // checking first if this corresponds to a set of coordinates (or a what3words)
        const extractedCoordinate = coordinateFromString(query)
        let what3wordLocation: SingleCoordinate | undefined
        if (!extractedCoordinate && isWhat3WordsString(query)) {
            retrieveWhat3WordsLocation(query, currentProjection)
                .then((location) => {
                    what3wordLocation = location
                    processWhat3WordsLocation(what3wordLocation, currentProjection, dispatcher)
                })
                .catch((error) => {
                    log.info({
                        title: 'Search store / setSearchQuery',
                        messages: [
                            `Query "${query}" is not a valid What3Words, fallback to service search`,
                            error,
                        ],
                    })
                    what3wordLocation = undefined
                    performSearch(this, query, currentProjection, originUrlParam, dispatcher)
                })
            return
        }

        if (extractedCoordinate) {
            let coordinates: SingleCoordinate = extractedCoordinate.coordinate
            if (extractedCoordinate.coordinateSystem !== currentProjection) {
                // Special case for LV03 input, we can't use proj4 to transform them into
                // LV95 or others, as the deformation between LV03 and the others is not constant.
                // So we pass through a LV95 REFRAME (done by a backend service that knows all deformations between the two)
                // and then go to the wanted coordinate system
                if (extractedCoordinate.coordinateSystem === LV03) {
                    reframe({
                        inputProjection: LV03,
                        inputCoordinates: coordinates,
                        outputProjection: currentProjection,
                    })
                        .then((reframedCoordinates) => {
                            coordinates = reframedCoordinates
                            applyCoordinates(coordinates, currentProjection, dispatcher)
                        })
                        .catch((error) => {
                            log.error({
                                title: 'Search store / setSearchQuery',
                                titleColor: LogPreDefinedColor.Red,
                                messages: [
                                    `Error while reframing coordinates from LV03 to ${currentProjection.epsg}`,
                                    error,
                                ],
                            })
                        })
                    return
                } else {
                    coordinates = coordinatesUtils.reprojectAndRound(
                        extractedCoordinate.coordinateSystem,
                        currentProjection,
                        coordinates
                    )
                }
            }
            applyCoordinates(coordinates, currentProjection, dispatcher)
        } else {
            performSearch(this, query, currentProjection, originUrlParam, dispatcher)
        }
    } else if (query.length === 0) {
        mapStore.clearPreviewPinnedLocation(dispatcher)
    }
    this.results = results
}

function applyCoordinates(
    coordinates: SingleCoordinate,
    currentProjection: CoordinateSystem,
    dispatcher: ActionDispatcher
): void {
    const positionStore = usePositionStore()
    const mapStore = useMapStore()
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
}

function processWhat3WordsLocation(
    what3wordLocation: SingleCoordinate,
    currentProjection: CoordinateSystem,
    dispatcher: ActionDispatcher
): void {
    if (what3wordLocation) {
        applyCoordinates(what3wordLocation, currentProjection, dispatcher)
    }
}

function performSearch(
    searchStore: SearchStore,
    query: string,
    currentProjection: CoordinateSystem,
    originUrlParam: boolean,
    dispatcher: ActionDispatcher
): void {
    const i18nStore = useI18nStore()
    const layerStore = useLayersStore()
    const positionStore = usePositionStore()
    search({
        outputProjection: currentProjection,
        queryString: query,
        lang: i18nStore.lang,
        layersToSearch: layerStore.visibleLayers,
        resolution: positionStore.resolution,
        limit: searchStore.autoSelect ? 1 : undefined,
    })
        .then((results) => {
            searchStore.results = results
            if (
                (originUrlParam && results.length === 1) ||
                (originUrlParam && searchStore.autoSelect && results.length >= 1)
            ) {
                searchStore.selectResultEntry(getResultForAutoselect(results), dispatcher)
            }
        })
        .catch((error) => {
            log.error({
                title: 'Search store / setSearchQuery / performSearch',
                messages: [`Error while searching for "${query}"`, error],
            })
        })
}
