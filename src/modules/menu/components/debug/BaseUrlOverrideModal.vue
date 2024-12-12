<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'
import { useStore } from 'vuex'

import {
    getBaseUrlOverride,
    getDefaultBaseUrl,
    hasBaseUrlOverrides,
    setBaseUrlOverrides,
} from '@/config/baseUrl.config'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

const dispatcher = { dispatcher: 'BaseUrlOverrideModal.vue' }

const store = useStore()

const wmsUrlOverride = ref(getBaseUrlOverride('wms'))
const wmtsUrlOverride = ref(getBaseUrlOverride('wmts'))
const api3UrlOverride = ref(getBaseUrlOverride('api3'))
const viewerDedicatedServicesUrlOverride = ref(getBaseUrlOverride('viewerDedicatedServices'))

function onModalClose(withConfirmation) {
    if (withConfirmation) {
        setBaseUrlOverrides('wms', wmsUrlOverride.value ?? null)
        setBaseUrlOverrides('wmts', wmtsUrlOverride.value ?? null)
        setBaseUrlOverrides('api3', api3UrlOverride.value ?? null)
        setBaseUrlOverrides(
            'viewerDedicatedServices',
            viewerDedicatedServicesUrlOverride.value ?? null
        )
    }
    store.dispatch('setHasBaseUrlOverrides', {
        hasOverrides: hasBaseUrlOverrides(),
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
                        :placeholder="`default: ${getDefaultBaseUrl('wms')}`"
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
                        :placeholder="`default: ${getDefaultBaseUrl('wmts')}`"
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
                        :placeholder="`default: ${getDefaultBaseUrl('api3')}`"
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
            <div class="mb-3">
                <label for="viewerDedicatedServicesUrlOverride" class="form-label"
                    >sys-map base URL</label
                >
                <div class="input-group">
                    <input
                        id="viewerDedicatedServicesUrlOverride"
                        v-model="viewerDedicatedServicesUrlOverride"
                        type="url"
                        class="form-control"
                        :placeholder="`default: ${getDefaultBaseUrl('viewerDedicatedServices')}`"
                    />
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        :disabled="viewerDedicatedServicesUrlOverride === null"
                        @click="viewerDedicatedServicesUrlOverride = null"
                    >
                        <FontAwesomeIcon icon="times" />
                    </button>
                </div>
            </div>
        </div>
    </ModalWithBackdrop>
</template>
