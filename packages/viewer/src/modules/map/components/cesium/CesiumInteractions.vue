<script setup lang="ts">
import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import { extentUtils, WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { bbox, centroid } from '@turf/turf'
import {
    Cartesian2,
    Cartesian3,
    Cartographic,
    Math as CesiumMath,
    PostProcessStageLibrary,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    Viewer,
} from 'cesium'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Point, Polygon } from 'ol/geom'
import proj4 from 'proj4'
import { computed, onMounted, onUnmounted, watch } from 'vue'

import type { GeoAdminGeoJSONLayer, KMLLayer as KMLLayerType, Layer } from '@swissgeo/layers'
import { LayerType } from '@swissgeo/layers'

import { get3dTilesBaseUrl } from '@/config/baseUrl.config'
import {
    clicked3DFeatureFill,
    hovered3DFeatureFill,
    unhighlightGroup,
} from '@/modules/map/components/cesium/utils/highlightUtils'
import useDragFileOverlay from '@/modules/map/components/common/useDragFileOverlay.composable'
import useMapStore, { ClickType } from '@/store/modules/map.store'
import type { LayerFeature, SelectableFeature } from '@/api/features.api'
import useCesiumStore from '@/store/modules/cesium.store'
import useFeaturesStore from '@/store/modules/features.store'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'
import { identifyGeoJSONFeatureAt } from '@/utils/identifyOnVectorLayer'
import { getCesiumViewer } from '@/modules/map/components/cesium/utils/viewerUtils'
import type { ActionDispatcher } from '@/store/types'
import type { LayerTooltipConfig } from '@/config/cesium.config'
import { getSafe } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'CesiumInteractions.vue' }

const hoveredHighlightPostProcessor = PostProcessStageLibrary.createEdgeDetectionStage()

const clickedHighlightPostProcessor = PostProcessStageLibrary.createEdgeDetectionStage()

const positionStore = usePositionStore()
const layersStore = useLayersStore()
const cesiumStore = useCesiumStore()
const featuresStore = useFeaturesStore()
const mapStore = useMapStore()

const selectedFeatures = computed(() => featuresStore.selectedFeatures)
const visiblePrimitiveLayers = computed(() =>
    layersStore.visibleLayers.filter((l: Layer) =>
        [LayerType.GEOJSON, LayerType.KML, LayerType.GPX].includes(l.type)
    )
)

const viewer = getCesiumViewer()
if (!viewer) {
    log.error({
        title: 'CesiumInteractions.vue',
        titleColor: LogPreDefinedColor.Blue,
        message: ['Viewer not initialized, cannot initialize Cesium interactions'],
    })
    throw new Error('Viewer not initialized, cannot initialize Cesium interactions')
}

onMounted(() => {
    initialize3dHighlights()
    viewer.scene.postProcessStages.add(
        PostProcessStageLibrary.createSilhouetteStage([
            hoveredHighlightPostProcessor,
            clickedHighlightPostProcessor,
        ])
    )
    viewer.screenSpaceEventHandler.setInputAction(onClick, ScreenSpaceEventType.LEFT_CLICK)
    viewer.screenSpaceEventHandler.setInputAction(onContextMenu, ScreenSpaceEventType.RIGHT_CLICK)
    viewer.screenSpaceEventHandler.setInputAction(onMouseMove, ScreenSpaceEventType.MOUSE_MOVE)
})

onUnmounted(() => {
    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK)
    viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
    viewer.scene.postProcessStages.remove(hoveredHighlightPostProcessor)
    viewer.scene.postProcessStages.remove(clickedHighlightPostProcessor)
})

// this is to remove the highlight when we close the tooltip
watch(selectedFeatures, () => {
    if (
        !selectedFeatures.value.find((feature) => {
            if ('layer' in feature) {
                return cesiumStore.layersTooltipConfig
                    .map((layerConfig) => layerConfig.layerId)
                    .includes(feature.layer.id)
            }
            return false
        }) &&
        clickedHighlightPostProcessor.selected.length > 0
    ) {
        clickedHighlightPostProcessor.selected = []
        viewer.scene.requestRender()
    }
})

function initialize3dHighlights(): void {
    hoveredHighlightPostProcessor.uniforms.color = hovered3DFeatureFill
    hoveredHighlightPostProcessor.uniforms.length = 0
    hoveredHighlightPostProcessor.selected = []

    clickedHighlightPostProcessor.uniforms.color = clicked3DFeatureFill
    clickedHighlightPostProcessor.uniforms.length = 0
    clickedHighlightPostProcessor.selected = []
}
function getCoordinateAtScreenCoordinate(x: number, y: number): SingleCoordinate | undefined {
    const cartesian = getCesiumViewer()?.scene.pickPosition(new Cartesian2(x, y))
    let coordinates: SingleCoordinate | undefined
    if (cartesian) {
        const cartCoords = Cartographic.fromCartesian(cartesian)
        coordinates = proj4(WGS84.epsg, positionStore.projection.epsg, [
            (cartCoords.longitude * 180) / CesiumMath.PI,
            (cartCoords.latitude * 180) / CesiumMath.PI,
        ]) as SingleCoordinate
    } else {
        log.error({
            title: 'CesiumInteractions.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['no coordinate found at this screen coordinates', [x, y]],
        })
    }
    return coordinates
}

function getLayerIdFrom3dFeature(featureTileSetResourceUrl: string): string | undefined {
    return featureTileSetResourceUrl.replace(get3dTilesBaseUrl(), '').split('/')[0]
}

function getFeatureProperty(
    feature: LayerFeature,
    propertyName: string,
    defaultValue: string
): string {
    let value: string | undefined = getSafe<string>(feature, propertyName)
    if (!value && feature.data) {
        value = getSafe<string>(feature.data, propertyName)
    }
    if (!value) {
        value = defaultValue
    }
    return value
}

/**
 * This is temporary until we have a way to grab the features from the backend. Until then, this
 * will stay in. It uses the configuration found in the store to check if the feature can give a
 * tooltip.
 *
 * @param feature {Object} a feature in the 3d layer, which contains the data needed in the feature
 * @param coordinates {[Number, Number]} x,y coordinates of the 'click', because features need it
 *
 *   Return LayerFeature a layer feature from the 3d layer
 */
function create3dFeature(
    feature: LayerFeature,
    coordinates: SingleCoordinate
): LayerFeature | undefined {
    const layerId = getLayerIdFrom3dFeature(feature.id.toString())

    const layer = cesiumStore.layersWithTooltips.find((layer: Layer) => layer.id === layerId)
    const layerConfig = cesiumStore.layersTooltipConfig.find(
        (layerConfig: LayerTooltipConfig) => layerConfig.layerId === layerId
    )
    if (!layer || !layerConfig) {
        return
    }
    const id = getFeatureProperty(feature, layerConfig.idParam, '-')
    const data: Record<string, string> = {}
    layerConfig.nonTranslatedKeys.forEach((property: string) => {
        data[`${layerId}_${property}`] = getFeatureProperty(
            feature,
            property,
            `${layerId}_no_data_available`
        )
    })
    layerConfig.translatedKeys.forEach((property: string) => {
        data[`${layerId}_${property}`] =
            `${layerId}_${getFeatureProperty(feature, property, '_no_data_available')}`
    })
    return {
        isEditable: false,
        layer,
        id,
        data,
        title: id.toString(),
        coordinates,
        extent: extentUtils.createPixelExtentAround({
            size: 5,
            coordinate: coordinates,
            projection: positionStore.projection,
            resolution: positionStore.resolution,
        }),
        // geometry intentionally omitted for 3D tiles features
        popupDataCanBeTrusted: true,
    }
}

function handleClickHighlight(
    features: SelectableFeature<false>[],
    coordinates: SingleCoordinate | []
): void {
    clickedHighlightPostProcessor.selected = hoveredHighlightPostProcessor.selected
    hoveredHighlightPostProcessor.selected.forEach((feature) => {
        if (Array.isArray(coordinates) && coordinates.length === 2) {
            const lf = create3dFeature(feature, coordinates)
            if (lf) features.push(lf)
        }
    })
    hoveredHighlightPostProcessor.selected = []
}

function onClick(event: ScreenSpaceEventHandler.PositionedEvent): void {
    unhighlightGroup(viewer)
    const features: SelectableFeature<false | true>[] = []
    let coordinates = getCoordinateAtScreenCoordinate(event.position.x, event.position.y)

    const objects = viewer!.scene.drillPick(event.position) ?? []

    log.debug({
        title: 'CesiumInteractions.vue',
        titleColor: LogPreDefinedColor.Blue,
        message: [
            'click caught at',
            { pixel: event.position, coordinates },
            'with objects',
            objects,
        ],
    })

    // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        visiblePrimitiveLayers.value
            .filter((layer: Layer) => layer.type === LayerType.GEOJSON)
            .forEach((geoJSonLayer: Layer) => {
                const identified = identifyGeoJSONFeatureAt(
                    geoJSonLayer as GeoAdminGeoJSONLayer,
                    coordinates as SingleCoordinate,
                    positionStore.projection,
                    positionStore.resolution
                )
                if (Array.isArray(identified)) {
                    features.push(...identified.filter((f) => f !== undefined))
                }
            })
    }

    visiblePrimitiveLayers.value
        .filter((layer: Layer) => layer.type === LayerType.KML)
        .forEach((kmlLayer: Layer) => {
            objects
                .filter((obj) => obj.id?.layerId === kmlLayer.id)
                .forEach((kmlFeature) => {
                    log.debug({
                        title: 'CesiumInteractions.vue',
                        titleColor: LogPreDefinedColor.Blue,
                        message: [
                            'KML feature click detection',
                            kmlFeature,
                            'for KML layer',
                            kmlLayer,
                        ],
                    })
                    const kmlLayerFeature = create3dKmlFeature(
                        viewer!,
                        kmlFeature,
                        kmlLayer as KMLLayerType
                    )
                    if (kmlLayerFeature) {
                        features.push(kmlLayerFeature)
                    }
                })
        })

    handleClickHighlight(features as SelectableFeature<false>[], coordinates!)

    if ((!Array.isArray(coordinates) || !coordinates.length) && features.length) {
        const featureCoords = Array.isArray(features[0]!.coordinates?.[0])
            ? features[0]!.coordinates[0]
            : features[0]!.coordinates
        coordinates = proj4(
            positionStore.projection.epsg,
            WEBMERCATOR.epsg,
            featureCoords as SingleCoordinate
        )
    }
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        mapStore.click(
            {
                coordinate: coordinates,
                pixelCoordinate: [event.position.x, event.position.y],
                features: features as SelectableFeature<false>[],
                clickType: ClickType.LeftSingleClick,
            },
            dispatcher
        )
    } else {
        mapStore.click(undefined, dispatcher)
    }
    viewer?.scene.requestRender()
}

function create3dKmlFeature(
    viewer: Viewer,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kmlFeature: any, // TODO figure out what type this is, might be KmlFeatureData
    kmlLayer: KMLLayerType
): LayerFeature | undefined {
    if (!kmlFeature || !kmlFeature.id) {
        return
    }
    let geometry: Point | LineString | Polygon | undefined
    let featureCoordinates: number[] | number[][] | undefined
    if (kmlFeature.id.position) {
        const position = kmlFeature.id.position.getValue(viewer.clock.currentTime)
        const cartographic = Cartographic.fromCartesian(position)
        // position is in Cartesian then it is converted to WGS84 to project it then to WEBMERCATOR
        featureCoordinates = proj4(WGS84.epsg, WEBMERCATOR.epsg, [
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
        ])
        geometry = new Point(featureCoordinates)
    }
    if (kmlFeature.id.polyline) {
        const positions = kmlFeature.id.polyline.positions.getValue(viewer.clock.currentTime)
        const polylineCoords = positions.map((pos: Cartesian3) => {
            // pos is in Cartesian then it is converted to WGS84 to project it then to WEBMERCATOR
            const carto = Cartographic.fromCartesian(pos)
            const lon = CesiumMath.toDegrees(carto.longitude)
            const lat = CesiumMath.toDegrees(carto.latitude)

            return proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, lat])
        })
        featureCoordinates = polylineCoords
        geometry = new LineString(polylineCoords)
    }
    if (kmlFeature.id.polygon) {
        const hierarchy = kmlFeature.id.polygon.hierarchy.getValue(viewer.clock.currentTime)

        const polygonCoords = hierarchy.positions.map((pos: Cartesian3) => {
            // pos is in Cartesian then it is converted to WGS84 to project it then to WEBMERCATOR
            const carto = Cartographic.fromCartesian(pos)
            const lon = CesiumMath.toDegrees(carto.longitude)
            const lat = CesiumMath.toDegrees(carto.latitude)

            return proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, lat])
        })
        featureCoordinates = polygonCoords
        geometry = new Polygon([polygonCoords])
    }
    if (!geometry) {
        return undefined
    }
    const geoJsonGeometry = new GeoJSON().writeGeometryObject(geometry)
    const extent = bbox(geoJsonGeometry)
    return {
        isEditable: false,
        layer: kmlLayer,
        id: kmlFeature.id.id,
        data: {
            title: kmlFeature.id.name,
            description: kmlFeature.id.description,
        },
        title: kmlFeature.id.name || kmlFeature.id.id,
        coordinates: centroid(geoJsonGeometry).geometry.coordinates as SingleCoordinate,
        extent: extentUtils.flattenExtent(extent as FlatExtent),
        geometry: geoJsonGeometry,
        popupDataCanBeTrusted: false,
    }
}

function onContextMenu(event: ScreenSpaceEventHandler.PositionedEvent): void {
    const coordinates = getCoordinateAtScreenCoordinate(event.position.x, event.position.y)
    if (Array.isArray(coordinates) && coordinates.length === 2) {
        mapStore.click(
            {
                coordinate: coordinates,
                pixelCoordinate: [event.position.x, event.position.y],
                clickType: ClickType.ContextMenu,
            },
            dispatcher
        )
    }
}
// when moving over a building, we should highlight
function onMouseMove(event: ScreenSpaceEventHandler.MotionEvent): void {
    const viewer = getCesiumViewer()
    const aFeatureIsHighlighted = hoveredHighlightPostProcessor.selected.length === 1

    // we pick the first 3d feature if it's in the config
    const object = viewer?.scene.pick(event.endPosition)
    if (
        object &&
        cesiumStore.layersTooltipConfig
            .map((layerConfig) => layerConfig.layerId)
            .includes(getLayerIdFrom3dFeature(object)!)
    ) {
        hoveredHighlightPostProcessor.selected = [object]
        viewer?.scene.requestRender()
    } else {
        hoveredHighlightPostProcessor.selected = []
        if (aFeatureIsHighlighted) {
            viewer?.scene.requestRender()
        }
    }
}

const viewerForDrag = getCesiumViewer()
if (viewerForDrag) {
    useDragFileOverlay(viewerForDrag.container as HTMLElement)
}
</script>

<template>
    <slot />
</template>
