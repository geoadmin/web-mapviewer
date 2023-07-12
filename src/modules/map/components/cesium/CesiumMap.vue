<template>
    <div id="cesium" ref="viewer" data-cy="cesium">
        <div v-if="viewerCreated">
            <!-- Adding background layer -->
            <CesiumInternalLayer
                v-if="currentBackgroundLayer"
                :layer-config="currentBackgroundLayer"
                :z-index="0"
            />
            <!-- Adding all other layers -->
            <CesiumInternalLayer
                v-for="(layer, index) in visibleLayers"
                :key="layer.getID()"
                :layer-config="layer"
                :preview-year="previewYear"
                :z-index="index + startingZIndexForVisibleLayers"
            />
        </div>
    </div>
    <cesium-compass v-show="isDesktopMode" ref="compass"></cesium-compass>
    <slot />
</template>
<script>
import {
    Viewer,
    CesiumTerrainProvider,
    Color,
    Cartesian3,
    RequestScheduler,
    Math as CesiumMath,
} from 'cesium'
import { UIModes } from '@/store/modules/ui.store'
import { mapGetters, mapState, mapActions } from 'vuex'
import { TERRAIN_URL } from './constants'
import { IS_TESTING_WITH_CYPRESS, WMTS_BASE_URL } from '@/config'
import CesiumInternalLayer from './CesiumInternalLayer.vue'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { CURRENT_YEAR_WMTS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'
import '@geoblocks/cesium-compass'

export default {
    components: { CesiumInternalLayer },
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
        }
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom,
            camera: (state) => state.position.camera,
            uiMode: (state) => state.ui.mode,
            previewYear: (state) => state.layers.previewYear,
        }),
        ...mapGetters(['centerEpsg4326', 'hasDevSiteWarning', 'visibleLayers']),
        isDesktopMode() {
            return this.uiMode === UIModes.DESKTOP
        },
        startingZIndexForVisibleLayers() {
            return this.currentBackgroundLayer ? 1 : 0
        },
    },
    beforeCreate() {
        // Global variable required for Cesium and point to the URL where four static directories (see vite.config) are served
        // https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/#install-with-npm
        window['CESIUM_BASE_URL'] = '.'

        // A per server key list of overrides to use for throttling limits.
        // Useful when streaming data from a known HTTP/2 or HTTP/3 server.
        Object.assign(RequestScheduler.requestsByServer, {
            'wmts.geo.admin.ch:443': 18,
            'sys-3d.dev.bgdi.ch:443': 18,
            'sys-3d.int.bgdi.ch:443': 18,
            '3d.geo.admin.ch:443': 18,
        })
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

        if (IS_TESTING_WITH_CYPRESS) {
            window.cesiumViewer = this.viewer
        }

        const scene = this.viewer.scene
        scene.screenSpaceCameraController.enableCollisionDetection = false
        scene.useDepthPicking = true
        scene.pickTranslucentDepth = true
        scene.backgroundColor = Color.TRANSPARENT

        this.viewer.camera.moveEnd.addEventListener(this.onCameraMoveEnd)

        const globe = scene.globe
        globe.baseColor = Color.TRANSPARENT
        globe.depthTestAgainstTerrain = true
        globe.showGroundAtmosphere = false
        globe.showWaterEffect = false
        globe.backFaceCulling = false
        globe.undergroundColor = Color.BLACK
        globe.undergroundColorAlphaByDistance.nearValue = 0.5
        globe.undergroundColorAlphaByDistance.farValue = 0.0

        this.viewerCreated = true

        this.flyToPosition()
    },
    unmounted() {
        this.setCameraPosition(null)
        this.viewer.destroy()
        delete this.viewer
    },
    methods: {
        ...mapActions(['setCameraPosition']),
        flyToPosition() {
            const x = this.camera ? this.camera.x : this.centerEpsg4326[0]
            const y = this.camera ? this.camera.y : this.centerEpsg4326[1]
            const z = this.camera ? this.camera.z : 20000  // FIXME: convert this.zoom to z
            const heading = CesiumMath.toRadians(this.camera ? this.camera.heading : 0)
            const pitch = CesiumMath.toRadians(this.camera ? this.camera.pitch :-90)
            const roll = CesiumMath.toRadians(this.camera ? this.camera.roll : 0)
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
    },
}
</script>

<!-- Style can't be scoped because canvas styles will be not applied -->
<style lang="scss">
@import 'src/scss/webmapviewer-bootstrap-theme';

#cesium {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: $zindex-map;

    .cesium-widget canvas {
        position: absolute;
        width: 100%;
        height: 100%;
    }

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
