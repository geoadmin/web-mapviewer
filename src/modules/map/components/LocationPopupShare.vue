<script setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'

import { generateQrCode } from '@/api/qrcode.api'
import { createShortLink } from '@/api/shortlink.api'
import LocationPopupCopyInput from '@/modules/map/components/LocationPopupCopyInput.vue'
import log from '@/utils/logging'
import { stringifyQuery } from '@/utils/url-router'

const props = defineProps({
    coordinate: {
        type: Boolean,
        required: true,
    },
    clickInfo: {
        type: Object,
        required: true,
    },
    currentLang: {
        type: Object,
        required: true,
    },
    showEmbedSharing: {
        type: Boolean,
        required: true,
        default: false,
    },
})
const { coordinate, clickInfo, currentLang, showEmbedSharing } = toRefs(props)
const qrCodeImageSrc = ref(false)
const shareLinkUrlShorten = ref(null)
const shareLinkUrl = ref(null)
const requestClipboard = ref(true)
const copied = ref(false)

const route = useRoute()

const shareLinkUrlDisplay = computed(() => {
    return shareLinkUrlShorten.value || shareLinkUrl.value || ''
})

onMounted(() => {
    if (clickInfo.value) {
        if (showEmbedSharing.value) {
            updateShareLink()
        }
    }
})

watch(clickInfo, (newClickInfo) => {
    if (showEmbedSharing.value) {
        requestClipboard.value = false
        updateShareLink()
    }
})
watch(currentLang, () => {
    requestClipboard.value = false
    setTimeout(() => updateShareLink(), 1)
})
watch(() => {
    if (showEmbedSharing.value) {
        route.query, updateShareLink
    }
})
watch(showEmbedSharing, () => {
    if (showEmbedSharing.value) {
        updateShareLink()
        copyValue()
    }
})
watch(shareLinkUrlShorten, () => {
    if (requestClipboard.value) {
        copyValue()
    }
    requestClipboard.value = false
})
watch(shareLinkUrlShorten, () => {
    requestClipboard.value = false
})
function updateShareLink() {
    let query = {
        ...route.query,
        crosshair: 'marker',
        center: coordinate.value.join(','),
    }
    shareLinkUrl.value = `${location.origin}/#/map?${stringifyQuery(query)}`
    shortenShareLink(shareLinkUrl.value)
}
async function shortenShareLink(url) {
    try {
        shareLinkUrlShorten.value = await createShortLink(url)
        await updateQrCode(shareLinkUrlShorten.value)
    } catch (error) {
        log.error(`Failed to shorten Share URL`, error)
        shareLinkUrlShorten.value = null
    }
}
async function copyValue() {
    try {
        copied.value = true
        if (showEmbedSharing.value) {
            await navigator.clipboard.writeText(shareLinkUrlShorten.value)
            copied.value = true
            setTimeout(() => {
                copied.value = false
            }, 1000)
        }
    } catch (error) {
        log.error(`Failed to copy to clipboard:`, error)
    }
}
async function updateQrCode(url) {
    try {
        qrCodeImageSrc.value = await generateQrCode(url)
    } catch (error) {
        log.error(`Failed to generate qrcode for share url`, error)
        qrCodeImageSrc.value = null
    }
}

</script>

<template>
    <!-- Online Tab -->
    <div
        id="nav-online"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-online-tab"
        data-cy="import-file-online-content"
    >
        <form class="input-group d-flex needs-validation">
            <div class="menu-share-embed">
                <div class="py-2 location-popup-link location-popup-coordinates-data">
                    <LocationPopupCopyInput
                        :value="shareLinkUrlDisplay"
                        data-cy="location-popup-link-bowl-crosshair"
                    />
                </div>
                <div class="p-2 location-popup-qrcode">
                    <img
                        v-if="qrCodeImageSrc"
                        :src="qrCodeImageSrc"
                        alt="qrcode"
                        data-cy="location-popup-qr-code"
                    />
                </div>
            </div>
        </form>
        <ImportFileButtons class="mt-2" :button-state="buttonState" @load-file="loadFile" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    @extend .clear-no-ios-long-press;

    &-link {
        display: flex;
        align-items: center;
    }
    &-qrcode {
        display: none;
        text-align: center;
    }
}
@media (min-height: 0px) {
    .location-popup-qrcode {
        display: block;
    }
}
</style>
