<script setup>
import log from '@geoadmin/log'
import { getPointResolution } from 'ol/proj'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { getGenerateQRCodeUrl } from '@/api/qrcode.api.js'
import { createShortLink } from '@/api/shortlink.api.js'
import { PRINT_DIMENSIONS } from '@/config/print.config'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import OpenLayersPrintResolutionEnforcer from '@/modules/map/components/openlayers/OpenLayersPrintResolutionEnforcer.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapModule from '@/modules/map/MapModule.vue'
import HeaderSwissConfederationText from '@/modules/menu/components/header/HeaderSwissConfederationText.vue'
import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import { stringifyQuery } from '@/utils/url-router.js'

const dispatcher = { dispatcher: 'PrintView.vue' }

const { layout = 'A4', orientation = 'landscape' } = defineProps({
    layout: {
        type: String,
        default: 'A4',
        validator: (value) => Object.keys(PRINT_DIMENSIONS).includes(value),
    },
    orientation: String,
})

const route = useRoute()
const store = useStore()
const { t } = useI18n()

const printDPI = 150

const shortLink = ref(null)
const qrCodeUrl = computed(() => getGenerateQRCodeUrl(shortLink.value))

const layoutDimensions = computed(() => PRINT_DIMENSIONS[layout])
const mapResolution = computed(() => store.getters.resolution)
const currentProjection = computed(() => store.state.position.projection)
const mapCenter = computed(() => store.state.position.center)
const printContainerStyle = computed(() => {
    const width = Math.round((layoutDimensions.value[0] * printDPI) / 25.4)
    const height = Math.round((layoutDimensions.value[1] * printDPI) / 25.4)

    return {
        width: `${width}px`,
        height: `${height}px`,
    }
})
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
    store.dispatch('setPrintMode', { mode: true, ...dispatcher })

    generateShareLink()
})

onBeforeUnmount(() => {
    store.dispatch('setPrintMode', { mode: false, ...dispatcher })
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
        class="view print-view d-flex flex-column"
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
                        <img
                            v-if="shortLink"
                            :src="qrCodeUrl"
                            class="qr-code position-relative bottom-0 end-0 z-3"
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
        height: 8vh;
        filter: drop-shadow(5px 5px 5px #222);
    }
    .qr-code {
        height: 8vh;
    }
}
</style>
