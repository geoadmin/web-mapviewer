<template>
    <div id="cesium" ref="map" data-cy="cesium"></div>
    <slot />
</template>
<script>
import {
    Viewer,
    CesiumTerrainProvider,
    SingleTileImageryProvider,
    Rectangle,
    Color,
    Cartesian3,
    RequestScheduler,
} from 'cesium'
import { addSwisstopoWMTSLayer } from './utils/imageryLayerUtils'
import { mapGetters, mapState } from 'vuex'
import { TERRAIN_URL } from './constants'
import { IS_TESTING_WITH_CYPRESS } from '@/config'
export default {
    provide() {
        return {
            // sharing cesium viewer object with children components
            getViewer: () => this.viewer,
        }
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom,
            rotation: (state) => state.position.rotation,
            center: (state) => state.position.center,
            is3DActive: (state) => state.ui.showIn3d,
        }),
        ...mapGetters(['centerEpsg4326', 'resolution', 'hasDevSiteWarning']),
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
    mounted() {
        // The first layer of Cesium is special in that it is always stretched to cover the entire world
        // using a 1x1 transparent image to workaround it.
        // See https://github.com/AnalyticalGraphicsInc/cesium/issues/1323 for details.
        const firstImageryProvider = new SingleTileImageryProvider({
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
            rectangle: Rectangle.fromDegrees(0, 0, 1, 1), // the Rectangle dimensions are arbitrary
        })

        this.viewer = new Viewer(this.$refs.map, {
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
            imageryProvider: firstImageryProvider,
            useBrowserRecommendedResolution: true,
            terrainProvider: new CesiumTerrainProvider({
                url: TERRAIN_URL,
            }),
            requestRenderMode: true,
        })

        if (IS_TESTING_WITH_CYPRESS) {
            window.cesiumViewer = this.viewer
        }

        const scene = this.viewer.scene
        scene.screenSpaceCameraController.enableCollisionDetection = false
        scene.useDepthPicking = true
        scene.pickTranslucentDepth = true
        scene.backgroundColor = Color.TRANSPARENT

        const globe = scene.globe
        globe.baseColor = Color.TRANSPARENT
        globe.depthTestAgainstTerrain = true
        globe.showGroundAtmosphere = false
        globe.showWaterEffect = false
        globe.backFaceCulling = false
        globe.undergroundColor = Color.BLACK
        globe.undergroundColorAlphaByDistance.nearValue = 0.5
        globe.undergroundColorAlphaByDistance.farValue = 0.0

        // todo move when the background layer switch is done
        const baseLayer = addSwisstopoWMTSLayer(
            this.viewer,
            'ch.swisstopo.swisstlm3d-karte-farbe.3d',
            'jpeg',
            20
        )
        baseLayer.show = true

        this.flyToPosition()
    },
    methods: {
        flyToPosition() {
            const cameraHeight =
                (this.resolution * this.viewer.canvas.clientWidth) /
                (2 * Math.tan(this.viewer.camera.frustum.fov / 2))
            this.viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(
                    this.centerEpsg4326[0],
                    this.centerEpsg4326[1],
                    cameraHeight
                ),
                duration: 0,
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
        width: 100%;
        height: 100%;
    }

    .cesium-viewer-bottom {
        position: absolute;
    }
}
</style>
