<script setup>
import log from '@geoadmin/log'
import { getPointResolution } from 'ol/proj'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { getGenerateQRCodeUrl } from '@/api/qrcode.api.js'
import { createShortLink } from '@/api/shortlink.api.js'
import { PRINT_DEFAULT_DPI, PRINT_DIMENSIONS } from '@/config/print.config'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import OpenLayersPrintResolutionEnforcer from '@/modules/map/components/openlayers/OpenLayersPrintResolutionEnforcer.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapModule from '@/modules/map/MapModule.vue'
import ConfederationFullLogo from '@/modules/menu/components/header/ConfederationFullLogo.vue'
import { stringifyQuery } from '@/utils/url-router'

const dispatcher = { dispatcher: 'PrintView.vue' }

const route = useRoute()
const store = useStore()
const { t } = useI18n()

const inchToMillimeter = 25.4

const shortLink = ref(null)
const qrCodeUrl = computed(() => getGenerateQRCodeUrl(shortLink.value))

const now = new Date()

const printLayout = computed(() => store.state.print.config.layout ?? 'A4_L')
const isLayerLandscape = computed(() => printLayout.value.endsWith('_L'))
const printDPI = computed(() => store.state.print.config.dpi ?? PRINT_DEFAULT_DPI)
const layoutIdentifier = computed(() => printLayout.value.replace('_L', '').replace('_P', ''))
const layoutDimensions = computed(() => {
    const dimensions = PRINT_DIMENSIONS[layoutIdentifier.value]
    if (!isLayerLandscape.value) {
        return dimensions.toReversed()
    }
    return dimensions
})
const mapResolution = computed(() => store.getters.resolution)
const mapRotation = computed(() => store.state.position.rotation)
const currentProjection = computed(() => store.state.position.projection)
const mapCenter = computed(() => store.state.position.center)
const currentLang = computed(() => store.state.i18n.lang)
const printContainerSize = computed(() => {
    if (!layoutDimensions.value) {
        return null
    }
    return {
        width: Math.round((layoutDimensions.value[0] * printDPI.value) / inchToMillimeter),
        height: Math.round((layoutDimensions.value[1] * printDPI.value) / inchToMillimeter),
    }
})
const printContainerStyle = computed(() => {
    if (!printContainerSize.value) {
        return null
    }
    return {
        width: `${printContainerSize.value.width}px`,
        height: `${printContainerSize.value.height}px`,
    }
})
const mapScaleWidth = computed(() => {
    if (!printContainerSize.value) {
        return null
    }
    // max 10% of screen width or 200px
    return Math.min(printContainerSize.value.width * 0.1, 200)
})
const northArrowStyle = computed(() => {
    if (mapRotation.value === 0) {
        return 0
    }
    return {
        transform: `rotate(${mapRotation.value}rad)`,
    }
})
const matchingResolutionStepWithLabel = computed(() =>
    currentProjection.value
        .getResolutionSteps()
        .filter((step) => step.label)
        .find((res, index, otherResolution) => {
            if (index === 0) {
                // skip
                return
            }
            // checking if map resolution is between the two steps
            const previousStep = otherResolution[index - 1]
            return (
                previousStep.resolution > mapResolution.value &&
                mapResolution.value > res.resolution
            )
        })
)

const printResolution = computed(
    () =>
        mapResolution.value /
        getPointResolution(
            currentProjection.value.epsg,
            printDPI.value / inchToMillimeter,
            mapCenter.value
        )
)

onMounted(() => {
    log.info(`Print map view mounted`)
    store.dispatch('setPrintMode', { mode: true, ...dispatcher })

    generateShareLink()
})

onBeforeUnmount(() => {
    store.dispatch('setPrintMode', { mode: false, ...dispatcher })
})

watch(() => route.query, generateShareLink)

async function generateShareLink() {
    try {
        shortLink.value = await createShortLink(
            `${location.origin}/#/map?${stringifyQuery(route.query)}`
        )
    } catch (error) {
        log.error(`Failed to create shortlink`, error)
        shortLink.value = null
    }
}
</script>

<template>
    <div
        class="view print-view d-flex flex-column"
        :style="printContainerStyle"
    >
        <MapModule class="flex-grow-1">
            <div class="north-arrow position-absolute top-0 end-0 m-4 m-xl-5 z-3">
                <img
                    src="@/modules/map/assets/north_arrow.png"
                    :style="northArrowStyle"
                    alt="North Arrow"
                />
            </div>
            <OpenLayersPrintResolutionEnforcer :resolution="printResolution" />
            <template #footer>
                <MapFooter>
                    <template #top-right>
                        <div
                            v-if="shortLink"
                            class="print-scale-line d-flex flex-column m-2 me-3 me-xl-3 bg-white p-3 border border-2 border-black"
                        >
                            <div class="scale d-flex justify-content-center m-1 mb-3">
                                <OpenLayersScale
                                    v-if="mapScaleWidth > 0"
                                    scale-type="bar"
                                    :min-width="mapScaleWidth"
                                    with-relative-size
                                />
                            </div>
                            <small
                                v-if="matchingResolutionStepWithLabel"
                                class="unit"
                            >
                                {{ t('print_scale') }} {{ matchingResolutionStepWithLabel.label }}
                            </small>
                            <small class="date">
                                {{ t('print_printed_on') }}
                                {{
                                    now.toLocaleString(`${currentLang}-CH`, {
                                        dateStyle: 'long',
                                        timeStyle: 'medium',
                                    })
                                }}
                            </small>
                            <a
                                :href="shortLink"
                                target="_blank"
                                class="text-decoration-none text-reset"
                            >
                                <small>{{ shortLink }}</small>
                            </a>
                        </div>
                        <img
                            v-if="shortLink"
                            :src="qrCodeUrl"
                            class="qr-code position-relative bottom-0 end-0 z-3 bg-white p-2 m-n1"
                            alt="QR Code"
                        />
                    </template>
                    <template #middle>
                        <InfoboxModule />
                    </template>
                </MapFooter>
            </template>
        </MapModule>
        <div class="print-footer d-flex pt-3 px-3 pb-1 gap-3">
            <ConfederationFullLogo :render-for-dpi="printDPI" />
            <div class="print-disclaimer flew-grow-1 px-1 px-md-3 px-xl-5 d-flex flex-column">
                <span class="text-justify">{{ t('print_footer_description') }}</span>
                <span class="text-justify">{{ t('print_footer_disclaimer') }}</span>
                <span class="mt-1">&copy; swisstopo</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$minFontSize: 8px;
$printFontSizeRelToWidth: 0.8vw;
$printFontSizeRelToHeight: 0.8vh;
$printFontSize: max(max($printFontSizeRelToWidth, $printFontSizeRelToHeight), $minFontSize);

.print-view {
    .print-disclaimer {
        .text-justify {
            text-align: justify;
        }
    }
    .print-disclaimer,
    .print-scale-line {
        font-size: $printFontSize;
    }
    .swiss-flag {
        width: auto;
        height: calc(3 * $printFontSize);
    }
    .north-arrow {
        $dropShadowSize: calc(0.5 * $printFontSize);
        filter: drop-shadow($dropShadowSize $dropShadowSize $dropShadowSize #222);
        img {
            max-width: calc(3 * $printFontSize);
        }
    }
    .qr-code {
        max-width: calc(12 * $printFontSize);
        border-top-left-radius: $printFontSize;
    }
}
</style>
