<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { enforceEndingSlashInUrl } from '@/config'
import { baseUrlOverrides, defaultBaseUrlConfig } from '@/config/baseUrl.config'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

const dispatcher = { dispatcher: 'BaseUrlOverrideModal.vue' }

const store = useStore()
const hasBaseUrlOverrides = computed(
    () => !!wmsUrlOverride.value || !!wmtsUrlOverride.value || !!api3UrlOverride.value
)

const wmsUrlOverride = ref(baseUrlOverrides.wms)
const wmtsUrlOverride = ref(baseUrlOverrides.wmts)
const api3UrlOverride = ref(baseUrlOverrides.api3)

function onModalClose(withConfirmation) {
    if (withConfirmation) {
        baseUrlOverrides.wms = enforceEndingSlashInUrl(wmsUrlOverride.value)
        baseUrlOverrides.wmts = enforceEndingSlashInUrl(wmtsUrlOverride.value)
        baseUrlOverrides.api3 = enforceEndingSlashInUrl(api3UrlOverride.value)
    }
    store.dispatch('setHasBaseUrlOverrides', {
        hasOverrides: hasBaseUrlOverrides.value,
        ...dispatcher,
    })
}
</script>

<template>
    <ModalWithBackdrop show-confirmation-buttons @close="onModalClose">
        <div class="container">
            <div class="mb-3">
                <label for="wmsUrlOverride" class="form-label">WMS base URL</label>
                <div class="input-group">
                    <input
                        id="wmsUrlOverride"
                        v-model="wmsUrlOverride"
                        type="url"
                        class="form-control"
                        :placeholder="`default: ${defaultBaseUrlConfig.wms}`"
                    />
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        :disabled="wmsUrlOverride === null"
                        @click="wmsUrlOverride = null"
                    >
                        <FontAwesomeIcon icon="times" />
                    </button>
                </div>
            </div>
            <div class="mb-3">
                <label for="wmtsUrlOverride" class="form-label">WMTS base URL</label>
                <div class="input-group">
                    <input
                        id="wmtsUrlOverride"
                        v-model="wmtsUrlOverride"
                        type="url"
                        class="form-control"
                        :placeholder="`default: ${defaultBaseUrlConfig.wmts}`"
                    />
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        :disabled="wmtsUrlOverride === null"
                        @click="wmtsUrlOverride = null"
                    >
                        <FontAwesomeIcon icon="times" />
                    </button>
                </div>
            </div>
            <div class="mb-3">
                <label for="api3UrlOverride" class="form-label">API3 base URL</label>
                <div class="input-group">
                    <input
                        id="api3UrlOverride"
                        v-model="api3UrlOverride"
                        type="url"
                        class="form-control"
                        :placeholder="`default: ${defaultBaseUrlConfig.api3}`"
                    />
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        :disabled="api3UrlOverride === null"
                        @click="api3UrlOverride = null"
                    >
                        <FontAwesomeIcon icon="times" />
                    </button>
                </div>
            </div>
        </div>
    </ModalWithBackdrop>
</template>
