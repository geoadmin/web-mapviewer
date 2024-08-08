<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'
import { useStore } from 'vuex'

import { API_BASE_URL, WMS_BASE_URL, WMTS_BASE_URL } from '@/config'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import { enforceEndingSlashInUrl } from '@/utils/utils'

const dispatcher = { dispatcher: 'BaseUrlOverrideModal.vue' }

const store = useStore()

const wmsUrlOverride = ref(store.state.debug.baseUrlOverride.wms)
const wmtsUrlOverride = ref(store.state.debug.baseUrlOverride.wmts)
const api3UrlOverride = ref(store.state.debug.baseUrlOverride.api3)

function onModalClose(withConfirmation) {
    if (withConfirmation) {
        store.dispatch('setWmsBaseUrlOverride', {
            baseUrl: enforceEndingSlashInUrl(wmsUrlOverride.value),
            ...dispatcher,
        })
        store.dispatch('setWmtsBaseUrlOverride', {
            baseUrl: enforceEndingSlashInUrl(wmtsUrlOverride.value),
            ...dispatcher,
        })
        store.dispatch('setApi3BaseUrlOverride', {
            baseUrl: enforceEndingSlashInUrl(api3UrlOverride.value),
            ...dispatcher,
        })
    }
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
                        :placeholder="`default: ${WMS_BASE_URL}`"
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
                        :placeholder="`default: ${WMTS_BASE_URL}`"
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
                        :placeholder="`default: ${API_BASE_URL}`"
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
