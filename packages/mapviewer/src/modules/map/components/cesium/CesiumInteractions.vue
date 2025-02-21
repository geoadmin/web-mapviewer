<script setup>
import { WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import log from '@geoadmin/log'
import { Cartesian2, Cartographic, PostProcessStageLibrary, ScreenSpaceEventType } from 'cesium'
import { Point } from 'ol/geom'
import proj4 from 'proj4'
import { computed, inject, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import LayerFeature from '@/api/features/LayerFeature.class'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { get3dTilesBaseUrl } from '@/config/baseUrl.config'
import {
    clicked3DFeatureFill,
    hovered3DFeatureFill,
    unhighlightGroup,
} from '@/modules/map/components/cesium/utils/highlightUtils'
import useDragFileOverlay from '@/modules/map/components/common/useDragFileOverlay.composable'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import { createPixelExtentAround } from '@/utils/extentUtils'
import { identifyGeoJSONFeatureAt } from '@/utils/identifyOnVectorLayer'

const dispatcher = { dispatcher: 'CesiumInteractions.vue' }

const getViewer = inject('getViewer')

const hoveredHighlightPostProcessor = PostProcessStageLibrary.createEdgeDetectionStage()

const clickedHighlightPostProcessor = PostProcessStageLibrary.createEdgeDetectionStage()

const store = useStore()
const projection = computed(() => store.state.position.projection)
const resolution = computed(() => store.getters.resolution)
const visibleLayers = computed(() => store.getters.visibleLayers)
const layersWithTooltips = computed(() => store.getters.layersWithTooltips)
const featuresParamsByCesiumLayerId = computed(() => store.getters.featuresParamsByCesiumLayerId)
const selectedFeatures = computed(() => store.getters.selectedFeatures)
const visiblePrimitiveLayers = computed(() =>
    visibleLayers.value.filter(
        (l) => l instanceof GeoAdminGeoJsonLayer || l instanceof KMLLayer || l instanceof GPXLayer
    )
)

onMounted(() => {
    const viewer = getViewer()
    if (viewer) {
        initialize3dHighlights()
        viewer.scene.postProcessStages.add(
            PostProcessStageLibrary.createSilhouetteStage([
                hoveredHighlightPostProcessor,
                clickedHighlightPostProcessor,
            ])
        )
        viewer.screenSpaceEventHandler.setInputAction(onClick, ScreenSpaceEventType.LEFT_CLICK)
        viewer.screenSpaceEventHandler.setInputAction(
            onContextMenu,
            ScreenSpaceEventType.RIGHT_CLICK
        )
        viewer.screenSpaceEventHandler.setInputAction(onMouseMove, ScreenSpaceEventType.MOUSE_MOVE)
    }
})

// this is to remove the highlight when we close the tooltip
watch(selectedFeatures, () => {
    if (
        !selectedFeatures.value.find((feature) =>
            Object.keys(featuresParamsByCesiumLayerId.value).includes(feature.layer.id)
        ) &&
        clickedHighlightPostProcessor.selected.length > 0
    ) {
        clickedHighlightPostProcessor.selected = []
        const viewer = getViewer()
        viewer.scene.requestRender()
    }
})

function initialize3dHighlights() {
    hoveredHighlightPostProcessor.uniforms.color = hovered3DFeatureFill
    hoveredHighlightPostProcessor.uniforms.length = 0
    hoveredHighlightPostProcessor.selected = []

    clickedHighlightPostProcessor.uniforms.color = clicked3DFeatureFill
    clickedHighlightPostProcessor.uniforms.length = 0
    clickedHighlightPostProcessor.selected = []
}
function getCoordinateAtScreenCoordinate(x, y) {
    const cartesian = getViewer()?.scene.pickPosition(new Cartesian2(x, y))
    let coordinates = []
    if (cartesian) {
        const cartCoords = Cartographic.fromCartesian(cartesian)
        coordinates = proj4(WGS84.epsg, projection.value.epsg, [
            (cartCoords.longitude * 180) / Math.PI,
            (cartCoords.latitude * 180) / Math.PI,
        ])
    } else {
        log.error('no coordinate found at this screen coordinates', [x, y])
    }
    return coordinates
}

function getlayerIdFrom3dFeature(feature) {
    return feature.tileset?.resource?.url?.replace(get3dTilesBaseUrl(), '').split('/')[0]
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
function create3dFeature(feature, coordinates) {
    const layerId = getlayerIdFrom3dFeature(feature)
    const layer = layersWithTooltips.value.find((layer) => layer.id === layerId)
    const id = feature.getProperty(featuresParamsByCesiumLayerId.value[layerId].id) ?? '-'
    const data = {}
    for (const [key, value] of Object.entries(
        featuresParamsByCesiumLayerId.value[layerId].data.nonTranslated
    )) {
        data[key] = feature.getProperty(value)
    }
    for (const [key, value] of Object.entries(
        featuresParamsByCesiumLayerId.value[layerId].data.translated
    )) {
        data[key] = layerId + '_' + feature.getProperty(value)
    }
    return new LayerFeature({
        layer,
        id,
        data,
        name: id,
        coordinates,
        extent: createPixelExtentAround({
            size: 5,
            coordinates,
            projection: projection.value,
        }),
        geometry: new Point(coordinates),
    })
}

function handleClickHighlight(features, coordinates) {
    clickedHighlightPostProcessor.selected = []
    hoveredHighlightPostProcessor.selected.forEach((feature) => {
        features.push(create3dFeature(feature, coordinates))
    })
    clickedHighlightPostProcessor.selected = hoveredHighlightPostProcessor.selected

    hoveredHighlightPostProcessor.selected = []
}
function onClick(event) {
    const viewer = getViewer()
    unhighlightGroup(viewer)
    const features = []
    let coordinates = getCoordinateAtScreenCoordinate(event.position.x, event.position.y)

    const objects = viewer.scene.drillPick(event.position)

    log.debug(
        '[Cesium] click caught at',
        { pixel: event.position, coordinates },
        'with objects',
        objects
    )
    const kmlFeatures = {}
    // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
    visiblePrimitiveLayers.value
        .filter((l) => l instanceof GeoAdminGeoJsonLayer)
        .forEach((geoJSonLayer) => {
            features.push(
                ...identifyGeoJSONFeatureAt(
                    geoJSonLayer,
                    coordinates,
                    projection.value,
                    resolution.value
                )
            )
        })
    visiblePrimitiveLayers.value
        .filter((l) => l instanceof KMLLayer)
        .forEach((kmlLayer) => {
            objects
                .filter((obj) => obj.id?.layerId === kmlLayer.id)
                .forEach((kmlFeature) => {
                    log.debug(
                        '[Cesium] KML feature click detection',
                        kmlFeature,
                        'for KML layer',
                        kmlLayer
                    )
                    // TODO PB-1300 implement KML features selection here
                })
            features.push(...Object.values(kmlFeatures))
        })
    handleClickHighlight(features, coordinates)

    if (!coordinates.length && features.length) {
        const featureCoords = Array.isArray(features[0].coordinates[0])
            ? features[0].coordinates[0]
            : features[0].coordinates
        coordinates = proj4(projection.value.epsg, WEBMERCATOR.epsg, featureCoords)
    }

    store.dispatch('click', {
        clickInfo: new ClickInfo({
            coordinate: coordinates,
            pixelCoordinate: [event.position.x, event.position.y],
            features,
            clickType: ClickType.LEFT_SINGLECLICK,
        }),
        ...dispatcher,
    })
    viewer.scene.requestRender()
}

function onContextMenu(event) {
    const coordinates = getCoordinateAtScreenCoordinate(event.position.x, event.position.y)
    store.dispatch('click', {
        clickInfo: new ClickInfo({
            coordinate: coordinates,
            pixelCoordinate: [event.position.x, event.position.y],
            clickType: ClickType.CONTEXTMENU,
        }),
        ...dispatcher,
    })
}
// when moving over a building, we should highlight
function onMouseMove(event) {
    const viewer = getViewer()
    const aFeatureIsHighlighted = hoveredHighlightPostProcessor.selected.length === 1

    // we pick the first 3d feature if it's in the config
    const o = viewer.scene.pick(event.endPosition)
    if (
        o &&
        Object.keys(featuresParamsByCesiumLayerId.value).includes(getlayerIdFrom3dFeature(o))
    ) {
        hoveredHighlightPostProcessor.selected = [o]
        viewer.scene.requestRender()
    } else {
        hoveredHighlightPostProcessor.selected = []
        if (aFeatureIsHighlighted) {
            viewer.scene.requestRender()
        }
    }
}

useDragFileOverlay(getViewer().container)
</script>

<template>
    <slot />
</template>
