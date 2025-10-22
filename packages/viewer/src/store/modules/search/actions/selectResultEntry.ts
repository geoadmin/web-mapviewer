import type { GeoAdminLayer, GPXLayer, KMLLayer } from '@swissgeo/layers'
import type Feature from 'ol/Feature'

import { extentUtils } from '@swissgeo/coordinates'
import { LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { SearchStore } from '@/store/modules/search/types/search'
import type { ActionDispatcher } from '@/store/types'

import getFeature, { type LayerFeature } from '@/api/features.api'
import search, {
    type LayerFeatureSearchResult,
    type LayerSearchResult,
    type LocationSearchResult,
    type SearchResult,
    SearchResultTypes,
} from '@/api/search.api'
import useFeaturesStore from '@/store/modules/features.store'
import useI18nStore from '@/store/modules/i18n.store'
import useLayersStore from '@/store/modules/layers.store'
import useMapStore from '@/store/modules/map.store'
import usePositionStore from '@/store/modules/position.store'
import createLayerFeature from '@/store/modules/search/utils/createLayerFeature'
import zoomToSearchResult from '@/store/modules/search/utils/zoomToSearchResult'
import useUIStore, { FeatureInfoPositions } from '@/store/modules/ui.store'
import { parseGpx } from '@/utils/gpxUtils'
import { parseKml } from '@/utils/kmlUtils'

export default function selectResultEntry(
    this: SearchStore,
    entry: SearchResult,
    dispatcher: ActionDispatcher
): void {
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
        search({
            outputProjection: positionStore.projection,
            queryString: this.query,
            lang: i18nStore.lang,
            layersToSearch: layerStore.visibleLayers,
            resolution: positionStore.resolution,
            limit: this.autoSelect ? 1 : undefined,
        }).then((resultIncludingLayerFeatures: SearchResult[]) => {
            if (resultIncludingLayerFeatures.length > this.results.length) {
                this.results = resultIncludingLayerFeatures
            }
        }).catch(error => {
            log.error({
                title: 'Search store / selectResultEntry',
                titleStyle: {
                    backgroundColor: LogPreDefinedColor.Red,
                },
                messages: ['Error while searching for layer features', entry, error, dispatcher],
            })
        })
    } else if (entry.resultType === SearchResultTypes.LOCATION) {
        const locationEntry = entry as LocationSearchResult
        zoomToSearchResult(locationEntry, dispatcher)
        if (locationEntry.coordinate) {
            mapStore.setPinnedLocation(locationEntry.coordinate, dispatcher)
        }
        this.setSearchQuery(locationEntry.sanitizedTitle.trim(), dispatcher)
    } else if (entry.resultType === SearchResultTypes.FEATURE) {
        const featureEntry = entry as LayerFeatureSearchResult
        zoomToSearchResult(featureEntry, dispatcher)

        // Automatically select the feature
        if (layerUtils.getTopicForIdentifyAndTooltipRequests(featureEntry.layer)) {
            getFeature(
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
            ).then((feature: LayerFeature) => {
                featuresStore.setSelectedFeatures(
                    {
                        features: [feature],
                    },
                    dispatcher
                )

                uiStore.setFeatureInfoPosition(FeatureInfoPositions.TOOLTIP, dispatcher)
            }).catch((error) => {
                log.error({
                    title: 'Search store / selectResultEntry',
                    messages: ['Error while getting feature', featureEntry, error, dispatcher],
                })
            })

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
                    features = parseGpx(gpxLayer.gpxData, positionStore.projection) || []
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
    }
    if (this.autoSelect) {
        this.setAutoSelect(false, dispatcher)
    }
}
