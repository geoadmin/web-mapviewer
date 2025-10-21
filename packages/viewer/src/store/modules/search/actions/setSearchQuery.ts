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
import useI18nStore from '@/store/modules/i18n.store'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map.store'
import usePositionStore from '@/store/modules/position.store'
import getResultForAutoselect from '@/store/modules/search/utils/getResultForAutoselect'
import coordinateFromString from '@/utils/coordinates/coordinateExtractors'

export default async function setSearchQuery(
    this: SearchStore,
    payload: {
        query: string
        /**
         * Used to select the first result if there is only one. Else it will not be,
         * because this redo search is done every time the page loads
         */
        originUrlParam?: boolean
    },
    dispatcher: ActionDispatcher
): Promise<void> {
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
                what3wordLocation = await retrieveWhat3WordsLocation(query, currentProjection)
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
                    await this.selectResultEntry(getResultForAutoselect(results), dispatcher)
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
}
