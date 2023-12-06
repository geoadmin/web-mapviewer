<template>
    <div
        data-infobox="height-reference"
        class="import-overlay-content"
        :class="{ 'with-layers': importedLayers?.length }"
        data-cy="import-tool-content"
    >
        <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item">
                <button
                    class="nav-link py-1"
                    :class="{
                        active: selectedTab === 'online',
                    }"
                    data-bs-toggle="tab"
                    data-bs-target="#nav-online"
                    type="button"
                    role="tab"
                    aria-controls="nav-online"
                    aria-selected="true"
                    data-cy="online-import-btn"
                    @click="() => (selectedTab = 'online')"
                >
                    <!-- TODO add translation -->
                    Online
                </button>
            </li>
            <li class="nav-item">
                <button
                    class="nav-link py-1"
                    :class="{
                        active: selectedTab === 'local',
                    }"
                    data-bs-toggle="tab"
                    data-bs-target="#nav-local"
                    type="button"
                    role="tab"
                    aria-controls="nav-local"
                    aria-selected="false"
                    data-cy="local-import-btn"
                    @click="() => (selectedTab = 'local')"
                >
                    <!-- TODO add translation -->
                    Local
                </button>
            </li>
        </ul>
        <div class="tab-content mt-2">
            <div
                id="nav-online"
                class="tab-pane fade"
                :class="{ active: selectedTab === 'online', show: selectedTab === 'online' }"
                role="tabpanel"
                aria-labelledby="nav-online-tab"
            >
                <div class="input-group d-flex">
                    <input
                        ref="onlineImportInput"
                        type="text"
                        class="form-control import-input"
                        :class="{ 'rounded-end': !onlineImportValue?.length }"
                        :placeholder="$t('import_online_placeholder')"
                        :value="onlineImportValue"
                        data-cy="import"
                        @input="onInputChange"
                        @focus="showProviders"
                        @keydown.down.prevent="goToFirstResult"
                        @keydown.esc.prevent="hideProviders"
                    />
                    <button
                        class="list-switch"
                        :class="{ 'clear-btn-shown': onlineImportValue?.length > 0 }"
                        data-cy="import-list-switch-button"
                        @click="toggleProviders"
                    >
                        <FontAwesomeIcon :icon="listShown ? 'caret-up' : 'caret-down'" />
                    </button>
                    <button
                        v-if="onlineImportValue?.length > 0"
                        id="button-addon1"
                        class="btn btn-outline-group rounded-end"
                        type="button"
                        data-cy="import-input-clear"
                        @click="clearImportQuery"
                    >
                        <FontAwesomeIcon :icon="['fas', 'times-circle']" />
                    </button>
                    <div v-if="listShown" ref="providers" class="providers-list-container bg-light">
                        <div class="providers-list" data-cy="import-provider-list">
                            <div
                                v-for="(provider, key) in filteredList"
                                :key="provider"
                                :tabindex="key"
                                class="providers-list-item p-2"
                                @keydown.up.prevent="() => goToPrevious(key)"
                                @keydown.down.prevent="() => goToNext(key)"
                                @keydown.home.prevent="goToFirst"
                                @keydown.end.prevent="goToLast"
                                @click="() => onChooseProvider(provider.value)"
                            >
                                <!-- eslint-disable vue/no-v-html-->
                                <span v-html="provider.toShow"></span>
                                <!-- eslint-enable vue/no-v-html-->
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="connect-btn-container mb-2"
                    :class="{
                        disabled: isConnectDisabled,
                    }"
                >
                    <button
                        type="button"
                        class="btn btn-outline-secondary connect-btn mt-1"
                        :disabled="isConnectDisabled"
                        data-cy="import-connect-button"
                        @click="onConnectOrLoad"
                    >
                        {{ buttonText }}
                    </button>
                </div>
            </div>
            <div
                id="nav-local"
                class="tab-pane fade"
                :class="{ active: selectedTab === 'local', show: selectedTab === 'local' }"
                role="tabpanel"
                aria-labelledby="nav-local-tab"
            >
                <div class="input-group">
                    <input
                        ref="localImportInput"
                        type="file"
                        :accept="localUploadAccept"
                        :size="localUploadMaxSize"
                        hidden
                        data-cy="import-local-input"
                        @change="onFileSelected"
                    />
                    <input
                        type="text"
                        class="form-control local-import-input"
                        :placeholder="$t('no_file')"
                        :value="importedFileInfo"
                        readonly
                        @click="() => $refs.localImportInput.click()"
                    />
                    <button
                        class="btn btn-outline-secondary local-import-btn"
                        type="button"
                        @click="() => $refs.localImportInput.click()"
                    >
                        {{ $t('browse') }}
                    </button>
                </div>
                <div v-show="showMaxSizeError" class="text-danger">{{ $t('file_too_large') }}</div>
                <div
                    class="connect-btn-container mb-2"
                    :class="{
                        disabled: isLoadDisabled,
                    }"
                >
                    <button
                        type="button"
                        class="btn btn-outline-secondary connect-btn mt-1"
                        :disabled="isLoadDisabled"
                        data-cy="import-load-button"
                        @click="onConnectOrLoad"
                    >
                        {{ buttonText }}
                    </button>
                </div>
            </div>
        </div>
        <ImportContentResultList
            v-if="importedLayers?.length"
            :imported-layers="importedLayers"
            :max-size="wmsMaxSize"
        ></ImportContentResultList>
    </div>
</template>
<script>
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { mapState } from 'vuex'

import KMLLayer from '@/api/layers/KMLLayer.class'
import { parseWmsCapabilities, parseWmtsCapabilities } from '@/api/layers/layers-external.api'
import externalLayerProviders from '@/modules/infobox/utils/external-layer-providers.json'
import {
    guessExternalLayerUrl,
    isGpx,
    isKml,
    isValidUrl,
    isWmsGetCap,
    isWmtsGetCap,
} from '@/modules/infobox/utils/external-provider'
import log from '@/utils/logging'

import ImportContentResultList from './ImportContentResultList.vue'

const BTN_RESET_TIMEOUT = 3000

export default {
    components: { ImportContentResultList },
    emits: ['connected'],
    setup() {
        const i18n = useI18n()
        return {
            i18n,
        }
    },
    data() {
        return {
            onlineImportValue: '',
            listShown: false,
            /** @type {'default' | 'loading' | 'failed' | 'succeeded'} */
            uploadBtnStatus: 'default',
            importedLayers: [],
            wmsMaxSize: undefined,
            /** @type {'online' | 'local'} */
            selectedTab: 'online',
            importedFileInfo: '',
            localUploadAccept: '.kml,.KML,.gpx,.GPX',
            localUploadMaxSize: 20000000, // 20mb
            selectedFile: null,
            showMaxSizeError: false,
        }
    },
    computed: {
        ...mapState({
            lang: (state) => state.i18n.lang,
            projection: (state) => state.position.projection,
        }),
        filteredList() {
            let providers = externalLayerProviders
            if (this.onlineImportValue?.length) {
                providers = externalLayerProviders.filter((it) =>
                    it.includes(this.onlineImportValue)
                )
            }
            return providers.map((it) => {
                return {
                    value: it,
                    toShow: it.replace(
                        this.onlineImportValue,
                        `<strong>${this.onlineImportValue}</strong>`
                    ),
                }
            })
        },
        isConnectDisabled() {
            return !isValidUrl(this.onlineImportValue)
        },
        isLoadDisabled() {
            return !this.selectedFile
        },
        buttonText() {
            if (this.uploadBtnStatus === 'loading') {
                return this.i18n.t('parsing_file')
            } else if (this.uploadBtnStatus === 'failed') {
                return this.i18n.t('parse_failed')
            } else if (this.uploadBtnStatus === 'succeeded') {
                return this.i18n.t('parse_succeeded')
            } else if (this.selectedTab === 'local') {
                return this.i18n.t('load_local_file')
            }
            return this.i18n.t('connect')
        },
    },
    watch: {
        lang() {
            if (this.importedLayers?.length) {
                this.onConnectOrLoad()
            }
        },
    },
    methods: {
        onInputChange(event) {
            this.onlineImportValue = event.target.value
        },
        onChooseProvider(provider) {
            this.onlineImportValue = provider
            this.hideProviders()
        },
        async onConnectOrLoad() {
            this.uploadBtnStatus = 'loading'
            if (this.selectedTab === 'online') {
                await this.handleFileUrl()
            } else if (this.selectedTab === 'local') {
                this.uploadFile()
            }
            this.$emit('connected')
        },
        showProviders() {
            this.listShown = true
        },
        hideProviders() {
            this.listShown = false
        },
        toggleProviders() {
            if (this.listShown) {
                this.hideProviders()
            } else {
                this.showProviders()
            }
        },
        goToFirstResult() {
            if (!this.listShown) {
                this.showProviders()
            }
            // Wait a tick in case the list weren't shown before.
            this.$nextTick(() => {
                // Switch focus to the first item in the list that can get it.
                // Initially, this will be the first entry of the location list.
                this.$refs.providers.querySelector('[tabindex="0"]').focus()
            })
        },
        goToPrevious(currentKey) {
            if (currentKey === 0) return
            const key = currentKey - 1
            this.$refs.providers.querySelector(`[tabindex="${key}"]`).focus()
        },
        goToNext(currentKey) {
            if (currentKey >= this.filteredList.length - 1) return
            const key = currentKey + 1
            this.$refs.providers.querySelector(`[tabindex="${key}"]`).focus()
        },
        goToFirst() {
            this.$refs.providers.querySelector('[tabindex="0"]').focus()
        },
        goToLast() {
            this.$refs.providers
                .querySelector(`[tabindex="${this.filteredList.length - 1}"]`)
                .focus()
        },
        handleFileContent(fileContent, url, contentType) {
            if (isWmsGetCap(fileContent)) {
                const capabilities = parseWmsCapabilities(fileContent, url)
                this.handleWms(capabilities)
            } else if (isWmtsGetCap(fileContent)) {
                const capabilities = parseWmtsCapabilities(fileContent, url)
                this.handleWmts(capabilities)
            } else if (isKml(fileContent)) {
                // todo just for test
                this.importedLayers = [new KMLLayer(url, true, 1, null, null, null, null, true)]
            } else if (isGpx(fileContent)) {
                // TODO GPX layer not done yet
            } else {
                throw new Error(
                    `Unsupported url ${url} response content; Content-Type=${contentType}`
                )
            }
        },
        handleWms(capabilities) {
            if (capabilities.Service.MaxWidth && capabilities.Service.MaxHeight) {
                this.wmsMaxSize = {
                    width: capabilities.Service.MaxWidth,
                    height: capabilities.Service.MaxHeight,
                }
            }
            this.importedLayers = capabilities.getAllExternalLayerObjects(this.projection, 1, true)
        },
        handleWmts(capabilities) {
            this.importedLayers = capabilities.getAllExternalLayerObjects(this.projection, 1, true)
        },
        async handleFileUrl() {
            this.wmsMaxSize = undefined
            const url = guessExternalLayerUrl(this.onlineImportValue, this.lang).toString()
            try {
                const response = await axios.get(url)
                if (response.status !== 200) {
                    throw new Error(`Failed to fetch ${url}; status_code=${response.status}`)
                }
                this.handleFileContent(response.data, url, response.headers.get('Content-Type'))
                if (this.importedLayers.length === 0) {
                    throw new Error(`No valid layer found in ${url}`)
                }
                this.uploadBtnStatus = 'succeeded'
                setTimeout(() => (this.uploadBtnStatus = 'default'), BTN_RESET_TIMEOUT)
            } catch (error) {
                log.error(`Failed to fetch url ${url}`, error, error.stack)
                this.uploadBtnStatus = 'failed'
                setTimeout(() => (this.uploadBtnStatus = 'default'), BTN_RESET_TIMEOUT)
            }
        },
        clearImportQuery() {
            this.onlineImportValue = ''
            this.$refs.onlineImportInput.focus()
        },
        onFileSelected(evt) {
            this.showMaxSizeError = false
            const file = evt.target?.files[0]
            if (!file) return
            this.importedFileInfo = `${file.name}, ${file.size / 1000} ko`
            this.$refs.localImportInput.value = null
            if (file.size > this.localUploadMaxSize) {
                this.showMaxSizeError = true
                this.selectedFile = null
            } else {
                this.selectedFile = file
            }
        },
        uploadFile() {
            this.importedLayers = []
            this.onlineImportValue = ''

            // TODO handle file content
            console.error('Uploaded file: ', this.selectedFile)

            this.uploadBtnStatus = 'succeeded'
            setTimeout(() => (this.uploadBtnStatus = 'default'), BTN_RESET_TIMEOUT)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.import-overlay-content {
    overflow-x: hidden;
    overflow-y: auto;
    font-size: 0.825rem;
    height: min(260px, 35vh);
}

.import-overlay-content.with-layers {
    height: min(450px, 35vh);
}

.local-import-btn:focus,
.local-import-input:focus,
.import-input:focus {
    box-shadow: none;
}

.connect-btn {
    width: 100%;
    cursor: pointer;
}
.connect-btn.loading {
    background-color: #c9302c;
}
.connect-btn-container.disabled {
    cursor: not-allowed;
}
.providers-list-container {
    position: absolute;
    top: 100%;
    width: 100%;
    overflow-y: auto;
    max-height: 200px;
    background-color: white;
    z-index: 1;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);

    .providers-list {
        display: grid;
        grid-auto-rows: 1fr;

        .providers-list-item {
            cursor: pointer;
            font-size: 0.8rem;
        }
        .providers-list-item:focus,
        .providers-list-item:hover {
            background-color: $list-item-hover-color;
        }
    }
}

.list-switch {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 15px;
    right: 10px;
    height: 100%;
    cursor: pointer;
    background: transparent;
    border: none;
    z-index: 10;
}

.list-switch.clear-btn-shown {
    right: 50px;
}
.local-import-btn,
.local-import-input {
    cursor: pointer;
}
.nav-tabs {
    .nav-link.active {
        background-color: $primary;
        color: white;
    }
}
</style>
