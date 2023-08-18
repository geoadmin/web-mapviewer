<template>
    <div id="cesium" ref="viewer" data-cy="cesium-map">
        <div v-if="viewerCreated">
            <!-- Adding background layer -->
            <CesiumInternalLayer
                v-if="currentBackgroundLayer"
                :layer-config="currentBackgroundLayer"
                :z-index="0"
            />
            <!-- Adding all other layers -->
            <!-- Layers split for correct zIndex ordering -->
            <CesiumInternalLayer
                v-for="(layer, index) in visibleImageryLayers"
                :key="layer.getID()"
                :layer-config="layer"
                :preview-year="previewYear"
                :z-index="index + startingZIndexForVisibleLayers"
            />
            <CesiumInternalLayer
                v-for="(layer, index) in visiblePrimitiveLayers"
                :key="layer.getID()"
                :layer-config="layer"
                :preview-year="previewYear"
                :z-index="index"
            />
        </div>
        <MapPopover
            v-if="showFeaturesPopover"
            :coordinates="popoverCoordinates"
            authorize-print
            :use-content-padding="!!editFeature"
            @close="onPopupClose"
        >
            <template #extra-buttons>
                <button
                    class="btn btn-sm btn-light d-flex align-items-center"
                    data-cy="toggle-floating-off"
                    @click="onToggleFloatingTooltipClick"
                >
                    <FontAwesomeIcon icon="caret-down" />
                </button>
            </template>
            <FeatureEdit v-if="editFeature" :read-only="true" :feature="editFeature" />
            <FeatureList direction="column" />
        </MapPopover>
    </div>
    <cesium-compass v-show="isDesktopMode" ref="compass"></cesium-compass>
    <slot />
</template>
<script>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { CURRENT_YEAR_WMTS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'
import {
    BASE_URL_3D_TILES,
    IS_TESTING_WITH_CYPRESS,
    TILEGRID_EXTENT_EPSG_4326,
    WMS_BASE_URL,
    WMTS_BASE_URL,
} from '@/config'
import { UIModes } from '@/store/modules/ui.store'
import '@geoblocks/cesium-compass'
import * as cesium from 'cesium'
import {
    Cartesian3,
    Cartographic,
    CesiumTerrainProvider,
    Color,
    Math as CesiumMath,
    RequestScheduler,
    ScreenSpaceEventType,
    Viewer,
} from 'cesium'
import { mapActions, mapGetters, mapState } from 'vuex'
import CesiumInternalLayer from './CesiumInternalLayer.vue'
import {
    CAMERA_MAX_PITCH,
    CAMERA_MAX_ZOOM_DISTANCE,
    CAMERA_MIN_PITCH,
    CAMERA_MIN_ZOOM_DISTANCE,
    MINIMUM_DISTANCE_TO_SHOW_TOOLTIP,
    TERRAIN_URL,
} from './constants'
import { calculateHeight, limitCameraCenter, limitCameraPitchRoll } from './utils/cameraUtils'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import proj4 from 'proj4'
import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinateSystems'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import { highlightGroup, unhighlightGroup } from './utils/highlightUtils'
import { createGeoJSONFeature } from '@/utils/layerUtils'
import {
    isInBounds,
    LV95_BOUNDS,
    reprojectUnknownSrsCoordsToWebMercator,
} from '@/utils/coordinateUtils'
import { extractOlFeatureGeodesicCoordinates } from '@/modules/drawing/lib/drawingUtils'
import log from '@/utils/logging'
import { LineString, Point, Polygon } from 'ol/geom'
import FeatureEdit from '@/modules/infobox/components/FeatureEdit.vue'
import MapPopover from '@/modules/map/components/MapPopover.vue'

export default {
    components: { MapPopover, FeatureEdit, FeatureList, CesiumInternalLayer },
    provide() {
        return {
            // sharing cesium viewer object with children components
            getViewer: () => this.viewer,
        }
    },
    data() {
        return {
            viewerCreated: false,
            // todo just for testing, remove when 3d background switch will be implemented
            currentBackgroundLayer: new GeoAdminWMTSLayer(
                'ch.swisstopo.swisstlm3d-karte-farbe.3d',
                'ch.swisstopo.swisstlm3d-karte-farbe.3d',
                1,
                true,
                [],
                'jpeg',
                new LayerTimeConfig(CURRENT_YEAR_WMTS_TIMESTAMP, []),
                true,
                WMTS_BASE_URL,
                false,
                false,
                []
            ),
            popoverCoordinates: [],
        }
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom,
            rotation: (state) => state.position.rotation,
            camera: (state) => state.position.camera,
            uiMode: (state) => state.ui.mode,
            previewYear: (state) => state.layers.previewYear,
            isFeatureTooltipInFooter: (state) => !state.ui.floatingTooltip,
            selectedFeatures: (state) => state.features.selectedFeatures,
        }),
        ...mapGetters(['centerEpsg4326', 'resolution', 'hasDevSiteWarning', 'visibleLayers']),
        isDesktopMode() {
            return this.uiMode === UIModes.DESKTOP
        },
        startingZIndexForVisibleLayers() {
            return this.currentBackgroundLayer ? 1 : 0
        },
        visibleImageryLayers() {
            return this.visibleLayers.filter(
                (l) => l instanceof GeoAdminWMTSLayer || l instanceof GeoAdminWMSLayer
            )
        },
        visiblePrimitiveLayers() {
            return this.visibleLayers.filter(
                (l) => l instanceof GeoAdminGeoJsonLayer || (l.addToMap && l instanceof KMLLayer)
            )
        },
        showFeaturesPopover() {
            return !this.isFeatureTooltipInFooter && this.selectedFeatures.length > 0
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
                    const [firstFeature] = newSelectedFeatures
                    const geometries = newSelectedFeatures.map((f) => {
                        // GeoJSON and KML layers have different geometry structure
                        if (!f.geometry.type) {
                            let type = undefined
                            if (f.geometry instanceof Polygon) {
                                type = 'Polygon'
                            } else if (f.geometry instanceof LineString) {
                                type = 'LineString'
                            } else if (f.geometry instanceof Point) {
                                type = 'Point'
                            }
                            const coordinates = f.geometry.getCoordinates()
                            const getCoordinates = (c) =>
                                isInBounds(c[0], c[1], LV95_BOUNDS)
                                    ? proj4(LV95.epsg, WEBMERCATOR.epsg, c)
                                    : c
                            return {
                                type,
                                coordinates:
                                    typeof coordinates[0] === 'number'
                                        ? getCoordinates(coordinates)
                                        : coordinates.map(getCoordinates),
                            }
                        }
                        return f.geometry
                    })
                    highlightGroup(this.viewer, geometries)
                    const featureCoords = Array.isArray(firstFeature.coordinates[0])
                        ? firstFeature.coordinates[firstFeature.coordinates.length - 1]
                        : firstFeature.coordinates
                    this.popoverCoordinates = reprojectUnknownSrsCoordsToWebMercator(
                        featureCoords[0],
                        featureCoords[1]
                    )
                    this.viewer?.camera.changed.addEventListener(this.onCameraMove)
                } else {
                    this.viewer?.camera.changed.removeEventListener(this.onCameraMove)
                }
            },
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
        backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(BASE_URL_3D_TILES)}:443`] = 18
        backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(WMTS_BASE_URL)}:443`] = 18
        backendUsedToServe3dData[`${withoutSchemeAndTrailingSlash(WMS_BASE_URL)}:443`] = 18
        // A per server key list of overrides to use for throttling limits.
        // Useful when streaming data from a known HTTP/2 or HTTP/3 server.
        Object.assign(RequestScheduler.requestsByServer, backendUsedToServe3dData)
    },
    async mounted() {
        this.viewer = new Viewer(this.$refs.viewer, {
            contextOptions: {
                webgl: {
                    powerPreference: 'high-performance',
                },
            },
            showRenderLoopErrors: this.hasDevSiteWarning,
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
            scene3DOnly: true,
            skyBox: false,
            baseLayer: false,
            useBrowserRecommendedResolution: true,
            terrainProvider: await CesiumTerrainProvider.fromUrl(TERRAIN_URL),
            requestRenderMode: true,
        })

        const compass = this.$refs.compass
        compass.scene = this.viewer.scene
        compass.clock = this.viewer.clock

        const scene = this.viewer.scene
        scene.useDepthPicking = true
        scene.pickTranslucentDepth = true
        scene.backgroundColor = Color.TRANSPARENT

        this.viewer.camera.moveEnd.addEventListener(this.onCameraMoveEnd)
        this.viewer.screenSpaceEventHandler.setInputAction(
            this.onClick,
            ScreenSpaceEventType.LEFT_CLICK
        )

        const globe = scene.globe
        globe.baseColor = Color.TRANSPARENT
        globe.depthTestAgainstTerrain = true
        globe.showGroundAtmosphere = false
        globe.showWaterEffect = false

        const sscController = scene.screenSpaceCameraController
        sscController.minimumZoomDistance = CAMERA_MIN_ZOOM_DISTANCE
        sscController.maximumZoomDistance = CAMERA_MAX_ZOOM_DISTANCE

        this.viewerCreated = true

        this.viewer.scene.postRender.addEventListener(limitCameraCenter(TILEGRID_EXTENT_EPSG_4326))
        this.viewer.scene.postRender.addEventListener(
            limitCameraPitchRoll(CAMERA_MIN_PITCH, CAMERA_MAX_PITCH, 0.0, 0.0)
        )

        this.flyToPosition()
        this.tooltipToggledAutomaticaly = false

        if (IS_TESTING_WITH_CYPRESS) {
            window.cesiumViewer = this.viewer
            // reduce screen space error to downgrade visual quality but speed up tests
            globe.maximumScreenSpaceError = 30
        }
    },
    beforeUnmount() {
        this.clearAllSelectedFeatures()
    },
    unmounted() {
        this.setCameraPosition(null)
        this.viewer.destroy()
        delete this.viewer
    },
    methods: {
        ...mapActions([
            'setCameraPosition',
            'clearAllSelectedFeatures',
            'click',
            'toggleFloatingTooltip',
        ]),
        flyToPosition() {
            const x = this.camera ? this.camera.x : this.centerEpsg4326[0]
            const y = this.camera ? this.camera.y : this.centerEpsg4326[1]
            const z = this.camera
                ? this.camera.z
                : calculateHeight(this.resolution, this.viewer.canvas.clientWidth)
            const heading = this.camera ? CesiumMath.toRadians(this.camera.heading) : -this.rotation
            const pitch = this.camera
                ? CesiumMath.toRadians(this.camera.pitch)
                : -CesiumMath.PI_OVER_TWO
            const roll = this.camera ? CesiumMath.toRadians(this.camera.roll) : 0
            this.viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(x, y, z),
                orientation: {
                    heading,
                    pitch,
                    roll,
                },
                duration: 0,
            })
        },
        onCameraMoveEnd() {
            const camera = this.viewer.camera
            const position = camera.positionCartographic
            this.setCameraPosition({
                x: CesiumMath.toDegrees(position.longitude).toFixed(6),
                y: CesiumMath.toDegrees(position.latitude).toFixed(6),
                z: position.height.toFixed(0),
                heading: CesiumMath.toDegrees(camera.heading).toFixed(0),
                pitch: CesiumMath.toDegrees(camera.pitch).toFixed(0),
                roll: CesiumMath.toDegrees(camera.roll).toFixed(0),
            })
        },
        onCameraMove() {
            const camera = this.viewer.camera
            const position = camera.positionCartographic
            if (
                position.height <= MINIMUM_DISTANCE_TO_SHOW_TOOLTIP &&
                this.showFeaturesPopover &&
                !this.isFeatureTooltipInFooter
            ) {
                this.toggleFloatingTooltip()
                this.tooltipToggledAutomaticaly = true
            }
        },
        onClick(event) {
            if (this.tooltipToggledAutomaticaly) {
                this.toggleFloatingTooltip()
                this.tooltipToggledAutomaticaly = false
            }
            unhighlightGroup(this.viewer)
            const features = []
            let coordinates = []
            const cartesian = this.viewer.scene.pickPosition(event.position)
            if (cartesian) {
                const cartCoords = Cartographic.fromCartesian(cartesian)
                coordinates = proj4(WGS84.epsg, WEBMERCATOR.epsg, [
                    (cartCoords.longitude * 180) / Math.PI,
                    (cartCoords.latitude * 180) / Math.PI,
                ])
            }

            let objects = this.viewer.scene.drillPick(event.position)
            const geoJsonFeatures = {}
            const kmlFeatures = {}
            // if there is a GeoJSON layer currently visible, we will find it and search for features under the mouse cursor
            this.visiblePrimitiveLayers
                .filter((l) => l instanceof GeoAdminGeoJsonLayer)
                .forEach((geoJSonLayer) => {
                    objects
                        .filter((obj) => obj.primitive?.olLayer?.get('id') === geoJSonLayer.getID())
                        .forEach((obj) => {
                            const feature = obj.primitive.olFeature
                            if (!geoJsonFeatures[feature.getId()]) {
                                geoJsonFeatures[feature.getId()] = createGeoJSONFeature(
                                    obj.primitive.olFeature,
                                    geoJSonLayer,
                                    feature.getGeometry()
                                )
                            }
                        })
                    features.push(...Object.values(geoJsonFeatures))
                })
            this.visiblePrimitiveLayers
                .filter((l) => l instanceof KMLLayer)
                .forEach((KMLLayer) => {
                    objects
                        .filter((obj) => obj.primitive?.olLayer?.get('id') === KMLLayer.getID())
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
                coordinates = proj4(LV95.epsg, WEBMERCATOR.epsg, featureCoords)
            }
            this.click(
                new ClickInfo(
                    coordinates,
                    [event.position.x, event.position.y],
                    features,
                    ClickType.LEFT_SINGLECLICK
                )
            )
        },
        onPopupClose() {
            unhighlightGroup(this.viewer)
            this.clearAllSelectedFeatures()
        },
        onToggleFloatingTooltipClick() {
            if (this.tooltipToggledAutomaticaly) {
                this.tooltipToggledAutomaticaly = false
            }
            this.toggleFloatingTooltip()
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

// rule can't be scoped otherwise canvas styles will be not applied
:global(#cesium .cesium-viewer),
:global(#cesium .cesium-widget canvas) {
    position: absolute;
    width: 100%;
    height: 100%;
}

#cesium {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: $zindex-map;

    .cesium-viewer-bottom {
        position: absolute;
    }

    .cesium-widget-credits {
        display: none;
    }
}
cesium-compass {
    position: absolute;
    bottom: 130px;
    right: 50%;
    z-index: 3;
    --cesium-compass-stroke-color: rgba(0, 0, 0, 0.6);
    --cesium-compass-fill-color: rgb(224, 225, 226);
}
</style>
