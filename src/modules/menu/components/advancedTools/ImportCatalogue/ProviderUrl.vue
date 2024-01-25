<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { CapabilitiesError } from '@/api/layers/layers-external.api'
import ProviderList from '@/modules/menu/components/advancedTools/ImportCatalogue/ProviderList.vue'
import { useCapabilities } from '@/modules/menu/components/advancedTools/ImportCatalogue/useCapabilities'
import { useProviders } from '@/modules/menu/components/advancedTools/ImportCatalogue/useProviders'
import { isValidUrl } from '@/utils/utils'

const emit = defineEmits(['capabilities:parsed', 'capabilities:cleared'])

const i18n = useI18n()
const store = useStore()

// Reactive data
const url = ref('')
const capabilitiesParsed = ref(false)
const errorMessage = ref(null)
const providerList = ref(null)
const isLoading = ref(false)
const providerIntput = ref(null)

const { providers, showProviders, toggleProviders } = useProviders(url)
const { loadCapabilities } = useCapabilities(url)

// Computed properties
const isValid = computed(() => !errorMessage.value && capabilitiesParsed.value)
const isInvalid = computed(() => errorMessage.value)
const connectButtonKey = computed(() => (isLoading.value ? 'loading' : 'connect'))
const lang = computed(() => store.state.i18n.lang)

watch(lang, () => {
    // When the language changes re-connect to reload the translated capabilities
    connect()
})

// Methods
function onUrlChange(_event) {
    capabilitiesParsed.value = false
    errorMessage.value = null
}

function validateUrl() {
    if (url.value.length && !isValidUrl(url.value)) {
        errorMessage.value = 'invalid_url'
    }
    return !errorMessage.value
}

function clearUrl(event) {
    capabilitiesParsed.value = false
    url.value = ''
    showProviders.value = false
    errorMessage.value = null
    if (event.screenX !== 0 || event.screenY !== 0) {
        // only focus on the provider input when the clear button has been clicked
        // and when it is a real click event (not a key stroke)
        providerIntput.value.focus()
    }
    emit('capabilities:cleared')
}

function chooseProvider(providerUrl) {
    url.value = providerUrl
    connect()
}

function goToProviderList() {
    if (showProviders.value) {
        providerList.value.goToFirst()
    }
}

async function connect() {
    showProviders.value = false
    errorMessage.value = null
    try {
        isLoading.value = true
        const { layers, wmsMaxSize } = await loadCapabilities()
        isLoading.value = false
        capabilitiesParsed.value = true
        emit('capabilities:parsed', layers, wmsMaxSize)
    } catch (error) {
        isLoading.value = false
        if (error instanceof CapabilitiesError) {
            errorMessage.value = error.key
        } else {
            errorMessage.value = 'error'
            throw error
        }
    }
}

function onToggleProviders(event) {
    toggleProviders()
    if (showProviders.value && (event.screenX !== 0 || event.screenY !== 0)) {
        // only focus on the provider input when the provider list has been opened
        // and when it is a real click event (not a key stroke)
        providerIntput.value.focus()
    }
}

function hideProviders() {
    showProviders.value = false
}
</script>

<template>
    <div v-click-outside="hideProviders" class="mb-2 pe-0">
        <form class="input-group input-group-sm has-validation">
            <input
                ref="providerIntput"
                v-model="url"
                type="text"
                class="form-control text-truncate rounded-end-0"
                :class="{
                    'is-valid': isValid,
                    'is-invalid': isInvalid,
                    'url-input-dropdown-open': showProviders,
                }"
                :disabled="isLoading"
                :aria-label="i18n.t('import_maps_url_placeholder')"
                :placeholder="i18n.t('import_maps_url_placeholder')"
                aria-describedby="urlInputControlBtnGrp urlToggleProviderButton urlClearButton urlConnectButton urlInvalidMessageFeedback"
                data-cy="import-catalogue-input"
                @input="onUrlChange"
                @focusin="showProviders = true"
                @focusout="validateUrl"
                @keydown.down.prevent="goToProviderList"
                @keydown.esc.prevent="showProviders = false"
                @keydown.enter.prevent="connect"
            />
            <div
                id="urlInputControlBtnGrp"
                class="input-group-append btn-group btn-group-sm"
                role="group"
                aria-label="Input control"
                aria-describedby="urlToggleProviderButton urlClearButton urlConnectButton"
            >
                <!-- Toggle Provider button -->
                <button
                    id="urlToggleProviderButton"
                    class="btn btn-outline-secondary rounded-start-0"
                    :class="{ 'url-input-dropdown-open': showProviders }"
                    :disabled="isLoading"
                    type="button"
                    data-cy="import-catalogue-providers-toggle"
                    @click="onToggleProviders"
                >
                    <FontAwesomeIcon :icon="showProviders ? 'caret-up' : 'caret-down'" />
                </button>
                <!-- Clear button -->
                <button
                    v-if="url?.length > 0"
                    id="urlClearButton"
                    class="btn btn-outline-secondary"
                    :class="{ 'url-input-dropdown-open': showProviders }"
                    :disabled="isLoading"
                    type="button"
                    data-cy="import-input-clear"
                    @click.stop="clearUrl"
                >
                    <FontAwesomeIcon :icon="['fas', 'times-circle']" />
                </button>
                <!-- Connect button -->
                <button
                    v-if="
                        // We use v-if instead of v-show here in order to have bootstrap handling
                        // the rounded corner correctly
                        !capabilitiesParsed && url.length && isValidUrl(url)
                    "
                    id="urlConnectButton"
                    type="button"
                    class="btn btn-outline-secondary"
                    :class="{ 'url-input-dropdown-open': showProviders }"
                    :disabled="!isValidUrl(url) || isLoading"
                    data-cy="import-connect-button"
                    @click.stop="connect"
                >
                    {{ i18n.t(connectButtonKey) }}
                    <font-awesome-icon
                        v-if="isLoading"
                        class="ms-1"
                        spin
                        :icon="['fa', 'spinner']"
                    />
                </button>
            </div>
            <div
                v-if="isInvalid && !showProviders"
                id="urlInvalidMessageFeedback"
                class="invalid-feedback"
                data-cy="import-catalog-invalid-feedback"
            >
                {{ i18n.t(errorMessage) }}
            </div>
        </form>
        <ProviderList
            id="urlProvidersList"
            ref="providerList"
            :providers="providers"
            :show-providers="showProviders"
            @choose-provider="chooseProvider"
        />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.url-input-dropdown-open {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}
</style>
