<script setup lang="ts">
import type { ExternalLayer } from '@swissgeo/layers'

import { CapabilitiesError } from '@swissgeo/layers/validation'
import { type ComponentPublicInstance, computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ProviderList, {
    type ProviderListExpose,
} from '@/modules/menu/components/advancedTools/ImportCatalogue/ProviderList.vue'
import { useCapabilities } from '@/modules/menu/components/advancedTools/ImportCatalogue/useCapabilities'
import { useProviders } from '@/modules/menu/components/advancedTools/ImportCatalogue/useProviders'
import useI18nStore from '@/store/modules/i18n'
import { isValidUrl } from '@/utils/utils'

const emit = defineEmits<{
    capabilitiesParsed: [layers: ExternalLayer[]]
    capabilitiesCleared: [void]
}>()

const { t } = useI18n()
const i18nStore = useI18nStore()

// Reactive data
const url = ref('')
const isCapabilitiesParsed = ref<boolean>(false)
const errorMessage = ref<string | undefined>()
const providerList = useTemplateRef<ComponentPublicInstance<ProviderListExpose>>('providerList')
const isLoading = ref<boolean>(false)
const providerInput = useTemplateRef<HTMLInputElement>('providerInput')

const { groupedProviders, showProviders, filterApplied, toggleProviders, filterText } =
    useProviders(url)

const { loadCapabilities } = useCapabilities(url)

// Computed properties
const isValid = computed<boolean>(() => !errorMessage.value && isCapabilitiesParsed.value)
const isInvalid = computed<boolean>(() => !!errorMessage.value)
const connectButtonKey = computed<string>(() => (isLoading.value ? 'loading' : 'connect'))

watch(
    () => i18nStore.lang,
    () => {
        if (isValid.value) {
            // When the language changes re-connect to reload the translated capabilities
            connect().catch((_) => {
                // satisfying the type-checker
            })
        }
    }
)

// Methods
function onUrlChange(_event: Event) {
    isCapabilitiesParsed.value = false
    errorMessage.value = undefined
}

function validateUrl() {
    if (url.value.length && !isValidUrl(url.value)) {
        errorMessage.value = 'invalid_url'
    }
    return !errorMessage.value
}

function clearUrl(event: MouseEvent) {
    isCapabilitiesParsed.value = false
    url.value = ''
    showProviders.value = false
    errorMessage.value = undefined
    if (event.screenX !== 0 || event.screenY !== 0) {
        // only focus on the provider input when the clear button has been clicked
        // and when it is a real click event (not a key stroke)
        if (providerInput.value) {
            providerInput.value.focus()
        }
    }
    emit('capabilitiesCleared')
}

function chooseProvider(providerUrl: string) {
    url.value = providerUrl
    connect().catch((_) => {
        // satisfying type checker
    })
}

function goToProviderList() {
    if (showProviders.value && providerList.value) {
        providerList.value.goToFirst()
    }
}

async function connect() {
    showProviders.value = false
    errorMessage.value = undefined
    try {
        isLoading.value = true

        const { layers } = await loadCapabilities()

        isLoading.value = false
        isCapabilitiesParsed.value = true
        emit('capabilitiesParsed', layers)
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

function onToggleProviders(event: MouseEvent) {
    toggleProviders()
    if (showProviders.value && (event.screenX !== 0 || event.screenY !== 0)) {
        // only focus on the provider input when the provider list has been opened
        // and when it is a real click event (not a key stroke)
        if (providerInput.value) {
            providerInput.value.focus()
        }
    }
}

function hideProviders() {
    showProviders.value = false
}
</script>

<template>
    <div
        v-click-outside="hideProviders"
        class="mb-2 pe-0"
    >
        <form class="input-group input-group-sm has-validation">
            <input
                ref="providerInput"
                v-model="url"
                type="text"
                class="form-control text-truncate rounded-end-0"
                :class="{
                    'is-valid': isValid,
                    'is-invalid': isInvalid,
                    'url-input-dropdown-open': showProviders,
                }"
                :disabled="isLoading"
                :aria-label="t('import_maps_url_placeholder')"
                :placeholder="t('import_maps_url_placeholder')"
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
                    class="btn btn-outline-group rounded-start-0"
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
                    class="btn btn-outline-group"
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
                        !isCapabilitiesParsed && url?.length && isValidUrl(url)
                    "
                    id="urlConnectButton"
                    type="button"
                    class="btn btn-outline-group"
                    :class="{ 'url-input-dropdown-open': showProviders }"
                    :disabled="!isValidUrl(url) || isLoading"
                    data-cy="import-connect-button"
                    @click.stop="connect"
                >
                    {{ t(connectButtonKey) }}
                    <font-awesome-icon
                        v-if="isLoading"
                        class="ms-1"
                        spin
                        :icon="['fa', 'spinner']"
                    />
                </button>
            </div>
            <div
                v-if="isInvalid && !showProviders && errorMessage"
                id="urlInvalidMessageFeedback"
                class="invalid-feedback"
                data-cy="import-catalog-invalid-feedback"
            >
                {{ t(errorMessage) }}
            </div>
        </form>
        <ProviderList
            id="urlProvidersList"
            ref="providerList"
            :grouped-providers="groupedProviders"
            :show-providers="showProviders"
            :filter-applied="filterApplied"
            :filter-text="filterText"
            @choose-provider="chooseProvider"
            @hide="showProviders = false"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.url-input-dropdown-open {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}
</style>
