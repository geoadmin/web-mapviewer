<template>
    <div
        v-if="isProjectionWebMercator"
        id="cesium"
        ref="viewer"
        class="cesium-map"
        data-cy="cesium-map"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="clearLongPressTimer"
        @touchend.passive="clearLongPressTimer"
        @touchcancel="clearLongPressTimer"
        @contextmenu="onContextMenu"
    >
        <CesiumBackgroundLayer v-if="viewerCreated" />
        <CesiumVisibleLayers v-if="viewerCreated" />
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
                    @click="setBottomPanelFeatureInfoPosition()"
                    @mousedown.stop=""
                >
                    <FontAwesomeIcon icon="angles-down" />
                </button>
            </template>
            <FeatureEdit v-if="editFeature" :read-only="true" :feature="editFeature" />
            <FeatureList />
        </CesiumPopover>
        <CesiumGeolocationFeedback v-if="viewerCreated" />

        <cesium-compass
            v-show="isDesktopMode"
            ref="compass"
            class="position-absolute start-50 translate-middle-x cesium-compass"
        />
        <slot />
    </div>
</template>
<script>
import '@geoblocks/cesium-compass'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import * as cesium from 'cesium'
import {
    Cartesian2,
    Cartesian3,
    Cartographic,
    CesiumTerrainProvider,
    Color,
    defined,
    Ellipsoid,
    Math as CesiumMath,
    PostProcessStageCollection,
    RequestScheduler,
    ScreenSpaceEventType,
    ShadowMode,
    Viewer,
} from 'cesium'
import { isEqual } from 'lodash'
import { LineString, Point, Polygon } from 'ol/geom'
import proj4 from 'proj4'
import { mapActions, mapGetters, mapState } from 'vuex'

import { extractOlFeatureGeodesicCoordinates } from '@/api/features/features.api'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { get3dTilesBaseUrl, getWmsBaseUrl, getWmtsBaseUrl } from '@/config/baseUrl.config'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import FeatureEdit from '@/modules/infobox/components/FeatureEdit.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import CesiumBackgroundLayer from '@/modules/map/components/cesium/CesiumBackgroundLayer.vue'
import CesiumGeolocationFeedback from '@/modules/map/components/cesium/CesiumGeolocationFeedback.vue'
import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import CesiumVisibleLayers from '@/modules/map/components/cesium/CesiumVisibleLayers.vue'
import {
    CAMERA_MAX_PITCH,
    CAMERA_MAX_ZOOM_DISTANCE,
    CAMERA_MIN_PITCH,
    CAMERA_MIN_ZOOM_DISTANCE,
    TERRAIN_URL,
} from '@/modules/map/components/cesium/constants'
import {
    calculateHeight,
    limitCameraCenter,
    limitCameraPitchRoll,
} from '@/modules/map/components/cesium/utils/cameraUtils'
import {
    highlightGroup,
    unhighlightGroup,
} from '@/modules/map/components/cesium/utils/highlightUtils'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import { FeatureInfoPositions, UIModes } from '@/store/modules/ui.store'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { identifyGeoJSONFeatureAt } from '@/utils/identifyOnVectorLayer'
import log from '@/utils/logging'
import { wrapDegrees } from '@/utils/numberUtils.js'

const dispatcher = { dispatcher: 'CesiumMap.vue' }
export default {
    components: {
        CesiumVisibleLayers,
        CesiumBackgroundLayer,
        CesiumGeolocationFeedback,
        FontAwesomeIcon,
        CesiumPopover,
        FeatureEdit,
        FeatureList,
    },
    provide() {
        return {
            // sharing cesium viewer object with children components
            getViewer: () => this.viewer,
        }
    },
    data() {
        return {
            viewerCreated: false,
            cameraInitialized: false,
            popoverCoordinates: [],
        }
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom,
            rotation: (state) => state.position.rotation,
            cameraPosition: (state) => state.position.camera,
            uiMode: (state) => state.ui.mode,
            projection: (state) => state.position.projection,
            isTimeSliderActive: (state) => state.ui.isTimeSliderActive,
            layersConfig: (state) => state.layers.config,
        }),
        ...mapGetters([
            'selectedFeatures',
            'centerEpsg4326',
            'resolution',
            'hasDevSiteWarning',
            'visibleLayers',
            'showFeatureInfoInTooltip',
        ]),
        isProjectionWebMercator() {
            return this.projection.epsg === WEBMERCATOR.epsg
        },
        isDesktopMode() {
            return this.uiMode === UIModes.DESKTOP
        },
        isFeatureInfoInTooltip() {
            return this.showFeatureInfoInTooltip
        },
        visiblePrimitiveLayers() {
            return this.visibleLayers.filter(
                (l) =>
                    l instanceof GeoAdminGeoJsonLayer ||
                    l instanceof KMLLayer ||
                    l instanceof GPXLayer
            )
        },
        showFeaturesPopover() {
            return this.isFeatureInfoInTooltip && this.selectedFeatures.length > 0
        },
        editFeature() {
            return this.selectedFeatures.find((feature) => feature.isEditable)
        },
    },
    watch: {
        selectedFeatures: {
            // we need to deep watch this as otherwise we aren't triggered when
            // coordinates are changed (but only when one feature is added/removed)
            handler(newSelectedFeatures) {
                if (newSelectedFeatures.length > 0) {
                    this.highlightSelectedFeatures()
                }
            },
            deep: true,
        },
        isProjectionWebMercator: {
            handler() {
                if (!this.viewer && this.isProjectionWebMercator) {
                    this.createViewer()
                } else {
                    log.error('Cesium only supports WebMercator as projection')
                }
            },
            // so that we trigger the handler AFTER the component has updated
            // (meaning after the main <div> has been added and can be linked to Cesium)
            // see https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing
            flush: 'post',
        },
        cameraPosition: {
            handler() {
                this.flyToPosition()
            },
            flush: 'post',
            deep: true,
        },
    },
    beforeCreate() {
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
        backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(get3dTilesBaseUrl())}:443`] = 18
        backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(getWmtsBaseUrl())}:443`] = 18
        backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(getWmsBaseUrl())}:443`] = 18
        // A per server key list of overrides to use for throttling limits.
        // Useful when streaming data from a known HTTP/2 or HTTP/3 server.
        Object.assign(RequestScheduler.requestsByServer, backendUsedToServe3dData)
    },
    mounted() {
        if (this.isProjectionWebMercator) {
            this.createViewer()
        } else {
            log.warn('Projection is not yet set to WebMercator, Cesium will not load yet')
        }
        log.info('CesiumMap component mounted and ready')
    },
    beforeUnmount() {
        if (this.viewer) {
            // the camera position that is for now dispatched to the store doesn't correspond where the 2D
            // view is looking at, as if the camera is tilted, its position will be over swaths of lands that
            // have nothing to do with the top-down 2D view.
            // here we ray trace the coordinate of where the camera is looking at, and send this "target"
            // to the store as the new center
            this.setCenterToCameraTarget()
        }
    },
    unmounted() {
        this.setCameraPosition({ position: null, ...dispatcher })
        this.viewer.destroy()
        delete this.viewer
    },
    methods: {
        ...mapActions([
            'setCameraPosition',
            'clearAllSelectedFeatures',
            'click',
            'clearClick',
            'setFeatureInfoPosition',
            'setCenter',
            'mapModuleReady',
            'setViewerReady',
        ]),
        toggleTooltip() {
            this.toggleFloatingTooltip(dispatcher)
        },
        async createViewer() {
            this.viewer = new Viewer(this.$refs.viewer, {
                showRenderLoopErrors: this.hasDevSiteWarning,
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
                shadows: false,
                // no casting of buildings shadow on the terrain
                terrainShadows: ShadowMode.DISABLED,
                baseLayer: false,
                useBrowserRecommendedResolution: true,
                terrainProvider: await CesiumTerrainProvider.fromUrl(TERRAIN_URL),
                requestRenderMode: true,
            })

            if (this.hasDevSiteWarning) {
                this.viewer.scene.debugShowFramesPerSecond = true
            }

            const scene = this.viewer.scene
            scene.useDepthPicking = true
            scene.pickTranslucentDepth = true
            scene.backgroundColor = Color.TRANSPARENT

            const postProcessStages = new PostProcessStageCollection()
            postProcessStages.ambientOcclusion.enabled = true
            postProcessStages.bloom.enabled = false
            postProcessStages.fxaa.enabled = true
            scene.postProcessStages = postProcessStages

            this.viewer.camera.moveEnd.addEventListener(this.onCameraMoveEnd)
            this.viewer.screenSpaceEventHandler.setInputAction(
                this.onClick,
                ScreenSpaceEventType.LEFT_CLICK
            )

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

            this.viewerCreated = true

            // if the default projection is a national projection (or custom projection), we then constrain
            // the camera to only move in bounds of this custom projection
            if (DEFAULT_PROJECTION instanceof CustomCoordinateSystem) {
                this.viewer.scene.postRender.addEventListener(
                    limitCameraCenter(DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten)
                )
            }
            this.viewer.scene.postRender.addEventListener(
                limitCameraPitchRoll(CAMERA_MIN_PITCH, CAMERA_MAX_PITCH, 0.0, 0.0)
            )
            this.initCamera()

            if (this.$refs.compass) {
                this.$refs.compass.scene = this.viewer.scene
                this.$refs.compass.clock = this.viewer.clock
            }

            if (this.selectedFeatures.length > 0) {
                this.highlightSelectedFeatures()
            }

            if (IS_TESTING_WITH_CYPRESS) {
                window.cesiumViewer = this.viewer
                // reduce screen space error to downgrade visual quality but speed up tests
                globe.maximumScreenSpaceError = 30
            }
            this.mapModuleReady(dispatcher)
            this.setViewerReady({
                isViewerReady: true,
                ...dispatcher,
            })
        },
        highlightSelectedFeatures() {
            const [firstFeature] = this.selectedFeatures
            const geometries = this.selectedFeatures.map((f) => {
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
            highlightGroup(this.viewer, geometries)
            this.popoverCoordinates = Array.isArray(firstFeature.coordinates[0])
                ? firstFeature.coordinates[firstFeature.coordinates.length - 1]
                : firstFeature.coordinates
        },
        initCamera() {
            if (this.cameraInitialized) {
                return
            }
            let destination
            let orientation
            if (this.cameraPosition) {
                // a camera position was already define in the URL, we use it
                log.debug('Existing camera position found at startup, using', this.cameraPosition)
                destination = Cartesian3.fromDegrees(
                    this.cameraPosition.x,
                    this.cameraPosition.y,
                    this.cameraPosition.z
                )
                orientation = {
                    heading: CesiumMath.toRadians(this.cameraPosition.heading),
                    pitch: CesiumMath.toRadians(this.cameraPosition.pitch),
                    roll: CesiumMath.toRadians(this.cameraPosition.roll),
                }
            } else {
                // no camera position was ever calculated, so we create one using the 2D coordinates
                log.debug(
                    'No camera position defined, creating one using 2D coordinates',
                    this.centerEpsg4326
                )
                destination = Cartesian3.fromDegrees(
                    this.centerEpsg4326[0],
                    this.centerEpsg4326[1],
                    calculateHeight(this.resolution, this.viewer.canvas.clientWidth)
                )
                orientation = {
                    heading: -CesiumMath.toRadians(this.rotation),
                    pitch: -CesiumMath.PI_OVER_TWO,
                    roll: 0,
                }
            }

            this.viewer.camera.flyTo({
                destination,
                orientation,
                duration: 0,
            })
            this.cameraInitialized = true
        },
        flyToPosition() {
            try {
                if (this.cameraPosition) {
                    log.debug(
                        `Fly to camera position ${this.cameraPosition.x}, ${this.cameraPosition.y}, ${this.cameraPosition.z}`
                    )
                    this.viewer.camera.flyTo({
                        destination: Cartesian3.fromDegrees(
                            this.cameraPosition.x,
                            this.cameraPosition.y,
                            this.cameraPosition.z
                        ),
                        orientation: {
                            heading: CesiumMath.toRadians(this.cameraPosition.heading),
                            pitch: CesiumMath.toRadians(this.cameraPosition.pitch),
                            roll: CesiumMath.toRadians(this.cameraPosition.roll),
                        },
                        duration: 1,
                    })
                }
            } catch (error) {
                log.error('Error while moving the camera', error, this.cameraPosition)
            }
        },
        onCameraMoveEnd() {
            const camera = this.viewer.camera
            const position = camera.positionCartographic
            const cameraPosition = {
                x: parseFloat(CesiumMath.toDegrees(position.longitude).toFixed(6)),
                y: parseFloat(CesiumMath.toDegrees(position.latitude).toFixed(6)),
                z: parseFloat(position.height.toFixed(1)),
                // Wrap degrees, cesium might return 360, which is internally wrapped to 0 in
                // store.
                heading: wrapDegrees(parseFloat(CesiumMath.toDegrees(camera.heading).toFixed(0))),
                pitch: wrapDegrees(parseFloat(CesiumMath.toDegrees(camera.pitch).toFixed(0))),
                roll: wrapDegrees(parseFloat(CesiumMath.toDegrees(camera.roll).toFixed(0))),
            }
            if (!isEqual(cameraPosition, this.cameraPosition)) {
                this.setCameraPosition({
                    position: cameraPosition,
                    ...dispatcher,
                })
            }
        },
        getCoordinateAtScreenCoordinate(x, y) {
            const cartesian = this.viewer?.scene.pickPosition(new Cartesian2(x, y))
            let coordinates = []
            if (cartesian) {
                const cartCoords = Cartographic.fromCartesian(cartesian)
                coordinates = proj4(WGS84.epsg, this.projection.epsg, [
                    (cartCoords.longitude * 180) / Math.PI,
                    (cartCoords.latitude * 180) / Math.PI,
                ])
            } else {
                log.error('no coordinate found at this screen coordinates', [x, y])
            }
            return coordinates
        },
        onClick(event) {
            unhighlightGroup(this.viewer)
            const features = []
            let coordinates = this.getCoordinateAtScreenCoordinate(
                event.position.x,
                event.position.y
            )

            let objects = this.viewer.scene.drillPick(event.position)
            const kmlFeatures = {}
            // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
            this.visiblePrimitiveLayers
                .filter((l) => l instanceof GeoAdminGeoJsonLayer)
                .forEach((geoJSonLayer) => {
                    features.push(
                        ...identifyGeoJSONFeatureAt(
                            geoJSonLayer,
                            [event.position.x, event.position.y],
                            this.projection,
                            this.resolution
                        )
                    )
                })
            this.visiblePrimitiveLayers
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
                coordinates = proj4(this.projection.epsg, WEBMERCATOR.epsg, featureCoords)
            }
            this.click({
                clickInfo: new ClickInfo({
                    coordinate: coordinates,
                    pixelCoordinate: [event.position.x, event.position.y],
                    features,
                    clickType: ClickType.LEFT_SINGLECLICK,
                }),
                ...dispatcher,
            })
        },
        onContextMenu(event) {
            const coordinates = this.getCoordinateAtScreenCoordinate(event.clientX, event.clientY)
            this.click({
                clickInfo: new ClickInfo({
                    coordinate: coordinates,
                    pixelCoordinate: [event.clientX, event.clientY],
                    clickType: ClickType.CONTEXTMENU,
                }),
                ...dispatcher,
            })
        },
        onPopupClose() {
            unhighlightGroup(this.viewer)
            this.clearAllSelectedFeatures(dispatcher)
            this.clearClick(dispatcher)
        },
        onTouchStart(event) {
            this.clearLongPressTimer()
            if (event.touches.length === 1) {
                this.contextMenuTimeoutId = setTimeout(() => {
                    const touch = event.touches[0]
                    this.onContextMenu(touch)
                }, 500)
            }
        },
        clearLongPressTimer() {
            clearTimeout(this.contextMenuTimeoutId)
        },
        setCenterToCameraTarget() {
            const ray = this.viewer.camera.getPickRay(
                new Cartesian2(
                    Math.round(this.viewer.scene.canvas.clientWidth / 2),
                    Math.round(this.viewer.scene.canvas.clientHeight / 2)
                )
            )
            const cameraTarget = this.viewer.scene.globe.pick(ray, this.viewer.scene)
            if (defined(cameraTarget)) {
                const cameraTargetCartographic =
                    Ellipsoid.WGS84.cartesianToCartographic(cameraTarget)
                const lat = CesiumMath.toDegrees(cameraTargetCartographic.latitude)
                const lon = CesiumMath.toDegrees(cameraTargetCartographic.longitude)
                this.setCenter({
                    center: proj4(WGS84.epsg, this.projection.epsg, [lon, lat]),
                    ...dispatcher,
                })
            }
        },
        setBottomPanelFeatureInfoPosition() {
            this.setFeatureInfoPosition({
                position: FeatureInfoPositions.BOTTOMPANEL,
                ...dispatcher,
            })
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/scss/media-query.mixin';

.cesium-map {
    overflow: hidden;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

// rule can't be scoped otherwise styles will be not applied
:global(.cesium-viewer .cesium-widget-credits) {
    display: none !important;
}
:global(.cesium-performanceDisplay-defaultContainer) {
    position: absolute;
    right: $screen-padding-for-ui-elements;
    bottom: calc($footer-height + $screen-padding-for-ui-elements);
    top: unset;
    left: unset;
}

@include respond-above(phone) {
    :global(.cesium-performanceDisplay-defaultContainer) {
        // Background wheel is on the opposite side of the screen past the phone threshold,
        // so we move the debug box to the other side too (so that it is not covered/covering the
        // BG wheel button)
        left: $screen-padding-for-ui-elements;
        right: unset;
    }
}

.cesium-compass {
    bottom: calc($footer-height + $screen-padding-for-ui-elements);
    z-index: $zindex-map + 1;

    $compass-size: 95px;

    position: relative;
    width: $compass-size;
    height: $compass-size;
    --cesium-compass-stroke-color: rgba(0, 0, 0, 0.6);
    --cesium-compass-fill-color: rgb(224, 225, 226);
}
</style>
