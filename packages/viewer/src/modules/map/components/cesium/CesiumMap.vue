<script setup lang="ts">
import '@geoblocks/cesium-compass'
import { WEBMERCATOR } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import {
    CesiumTerrainProvider,
    Color,
    PostProcessStageCollection,
    ShadowMode,
    Viewer,
} from 'cesium'
import {
    computed,
    onBeforeMount,
    onMounted,
    onUnmounted,
    provide,
    ref,
    useTemplateRef,
    watch,
} from 'vue'
import useAppStore from '@/store/modules/app.store'
import useCesiumStore from '@/store/modules/cesium.store'
import usePositionStore from '@/store/modules/position.store'
import useUIStore from '@/store/modules/ui.store'

import { TERRAIN_URL } from '@/config/cesium.config'
import { CESIUM_STATIC_PATH } from '@/config/map.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import CesiumBackgroundLayer from '@/modules/map/components/cesium/CesiumBackgroundLayer.vue'
import CesiumCamera from '@/modules/map/components/cesium/CesiumCamera.vue'
import CesiumGeolocationFeedback from '@/modules/map/components/cesium/CesiumGeolocationFeedback.vue'
import CesiumHighlightedFeatures from '@/modules/map/components/cesium/CesiumHighlightedFeatures.vue'
import CesiumInteractions from '@/modules/map/components/cesium/CesiumInteractions.vue'
import CesiumVisibleLayers from '@/modules/map/components/cesium/CesiumVisibleLayers.vue'

import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'CesiumMap.vue' }

let viewer: Viewer | undefined

const viewerElement = useTemplateRef<HTMLDivElement>('viewerElement')
// CesiumCompass is not typed yet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compassElement = useTemplateRef<any>('compassElement')
const viewerCreated = ref(false)

const appStore = useAppStore()
const cesiumStore = useCesiumStore()
const positionStore = usePositionStore()
const uiStore = useUIStore()

const isProjectionWebMercator = computed(() => positionStore.projection.epsg === WEBMERCATOR.epsg)

watch(
    isProjectionWebMercator,
    () => {
        if (!viewer && isProjectionWebMercator.value) {
            createViewer().catch((e) => {
                log.error({
                    title: 'CesiumMap.vue',
                    titleColor: LogPreDefinedColor.Red,
                    message: ['Error while creating the viewer:', e.message],
                })
            })
        } else {
            log.error({
                title: 'CesiumMap.vue',
                titleColor: LogPreDefinedColor.Red,
                message: ['Cesium only supports WebMercator as projection'],
            })
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
    window.CESIUM_BASE_URL = CESIUM_STATIC_PATH
})
onMounted(() => {
    if (isProjectionWebMercator.value) {
        log.debug({
            title: 'CesiumMap.vue',
            titleColor: LogPreDefinedColor.Blue,
            message: ['Cesium', 'Projection is now WebMercator, Cesium will start loading'],
        })
        createViewer().catch((e) => {
            log.error({
                title: 'CesiumMap.vue',
                titleColor: LogPreDefinedColor.Red,
                message: ['Cesium', 'Error while creating the viewer', e.message],
            })
        })
    } else {
        log.warn({
            title: 'CesiumMap.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['Cesium', 'Projection is not set to WebMercator, Cesium will not load yet'],
        })
    }
})
onUnmounted(() => {
    if (viewer) {
        positionStore.setCameraPosition(undefined, dispatcher)
        cesiumStore.setViewerReady(false, dispatcher)
        viewer.destroy()
    }
})

async function createViewer(): Promise<void> {
    if (!viewerElement.value) {
        return
    }
    viewer = new Viewer(viewerElement.value, {
        showRenderLoopErrors: uiStore.hasDevSiteWarning,
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

    if (uiStore.hasDevSiteWarning) {
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
        // expose for e2e tests

        window.cesiumViewer = viewer
        // reduce screen space error to downgrade visual quality but speed up tests
        globe.maximumScreenSpaceError = 30
    }
    appStore.setMapModuleReady(dispatcher)
    cesiumStore.setViewerReady(true, dispatcher)

    if (compassElement.value) {
        compassElement.value.scene = viewer.scene
        compassElement.value.clock = viewer.clock
    }
    log.info('[Cesium] CesiumMap component mounted and ready')
}

provide<Viewer | undefined>('viewer', viewer)
</script>

<template>
    <div
        ref="viewerElement"
        class="cesium-map"
        data-cy="cesium-map"
        @contextmenu.prevent
    >
        <template v-if="viewerCreated">
            <CesiumInteractions />
            <CesiumCamera />
            <CesiumBackgroundLayer />
            <CesiumVisibleLayers />
            <CesiumHighlightedFeatures />
            <CesiumGeolocationFeedback />
            <cesium-compass
                v-show="uiStore.isDesktopMode"
                ref="compassElement"
                class="position-absolute translate-middle-x cesium-compass start-50"
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
