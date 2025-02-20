<script setup>
import log from '@geoadmin/log'
import { getPointResolution } from 'ol/proj'
import { computed, onMounted, ref } from 'vue'
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
import HeaderSwissConfederationText from '@/modules/menu/components/header/HeaderSwissConfederationText.vue'
import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import { stringifyQuery } from '@/utils/url-router.js'

const dispatcher = { dispatcher: 'PrintView.vue' }

const { layout = 'A4_L' } = defineProps({
    layout: {
        type: String,
        default: 'A4_L',
        validator: (value) => Object.keys(PRINT_DIMENSIONS).includes(value?.replace('_L', '')),
    },
})

const route = useRoute()
const store = useStore()
const { t } = useI18n()

const printDPI = PRINT_DEFAULT_DPI

const shortLink = ref(null)
const qrCodeUrl = computed(() => getGenerateQRCodeUrl(shortLink.value))

const now = new Date()

const isLayerLandscape = computed(() => layout.endsWith('_L'))
const layoutIdentifier = computed(() => layout.replace('_L', ''))
const layoutDimensions = computed(() => {
    const dimensions = PRINT_DIMENSIONS[layoutIdentifier.value]
    if (isLayerLandscape.value) {
        return dimensions.toReversed()
    }
    return dimensions
})
const mapResolution = computed(() => store.getters.resolution)
const currentProjection = computed(() => store.state.position.projection)
const mapCenter = computed(() => store.state.position.center)
const currentLang = computed(() => store.state.i18n.lang)
const printContainerStyle = computed(() => {
    if (!layoutDimensions.value) {
        return null
    }
    const width = Math.round((layoutDimensions.value[0] * printDPI) / 25.4)
    const height = Math.round((layoutDimensions.value[1] * printDPI) / 25.4)

    return {
        width: `${width}px`,
        height: `${height}px`,
    }
})
const matchingResolutionStepWithLabel = computed(() =>
    currentProjection.value
        .getResolutions()
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
        printDPI /
        getPointResolution(
            currentProjection.value.epsg,
            mapResolution.value / 25.4,
            mapCenter.value
        )
)

onMounted(() => {
    log.info(`Print map view mounted`)
    generateShareLink()
})

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
        class="view print-view d-flex flex-column p-5"
        :style="printContainerStyle"
    >
        <MapModule class="flex-grow-1">
            <img
                src="@/modules/map/assets/north_arrow.png"
                class="north-arrow position-absolute top-0 end-0 m-5 p-5 z-3"
                alt="North Arrow"
            >
            <OpenLayersPrintResolutionEnforcer :resolution="printResolution" />
            <template #footer>
                <MapFooter>
                    <template #top-left>
                        <OpenLayersScale class="p-1" />
                    </template>
                    <template #top-right>
                        <div
                            v-if="shortLink"
                            class="print-scale-line d-flex flex-column m-2 me-5 bg-white p-3 border border-2 border-black"
                        >
                            <div class="scale d-flex justify-content-center m-1 mb-3">
                                <OpenLayersScale
                                    scale-type="bar"
                                    :min-width="150"
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
                            class="qr-code position-relative bottom-0 end-0 z-3 bg-white p-2"
                            alt="QR Code"
                        >
                    </template>
                    <template #middle>
                        <InfoboxModule />
                    </template>
                </MapFooter>
            </template>
        </MapModule>
        <div class="print-footer d-flex pt-3 px-3 pb-1 gap-3">
            <SwissFlag />
            <HeaderSwissConfederationText />
            <div
                class="print-disclaimer flew-grow-1 px-5 d-flex flex-column justify-content-center"
            >
                <span>{{ t('print_footer_description') }}</span>
                <span>{{ t('print_footer_disclaimer') }}</span>
                <span>&copy; swisstopo</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.print-view {
    .north-arrow {
        height: 15vh;
        filter: drop-shadow(5px 5px 5px #222);
    }
    .qr-code {
        min-height: 10vh;
        border-top-left-radius: 1rem;
    }
}
</style>
