<script setup>

import { ref } from 'vue'
import { generateQrCode } from '@/api/qrcode.api'
import LocationPopupCopyInput from '@/modules/map/components/LocationPopupCopyInput.vue'


const qrCodeImageSrc = ref(null)

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
