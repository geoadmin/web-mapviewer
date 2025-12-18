<script setup lang="ts">
import log from '@swissgeo/log'
import {
    PRINT_DEFAULT_DPI,
    PRINT_DIMENSIONS,
    PRINT_MARGIN_IN_MILLIMETERS,
} from '@swissgeo/staging-config/constants'
import { getPointResolution } from 'ol/proj'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import type { ActionDispatcher } from '@/store/types'

import { getGenerateQRCodeUrl } from '@/api/qrcode.api'
import { createShortLink } from '@/api/shortlink.api'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import OpenLayersPrintResolutionEnforcer from '@/modules/map/components/openlayers/OpenLayersPrintResolutionEnforcer.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapModule from '@/modules/map/MapModule.vue'
import ConfederationFullLogo from '@/modules/menu/components/header/ConfederationFullLogo.vue'
import useI18nStore from '@/store/modules/i18n'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import usePrintStore from '@/store/modules/print'
import { stringifyQuery } from '@/utils/url-router'

const dispatcher: ActionDispatcher = { name: 'PrintView.vue' }

const route = useRoute()
const { t } = useI18n()

const printStore = usePrintStore()
const positionStore = usePositionStore()
const i18nStore = useI18nStore()
const mapStore = useMapStore()

const inchToMillimeter = 25.4

const shortLink = ref<string | undefined>()
const qrCodeUrl = computed<string | undefined>(
    () => shortLink.value && getGenerateQRCodeUrl(shortLink.value)
)

const now = new Date()

const printLayout = computed<string>(() => printStore.config.layout ?? 'A4_L')

const isLayerLandscape = computed<boolean>(() => printLayout.value.endsWith('_L'))
const printDPI = computed<number>(() => printStore.config.dpi ?? PRINT_DEFAULT_DPI)

const layoutIdentifier = computed<string>(() =>
    printLayout.value.replace('_L', '').replace('_P', '')
)

const layoutDimensions = computed<number[] | undefined>(() => {
    if (
        !layoutIdentifier.value ||
        !Object.keys(PRINT_DIMENSIONS).includes(layoutIdentifier.value)
    ) {
        return
    }
    const dimensions = PRINT_DIMENSIONS[layoutIdentifier.value as keyof typeof PRINT_DIMENSIONS]

    if (!isLayerLandscape.value) {
        return dimensions.toReversed()
    }
    return dimensions
})

const mapCenter = computed(() => positionStore.center)
const currentLang = computed(() => i18nStore.lang)
const printContainerSize = computed<{ width: number; height: number } | undefined>(() => {
    if (!layoutDimensions.value || layoutDimensions.value.length < 2) {
        return
    }
    return {
        width: Math.round((layoutDimensions.value[0]! * printDPI.value) / inchToMillimeter),
        height: Math.round((layoutDimensions.value[1]! * printDPI.value) / inchToMillimeter),
    }
})
const printContainerStyle = computed(() => {
    if (!printContainerSize.value) {
        return null
    }
    return {
        width: `${printContainerSize.value.width}px`,
        height: `${printContainerSize.value.height}px`,
        padding: `${(PRINT_MARGIN_IN_MILLIMETERS * printDPI.value) / inchToMillimeter}px`,
    }
})
const mapScaleWidth = computed(() => {
    if (!printContainerSize.value) {
        return undefined
    }
    // max 10% of screen width or 200px
    return Math.min(printContainerSize.value.width * 0.1, 200)
})
const northArrowStyle = computed(() => {
    if (positionStore.rotation === 0) {
        return {}
    }
    return {
        transform: `rotate(${positionStore.rotation}rad)`,
    }
})
const matchingResolutionStepWithLabel = computed(() =>
    positionStore.projection
        .getResolutionSteps()
        .filter((step) => step.label)
        .find((res, index, otherResolution) => {
            if (index === 0) {
                // skip
                return
            }
            // checking if map resolution is between the two steps
            const previousStep = otherResolution[index - 1]
            if (previousStep) {
                return (
                    previousStep.resolution > positionStore.resolution &&
                    positionStore.resolution > res.resolution
                )
            }
        })
)

const printResolution = computed(
    () =>
        positionStore.resolution /
        getPointResolution(
            positionStore.projection.epsg,
            printDPI.value / inchToMillimeter,
            mapCenter.value
        )
)

onMounted(() => {
    log.info(`Print map view mounted`)
    mapStore.setPrintMode(true, dispatcher)

    generateShareLink().catch((_) => {})
})

onBeforeUnmount(() => {
    mapStore.setPrintMode(false, dispatcher)
})

watch(() => route.query, generateShareLink)

async function generateShareLink() {
    try {
        shortLink.value = await createShortLink(
            `${location.origin}/#/map?${stringifyQuery(route.query)}`
        )
    } catch (error) {
        log.error({ messages: `Failed to create shortlink`, error })
    }
}
</script>

<template>
    <div
        class="view print-view d-flex flex-column"
        :style="printContainerStyle"
    >
        <MapModule class="flex-grow-1">
            <div class="north-arrow position-absolute m-xl-5 end-0 top-0 z-3 m-4">
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
                            class="print-scale-line d-flex flex-column me-xl-3 m-2 me-3 border border-2 border-black bg-white p-3"
                        >
                            <div class="scale d-flex justify-content-center m-1 mb-3">
                                <OpenLayersScale
                                    v-if="mapScaleWidth && mapScaleWidth > 0"
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
                            class="qr-code position-relative m-n1 end-0 bottom-0 z-3 bg-white p-2"
                            alt="QR Code"
                        />
                    </template>
                    <template #middle>
                        <InfoboxModule />
                    </template>
                </MapFooter>
            </template>
        </MapModule>
        <div class="print-footer d-flex gap-3 px-3 pt-3 pb-1">
            <ConfederationFullLogo :render-for-dpi="printDPI" />
            <div class="print-disclaimer flew-grow-1 px-md-3 px-xl-5 d-flex flex-column px-1">
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
