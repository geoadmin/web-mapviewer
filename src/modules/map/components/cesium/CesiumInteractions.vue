<script setup>
import { Cartesian2, Cartographic, ScreenSpaceEventType } from 'cesium'
import proj4 from 'proj4'
import { computed, inject, onMounted } from 'vue'
import { useStore } from 'vuex'

import { extractOlFeatureGeodesicCoordinates } from '@/api/features/features.api'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { unhighlightGroup } from '@/modules/map/components/cesium/utils/highlightUtils'
import useDragFileOverlay from '@/modules/map/components/common/useDragFileOverlay.composable'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { identifyGeoJSONFeatureAt } from '@/utils/identifyOnVectorLayer'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'CesiumInteractions.vue' }

const getViewer = inject('getViewer')

const store = useStore()
const projection = computed(() => store.state.position.projection)
const resolution = computed(() => store.getters.resolution)
const visibleLayers = computed(() => store.getters.visibleLayers)
const visiblePrimitiveLayers = computed(() =>
    visibleLayers.value.filter(
        (l) => l instanceof GeoAdminGeoJsonLayer || l instanceof KMLLayer || l instanceof GPXLayer
    )
)

onMounted(() => {
    const viewer = getViewer()
    if (viewer) {
        viewer.screenSpaceEventHandler.setInputAction(onClick, ScreenSpaceEventType.LEFT_CLICK)
        viewer.screenSpaceEventHandler.setInputAction(
            onContextMenu,
            ScreenSpaceEventType.RIGHT_CLICK
        )
    }
})

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

function onClick(event) {
    const viewer = getViewer()
    unhighlightGroup(viewer)
    const features = []
    let coordinates = getCoordinateAtScreenCoordinate(event.position.x, event.position.y)

    let objects = viewer.scene.drillPick(event.position)
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
        .forEach((KMLLayer) => {
            objects
                .filter((obj) => obj.primitive?.olLayer?.get('id') === KMLLayer.id)
                .forEach((obj) => {
                    const feature = obj.primitive.olFeature
                    if (!kmlFeatures[feature.getId()]) {
                        const editableFeature = feature.get('editableFeature')
                        if (editableFeature) {
                            editableFeature.geodesicCoordinates =
                                extractOlFeatureGeodesicCoordinates(feature)
                            editableFeature.geometry = feature.getGeometry()
                            kmlFeatures[feature.getId()] = editableFeature
                        } else {
                            // TODO
                            log.debug(
                                'KMLs which are not editable Features are not supported for selection'
                            )
                        }
                    }
                })
            features.push(...Object.values(kmlFeatures))
        })
    // Cesium can't pick position when click on primitive
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

useDragFileOverlay(getViewer().container)
</script>

<template>
    <slot />
</template>
