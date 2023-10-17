<template>
    <div data-infobox="height-reference" class="import-overlay-content">
        <div class="input-group d-flex">
            <input
                ref="importInput"
                type="text"
                class="form-control import-input rounded-end"
                :placeholder="$t('import_online_placeholder')"
                :value="importValue"
                data-cy="import"
                @input="onInputChange"
                @focus="showProviders"
                @keydown.down.prevent="goToFirstResult"
                @keydown.esc.prevent="hideProviders"
            />
            <button
                class="list-switch"
                :class="{ 'clear-btn-shown': importValue?.length > 0 }"
                @click="toggleProviders"
            >
                <FontAwesomeIcon :icon="listShown ? 'caret-up' : 'caret-down'" />
            </button>
            <button
                v-if="importValue?.length > 0"
                id="button-addon1"
                class="btn btn-outline-group rounded-end"
                type="button"
                data-cy="searchbar-clear"
                @click="clearImportQuery"
            >
                <FontAwesomeIcon :icon="['fas', 'times-circle']" />
            </button>
            <div v-if="listShown" ref="providers" class="providers-list-container bg-light">
                <div class="providers-list">
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
            class="connect-btn-container"
            :class="{
                disabled: isConnectDisabled,
            }"
        >
            <button
                type="button"
                class="btn btn-outline-secondary connect-btn mt-1"
                :disabled="isConnectDisabled"
                @click="onConnect"
            >
                {{ buttonText }}
            </button>
        </div>
        <!-- todo just for test -->
        <div class="d-flex flex-column h-50 overflow-y-auto">
            <div
                v-for="layer in importedLayers"
                :key="layer.externalLayerId"
                class="cursor-pointer"
                @click="() => addLayer(layer)"
            >
                {{ layer.name }}
            </div>
        </div>
    </div>
</template>
<script>
import externalLayerProviders from '@/external-layer-providers.json'
import { isValidUrl, transformUrl } from '@/utils/url'
import { mapActions, mapState } from 'vuex'
import {
    getCapWMSLayers,
    getCapWMTSLayers,
    isGpx,
    isKml,
    isWmsGetCap,
    isWmtsGetCap,
} from '@/utils/file'
import { WMSCapabilities } from 'ol/format'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import KMLLayer from '@/api/layers/KMLLayer.class'

const BTN_RESET_TIMEOUT = 3000

export default {
    data() {
        return {
            importValue: '',
            listShown: false,
            // 'default | 'loading | 'failed' | 'succeeded'
            uploadBtnStatus: 'default',
            importedLayers: [], // todo just for test
        }
    },
    computed: {
        ...mapState({
            lang: (state) => state.i18n.lang,
        }),
        filteredList() {
            let providers = externalLayerProviders
            if (this.importValue?.length) {
                providers = externalLayerProviders.filter((it) => it.includes(this.importValue))
            }
            return providers.map((it) => {
                return {
                    value: it,
                    toShow: it.replace(this.importValue, `<strong>${this.importValue}</strong>`),
                }
            })
        },
        isConnectDisabled() {
            return !isValidUrl(this.importValue)
        },
        buttonText() {
            if (this.uploadBtnStatus === 'loading') {
                return this.$i18n.t('uploading_file')
            } else if (this.uploadBtnStatus === 'failed') {
                return this.$i18n.t('upload_failed')
            } else if (this.uploadBtnStatus === 'succeeded') {
                return this.$i18n.t('upload_succeeded')
            }
            return this.$i18n.t('connect')
        },
    },
    methods: {
        ...mapActions(['addLayer']),
        onInputChange(event) {
            this.importValue = event.target.value
        },
        onChooseProvider(provider) {
            this.importValue = provider
            this.hideProviders()
        },
        onConnect() {
            this.uploadBtnStatus = 'loading'
            this.handleFileUrl()
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
        handleFileContent(fileContent, url) {
            if (isWmsGetCap(fileContent)) {
                const parser = new WMSCapabilities()
                const getCap = parser.read(fileContent)
                // todo just for test
                this.importedLayers = getCap.Capability.Layer.Layer.map((l) =>
                    getCapWMSLayers(getCap, l)
                ).filter((l) => !!l)
            } else if (isWmtsGetCap(fileContent)) {
                const parser = new WMTSCapabilities()
                const getCap = parser.read(fileContent)
                // todo just for test
                this.importedLayers = getCap.Contents.Layer.map((l) =>
                    getCapWMTSLayers(url, getCap, l)
                ).filter((l) => !!l)
            } else if (isKml(fileContent)) {
                // todo just for test
                this.importedLayers = [new KMLLayer(url, true, 1, null, null, null, null, true)]
            } else if (isGpx(fileContent)) {
                // TODO GPX layer not done yet
            } else {
                throw new Error('Wrong file content.')
            }
        },
        async handleFileUrl() {
            const url = await transformUrl(this.importValue, this.lang)
            try {
                const response = await fetch(url)
                const fileContent = await response.text()
                this.handleFileContent(fileContent, url)
                this.uploadBtnStatus = 'succeeded'
                setTimeout(() => (this.uploadBtnStatus = 'default'), BTN_RESET_TIMEOUT)
            } catch (e) {
                console.error(e)
                this.uploadBtnStatus = 'failed'
                setTimeout(() => (this.uploadBtnStatus = 'default'), BTN_RESET_TIMEOUT)
            }
        },
        clearImportQuery() {
            this.importValue = ''
            this.$refs.importInput.focus()
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.import-overlay-content {
    height: 250px;
}

.import-input {
    font-size: 0.825rem;
}

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
            background-color: $secondary;
            color: $light;
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
</style>
