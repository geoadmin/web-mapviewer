<script setup>
import 'cesium/Build/Cesium/Widgets/widgets.css'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import * as cesium from 'cesium'
import {
    Cartesian2,
    Cartesian3,
    CesiumTerrainProvider,
    Color,
    defined,
    Ellipsoid,
    JulianDate,
    Math as CesiumMath,
    RequestScheduler,
    ScreenSpaceEventType,
    ShadowMode,
    SkyBox,
    Viewer,
} from 'cesium'
import { LineString, Point, Polygon } from 'ol/geom'
import proj4 from 'proj4'
import {
    computed,
    onBeforeMount,
    onBeforeUnmount,
    onMounted,
    onUnmounted,
    provide,
    ref,
    watch,
} from 'vue'
import { useStore } from 'vuex'

import { extractOlFeatureGeodesicCoordinates } from '@/api/features/features.api'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import {
    BASE_URL_3D_TILES,
    DEFAULT_PROJECTION,
    IS_TESTING_WITH_CYPRESS,
    WMS_BASE_URL,
    WMTS_BASE_URL,
} from '@/config'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import CesiumInternalLayer from '@/modules/map/components/cesium/CesiumInternalLayer.vue'
import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import CesiumToolbox from '@/modules/map/components/cesium/CesiumToolbox.vue'
import {
    CAMERA_MAX_PITCH,
    CAMERA_MAX_ZOOM_DISTANCE,
    CAMERA_MIN_PITCH,
    CAMERA_MIN_ZOOM_DISTANCE,
    TERRAIN_URL,
} from '@/modules/map/components/cesium/constants'
import {
    calculateHeight,
    getCoordinateAtScreenCoordinate,
    limitCameraCenter,
    limitCameraPitchRoll,
} from '@/modules/map/components/cesium/utils/cameraUtils'
import {
    highlightGroup,
    unhighlightGroup,
} from '@/modules/map/components/cesium/utils/highlightUtils'
import useOnMapResize from '@/modules/map/components/common/useOnMapResize.composable'
import { ClickType } from '@/store/modules/map.store'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { identifyGeoJSONFeatureAt } from '@/utils/identifyOnVectorLayer'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'CesiumMap.vue' }

/** To keep track of long touch */
let contextMenuTimeoutId = null

const cesiumContainer = ref(null)
/** Flag Telling when the Cesium viewer has been set up and can be used */
const viewerCreated = ref(false)
const popoverCoordinates = ref([])

/** @type {Viewer | null} */
let viewer = null
// sharing cesium viewer object with children components through a function, as we can't build it
// without the HTML element on which to hook it up (that's a little difference with OL...)
provide('getCesiumViewer', () => viewer)

const store = useStore()
const rotation = computed(() => store.state.position.rotation)
const cameraPosition = computed(() => store.state.position.camera)
const previewYear = computed(() => store.state.layers.previewYear)
const projection = computed(() => store.state.position.projection)
const isFullScreenMode = computed(() => store.state.ui.fullscreenMode)
const selectedFeatures = computed(() => store.getters.selectedFeatures)
const centerEpsg4326 = computed(() => store.getters.centerEpsg4326)
const resolution = computed(() => store.getters.resolution)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const visibleLayers = computed(() => store.getters.visibleLayers)
const backgroundLayersFor3D = computed(() => store.getters.backgroundLayersFor3D)
const showFeatureInfoInTooltip = computed(() => store.getters.showFeatureInfoInTooltip)
const isDesktopMode = computed(() => store.getters.isDesktopMode)

const isProjectionWebMercator = computed(() => projection.value.epsg === WEBMERCATOR.epsg)
const visibleImageryLayers = computed(() =>
    visibleLayers.value.filter(
        (l) => l instanceof GeoAdminWMTSLayer || l instanceof GeoAdminWMSLayer
    )
)
const visiblePrimitiveLayers = computed(() =>
    visibleLayers.value.filter((l) => l instanceof GeoAdminGeoJsonLayer || l instanceof KMLLayer)
)
const showFeaturesPopover = computed(
    () => showFeatureInfoInTooltip.value && selectedFeatures.value.length > 0
)
const editFeature = computed(() => selectedFeatures.value.find((feature) => feature.isEditable))
const startingZIndexForImageryLayers = computed(() =>
    backgroundLayersFor3D.value.some((layer) => layer.type === LayerTypes.WMTS) ? 1 : 0
)

onBeforeMount(() => {
    // Global variable required for Cesium and point to the URL where four static directories (see vite.config) are served
    // https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/#install-with-npm
    window['CESIUM_BASE_URL'] = '.'

    // required for ol-cesium
    window['Cesium'] = cesium

    const withoutSchemeAndTrailingSlash = (url) => {
        const urlWithoutScheme = url.replace('https://', '')
        return urlWithoutScheme.endsWith('/')
            ? urlWithoutScheme.slice(0, urlWithoutScheme.length - 1)
            : urlWithoutScheme
    }
    const backendUsedToServe3dData = {}
    backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(BASE_URL_3D_TILES)}:443`] = 18
    backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(WMTS_BASE_URL)}:443`] = 18
    backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(WMS_BASE_URL)}:443`] = 18
    // A per server key list of overrides to use for throttling limits.
    // Useful when streaming data from a known HTTP/2 or HTTP/3 server.
    Object.assign(RequestScheduler.requestsByServer, backendUsedToServe3dData)
})

onMounted(() => {
    if (isProjectionWebMercator.value) {
        createViewer()
    } else {
        log.warn('Projection is not yet set to WebMercator, Cesium will not load yet')
    }
    log.info('CesiumMap component mounted and ready')
})

onBeforeUnmount(() => {
    if (viewer) {
        // the camera position that is for now dispatched to the store doesn't correspond where the 2D
        // view is looking at, as if the camera is tilted, its position will be over swaths of lands that
        // have nothing to do with the top-down 2D view.
        // here we ray trace the coordinate of where the camera is looking at, and send this "target"
        // to the store as the new center
        setCenterToCameraTarget()
    }
})

onUnmounted(() => {
    store.dispatch('setCameraPosition', { position: null, ...dispatcher })
    viewer.destroy()
})

useOnMapResize(cesiumContainer)

// we need to deep watch this as otherwise we aren't triggered when
// coordinates are changed (but only when one feature is added/removed)
watch(
    selectedFeatures,
    (newSelectedFeatures) => {
        if (newSelectedFeatures.length > 0) {
            highlightSelectedFeatures()
        }
    },
    { deep: true }
)

watch(
    isProjectionWebMercator,
    () => {
        if (!viewer && isProjectionWebMercator.value) {
            createViewer()
        } else {
            log.error('Cesium only supports WebMercator as projection')
        }
    },
    {
        // so that we trigger the handler AFTER the component has updated
        // (meaning after the main <div> has been added and can be linked to Cesium)
        // see https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing
        flush: 'post',
    }
)
watch(
    centerEpsg4326,
    () => {
        if (isProjectionWebMercator.value && cameraPosition.value) {
            flyToPosition()
        }
    },
    {
        flush: 'post',
    }
)

async function createViewer() {
    viewer = new Viewer(cesiumContainer.value, {
        contextOptions: {
            webgl: {
                powerPreference: 'high-performance',
            },
        },
        showRenderLoopErrors: hasDevSiteWarning.value,
        // de-activating default Cesium UI elements
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        // each geometry instance will only be rendered in 3D to save GPU memory.
        scene3DOnly: true,
        // activating shadows so that buildings cast shadows on the ground/roof elements
        shadows: true,
        // no casting of buildings shadow on the terrain
        terrainShadows: ShadowMode.DISABLED,
        // skybox/stars visible if sufficiently zoomed out and looking at the horizon
        skyBox: new SkyBox({
            sources: {
                positiveX: new URL('./assets/starbox_px.jpg', import.meta.url).href,
                negativeX: new URL('./assets/starbox_mx.jpg', import.meta.url).href,
                positiveY: new URL('./assets/starbox_py.jpg', import.meta.url).href,
                negativeY: new URL('./assets/starbox_my.jpg', import.meta.url).href,
                positiveZ: new URL('./assets/starbox_pz.jpg', import.meta.url).href,
                negativeZ: new URL('./assets/starbox_mz.jpg', import.meta.url).href,
            },
        }),
        // we want to see the stars!
        skyAtmosphere: false,
        baseLayer: false,
        useBrowserRecommendedResolution: true,
        terrainProvider: await CesiumTerrainProvider.fromUrl(TERRAIN_URL),
        requestRenderMode: true,
    })

    const clock = viewer.clock
    // good time/date for lighting conditions
    clock.currentTime = JulianDate.fromIso8601('2024-06-20T07:00')

    const shadowMap = viewer.shadowMap
    // lighter shadow than default (closer to 0.1 the darker)
    shadowMap.darkness = 0.6
    // increasing shadowMap size 4x the default value, to reduce shadow artifacts at the edges of roofs
    shadowMap.size = 2048 * 4

    const scene = viewer.scene
    scene.useDepthPicking = true
    scene.pickTranslucentDepth = true
    scene.backgroundColor = Color.TRANSPARENT

    viewer.camera.moveEnd.addEventListener(onCameraMoveEnd)
    viewer.screenSpaceEventHandler.setInputAction(onClick, ScreenSpaceEventType.LEFT_CLICK)

    const globe = scene.globe
    globe.baseColor = Color.WHITE
    globe.depthTestAgainstTerrain = true
    globe.showGroundAtmosphere = false
    globe.showWaterEffect = false
            // increases the LOD (Cesium will load one tile further down the zoom pyramid) => higher rez WMTS
            // currently we do not set it, as the loading of the higher rez slows down the 3D user experience
            //globe.maximumScreenSpaceError = 0.5

    const sscController = scene.screenSpaceCameraController
    sscController.minimumZoomDistance = CAMERA_MIN_ZOOM_DISTANCE
    sscController.maximumZoomDistance = CAMERA_MAX_ZOOM_DISTANCE

    // letting children component know that they can now load
    viewerCreated.value = true

    // if the default projection is a national projection (or custom projection), we then constrain
    // the camera to only move in bounds of this custom projection
    if (DEFAULT_PROJECTION instanceof CustomCoordinateSystem) {
        viewer.scene.postRender.addEventListener(
            limitCameraCenter(DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten)
        )
    }
    viewer.scene.postRender.addEventListener(
        limitCameraPitchRoll(CAMERA_MIN_PITCH, CAMERA_MAX_PITCH, 0.0, 0.0)
    )

    flyToPosition()

    if (selectedFeatures.value.length > 0) {
        highlightSelectedFeatures()
    }

    if (IS_TESTING_WITH_CYPRESS) {
        // exposing the Cesium Viewer so that Cypress can use it for test purposes
        window.cesiumViewer = viewer
        // reduce screen space error to downgrade visual quality but speed up tests
        globe.maximumScreenSpaceError = 30
    }
    store.dispatch('mapModuleReady', dispatcher)
}

function flyToPosition() {
    try {
        if (cameraPosition.value) {
            viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(
                    cameraPosition.value.x,
                    cameraPosition.value.y,
                    cameraPosition.value.z
                ),
                orientation: {
                    heading: CesiumMath.toRadians(cameraPosition.value.heading),
                    pitch: CesiumMath.toRadians(cameraPosition.value.pitch),
                    roll: CesiumMath.toRadians(cameraPosition.value.roll),
                },
                duration: 1,
            })
        } else {
            viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(
                    centerEpsg4326.value[0],
                    centerEpsg4326.value[1],
                    calculateHeight(resolution.value, viewer.canvas.clientWidth)
                ),
                orientation: {
                    heading: -CesiumMath.toRadians(rotation.value),
                    pitch: -CesiumMath.PI_OVER_TWO,
                    roll: 0,
                },
                duration: 0,
            })
        }
    } catch (error) {
        log.error('Error while moving the camera', error, cameraPosition.value)
    }
}

function highlightSelectedFeatures() {
    const [firstFeature] = selectedFeatures.value
    const geometries = selectedFeatures.value.map((f) => {
        // GeoJSON and KML layers have different geometry structure
        if (!f.geometry.type) {
            let type
            if (f.geometry instanceof Polygon) {
                type = 'Polygon'
            } else if (f.geometry instanceof LineString) {
                type = 'LineString'
            } else if (f.geometry instanceof Point) {
                type = 'Point'
            }
            const coordinates = f.geometry.getCoordinates()
            return {
                type,
                coordinates,
            }
        }
        return f.geometry
    })
    highlightGroup(viewer, geometries)
    popoverCoordinates.value = Array.isArray(firstFeature.coordinates[0])
        ? firstFeature.coordinates[firstFeature.coordinates.length - 1]
        : firstFeature.coordinates
}

function onClick(event) {
    unhighlightGroup(viewer)
    const features = []
    let coordinates = getCoordinateAtScreenCoordinate(
        viewer,
        event.position.x,
        event.position.y,
        projection.value
    )

    let objects = viewer.scene.drillPick(event.position)
    const kmlFeatures = {}
    // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
    visiblePrimitiveLayers.value
        .filter((l) => l instanceof GeoAdminGeoJsonLayer)
        .forEach((geoJSonLayer) => {
            features.push(
                ...identifyGeoJSONFeatureAt(
                    geoJSonLayer,
                    event.position,
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
        clickInfo: {
            coordinate: coordinates,
            screenPixel: [event.position.x, event.position.y],
            features,
            clickType: ClickType.LEFT_SINGLECLICK,
        },
        ...dispatcher,
    })
}

function clearLongPressTimer() {
    clearTimeout(contextMenuTimeoutId)
}

function onTouchStart(event) {
    clearLongPressTimer()
    if (event.touches.length === 1) {
        contextMenuTimeoutId = setTimeout(() => {
            const touch = event.touches[0]
            onContextMenu(touch)
        }, 500)
    }
}

function onContextMenu(event) {
    const coordinates = getCoordinateAtScreenCoordinate(
        viewer,
        event.clientX,
        event.clientY,
        projection.value
    )
    store.dispatch('click', {
        clickInfo: {
            coordinate: coordinates,
            screenPixel: [event.clientX, event.clientY],
            clickType: ClickType.CONTEXTMENU,
        },
        ...dispatcher,
    })
}

function setCenterToCameraTarget() {
    const ray = viewer.camera.getPickRay(
        new Cartesian2(
            Math.round(viewer.scene.canvas.clientWidth / 2),
            Math.round(viewer.scene.canvas.clientHeight / 2)
        )
    )
    const cameraTarget = viewer.scene.globe.pick(ray, viewer.scene)
    if (defined(cameraTarget)) {
        const cameraTargetCartographic = Ellipsoid.WGS84.cartesianToCartographic(cameraTarget)
        const lat = CesiumMath.toDegrees(cameraTargetCartographic.latitude)
        const lon = CesiumMath.toDegrees(cameraTargetCartographic.longitude)
        store.dispatch('setCenter', {
            center: proj4(WGS84.epsg, projection.value.epsg, [lon, lat]),
            ...dispatcher,
        })
    }
}

function onCameraMoveEnd() {
    const camera = viewer.camera
    const position = camera.positionCartographic
    store.dispatch('setCameraPosition', {
        position: {
            x: parseFloat(CesiumMath.toDegrees(position.longitude).toFixed(6)),
            y: parseFloat(CesiumMath.toDegrees(position.latitude).toFixed(6)),
            z: parseFloat(position.height.toFixed(1)),
            heading: parseFloat(CesiumMath.toDegrees(camera.heading).toFixed(0)),
            pitch: parseFloat(CesiumMath.toDegrees(camera.pitch).toFixed(0)),
            roll: parseFloat(CesiumMath.toDegrees(camera.roll).toFixed(0)),
        },
        ...dispatcher,
    })
}

function moveTooltipAtBottom() {
    store.dispatch('setFeatureInfoPosition', {
        position: FeatureInfoPositions.BOTTOMPANEL,
        ...dispatcher,
    })
}

function onPopupClose() {
    unhighlightGroup(viewer)
    store.dispatch('clearAllSelectedFeatures', dispatcher)
    store.dispatch('clearClick', dispatcher)
}
</script>

<template>
    <div
        v-if="isProjectionWebMercator"
        id="cesium"
        ref="cesiumContainer"
        class="cesium-widget"
        data-cy="cesium-map"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="clearLongPressTimer"
        @touchend.passive="clearLongPressTimer"
        @touchcancel="clearLongPressTimer"
        @contextmenu="onContextMenu"
    >
        <div v-if="viewerCreated">
            <!--
               Adding background layer, z-index can be set to zero for all, as only the WMTS
               background layer is an imagery layer (and requires one), all other BG layer are
               primitive layer and will ignore this prop
            -->
            <CesiumInternalLayer
                v-for="bgLayer in backgroundLayersFor3D"
                :key="bgLayer.id"
                :layer-config="bgLayer"
                :projection="projection"
                :z-index="0"
            />
            <!--
               Adding all other layers
               Layers split between imagery and primitive type for correct zIndex ordering.
               Only imagery layers require a z-index, we start to count them at 1 because of the
               background WMTS layer
            -->
            <CesiumInternalLayer
                v-for="(layer, index) in visibleImageryLayers"
                :key="layer.id"
                :layer-config="layer"
                :preview-year="previewYear"
                :projection="projection"
                :z-index="index + startingZIndexForImageryLayers"
            />
            <CesiumInternalLayer
                v-for="layer in visiblePrimitiveLayers"
                :key="layer.id"
                :layer-config="layer"
                :preview-year="previewYear"
                :projection="projection"
            />
        </div>
        <CesiumPopover
            v-if="viewerCreated && showFeaturesPopover"
            :coordinates="popoverCoordinates"
            :projection="projection"
            authorize-print
            :use-content-padding="!!editFeature"
            @close="onPopupClose"
        >
            <template #extra-buttons>
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="toggle-floating-off"
                    @click="moveTooltipAtBottom"
                >
                    <FontAwesomeIcon icon="caret-down" />
                </button>
            </template>
            <FeatureEdit v-if="editFeature" :read-only="true" :feature="editFeature" />
            <FeatureList />
        </CesiumPopover>
        <CesiumToolbox
            v-if="viewerCreated && isDesktopMode && !isFullScreenMode"
            class="cesium-toolbox position-absolute start-50 translate-middle-x"
        />
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/modules/map/scss/toolbox-buttons';

// rule can't be scoped otherwise styles will be not applied
:global(.cesium-viewer .cesium-widget-credits) {
    display: none !important;
}

.cesium-toolbox {
    bottom: $footer-height + $screen-padding-for-ui-elements;
    z-index: $zindex-map + 1;
}
</style>
