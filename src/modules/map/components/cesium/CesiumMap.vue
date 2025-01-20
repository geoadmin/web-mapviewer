<script setup>
import '@geoblocks/cesium-compass'

import {
    CesiumTerrainProvider,
    Color,
    PostProcessStageCollection,
    ShadowMode,
    Viewer,
} from 'cesium'
import { computed, onBeforeMount, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { TERRAIN_URL } from '@/config/cesium.config'
import { CESIUM_STATIC_PATH } from '@/config/map.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import CesiumBackgroundLayer from '@/modules/map/components/cesium/CesiumBackgroundLayer.vue'
import CesiumCamera from '@/modules/map/components/cesium/CesiumCamera.vue'
import CesiumGeolocationFeedback from '@/modules/map/components/cesium/CesiumGeolocationFeedback.vue'
import CesiumHighlightedFeatures from '@/modules/map/components/cesium/CesiumHighlightedFeatures.vue'
import CesiumInteractions from '@/modules/map/components/cesium/CesiumInteractions.vue'
import CesiumVisibleLayers from '@/modules/map/components/cesium/CesiumVisibleLayers.vue'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'CesiumMap.vue' }

let viewer = null

const viewerElement = ref(null)
const compassElement = ref(null)
const viewerCreated = ref(false)

const store = useStore()
const projection = computed(() => store.state.position.projection)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const isDesktopMode = computed(() => store.getters.isDesktopMode)
const isProjectionWebMercator = computed(() => projection.value.epsg === WEBMERCATOR.epsg)

watch(
    isProjectionWebMercator,
    () => {
        if (!viewer && isProjectionWebMercator.value) {
            createViewer()
        } else {
            log.error('[Cesium] Cesium only supports WebMercator as projection')
        }
    },
    {
        // so that we trigger the handler AFTER the component has updated
        // (meaning after the main <div> has been added and can be linked to Cesium)
        // see https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing
        flush: 'post',
    }
)

onBeforeMount(() => {
    // Global variable required for Cesium and point to the URL where four static directories (see vite.config) are served
    // https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/#install-with-npm
    window['CESIUM_BASE_URL'] = CESIUM_STATIC_PATH
})
onMounted(() => {
    if (isProjectionWebMercator.value) {
        log.debug('[Cesium] Projection is now WebMercator, Cesium will start loading')
        createViewer()
    } else {
        log.warn('[Cesium] Projection is not set to WebMercator, Cesium will not load yet')
    }
})
onUnmounted(() => {
    if (viewer) {
        store.dispatch('setCameraPosition', { position: null, ...dispatcher })
        viewer.destroy()
    }
})

async function createViewer() {
    viewer = new Viewer(viewerElement.value, {
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
        shadows: false,
        // no casting of buildings shadow on the terrain
        terrainShadows: ShadowMode.DISABLED,
        baseLayer: false,
        useBrowserRecommendedResolution: true,
        terrainProvider: await CesiumTerrainProvider.fromUrl(TERRAIN_URL),
        requestRenderMode: true,
    })

    if (hasDevSiteWarning.value) {
        viewer.scene.debugShowFramesPerSecond = true
    }

    const scene = viewer.scene
    scene.useDepthPicking = true
    scene.pickTranslucentDepth = true
    scene.backgroundColor = Color.TRANSPARENT

    const postProcessStages = new PostProcessStageCollection()
    postProcessStages.ambientOcclusion.enabled = true
    postProcessStages.bloom.enabled = false
    postProcessStages.fxaa.enabled = true
    scene.postProcessStages = postProcessStages

    const globe = scene.globe
    globe.baseColor = Color.WHITE
    globe.depthTestAgainstTerrain = true
    globe.showGroundAtmosphere = false
    globe.showWaterEffect = false

    viewerCreated.value = true

    if (IS_TESTING_WITH_CYPRESS) {
        window.cesiumViewer = viewer
        // reduce screen space error to downgrade visual quality but speed up tests
        globe.maximumScreenSpaceError = 30
    }
    await store.dispatch('mapModuleReady', dispatcher)
    await store.dispatch('setViewerReady', {
        isViewerReady: true,
        ...dispatcher,
    })

    if (compassElement.value) {
        compassElement.value.scene = viewer.scene
        compassElement.value.clock = viewer.clock
    }
    log.info('[Cesium] CesiumMap component mounted and ready')
}

provide('getViewer', () => viewer)
</script>

<template>
    <div ref="viewerElement" class="cesium-map" data-cy="cesium-map" @contextmenu.prevent>
        <template v-if="viewerCreated">
            <CesiumInteractions />
            <CesiumCamera />
            <CesiumBackgroundLayer />
            <CesiumVisibleLayers />
            <CesiumHighlightedFeatures />
            <CesiumGeolocationFeedback />
            <cesium-compass
                v-show="isDesktopMode"
                ref="compassElement"
                class="position-absolute start-50 translate-middle-x cesium-compass"
            />
        </template>
    </div>
    <slot />
</template>

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
