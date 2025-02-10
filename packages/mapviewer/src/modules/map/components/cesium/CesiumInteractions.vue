<script setup>
import { WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import log from '@geoadmin/log'
import {
    Cartesian2,
    Cartographic,
    Color,
    PostProcessStageLibrary,
    ScreenSpaceEventType,
} from 'cesium'
import { Point } from 'ol/geom'
import proj4 from 'proj4'
import { computed, inject, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import LayerFeature from '@/api/features/LayerFeature.class'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { unhighlightGroup } from '@/modules/map/components/cesium/utils/highlightUtils'
import useDragFileOverlay from '@/modules/map/components/common/useDragFileOverlay.composable'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import { createPixelExtentAround } from '@/utils/extentUtils'
import { identifyGeoJSONFeatureAt } from '@/utils/identifyOnVectorLayer'

const dispatcher = { dispatcher: 'CesiumInteractions.vue' }

const getViewer = inject('getViewer')

const hoveredHighlightPostProcessor = ref(null)
const clickedHighlightPostProcessor = ref(null)

const store = useStore()
const projection = computed(() => store.state.position.projection)
const resolution = computed(() => store.getters.resolution)
const visibleLayers = computed(() => store.getters.visibleLayers)
const cesiumBuildingLayer = computed(() => store.getters.cesiumBuildingLayer)
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
                hoveredHighlightPostProcessor.value,
                clickedHighlightPostProcessor.value,
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
function initialize3dHighlights() {
    hoveredHighlightPostProcessor.value = PostProcessStageLibrary.createEdgeDetectionStage()
    hoveredHighlightPostProcessor.value.uniforms.color = Color.BLUE
    hoveredHighlightPostProcessor.value.uniforms.length = 0.01
    hoveredHighlightPostProcessor.value.selected = []

    clickedHighlightPostProcessor.value = PostProcessStageLibrary.createEdgeDetectionStage()
    clickedHighlightPostProcessor.value.uniforms.color = Color.LIME
    clickedHighlightPostProcessor.value.uniforms.length = 0.01
    clickedHighlightPostProcessor.value.selected = []
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
function createBuildingFeature(building, coordinates) {
    const id = building.getProperty('EGID') ?? building.getProperty('UUID')
    const data = {
        EGID: building.getProperty('EGID') ?? '-',
        building_type: building.getProperty('OBJEKTART') ?? '-',
        building_height: building.getProperty('GESAMTHOEHE') ?? '-',
        max_roof_height: building.getProperty('DACH_MAX') ?? '-',
        ground_level: building.getProperty('GELAENDEPUNKT') ?? '-',
    }
    // round values)

    const feature = new LayerFeature({
        layer: cesiumBuildingLayer.value,
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
    return feature
}

function handleClickHighlight(features, coordinates) {
    clickedHighlightPostProcessor.value.selected = []

    if (hoveredHighlightPostProcessor.value.selected.length > 0) {
        features.push(
            createBuildingFeature(hoveredHighlightPostProcessor.value.selected[0], coordinates)
        )
        clickedHighlightPostProcessor.value.selected = [
            hoveredHighlightPostProcessor.value.selected[0],
        ]
        hoveredHighlightPostProcessor.value.selected = []
    }
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
    // Do you want to know something about this thing? It's horrible :)
    // 3d Buildings objects have no id, and we know they all have an UUID (they will have an EGID
    // in the future but it is not yet the case for all buildings). We filter on this property
    // to ensure the object we got is a building, and not another object which, for some reason,
    // has no id either. We need to make an additional filter, as bridges and cable cars would get
    // highlighted too, but we don't want that. So we filter on the fact that those 'OBJEKTART'
    // property is a number instead of a string.
    hoveredHighlightPostProcessor.value.selected = viewer.scene
        .drillPick(event.endPosition)
        .filter(
            (o) => !o.id && o.getProperty('UUID') && typeof o.getProperty('OBJEKTART') !== 'number'
        )
}

useDragFileOverlay(getViewer().container)
</script>

<template>
    <slot />
</template>
