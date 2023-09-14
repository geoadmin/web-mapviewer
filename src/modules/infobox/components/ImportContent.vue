<template>
    <div data-infobox="height-reference" class="import-overlay-content">
        <div class="input-group d-flex">
            <input
                type="text"
                class="form-control search-bar-input"
                :placeholder="$t('import_online_placeholder')"
                :value="importValue"
                data-cy="import"
                @input="onInputChange"
                @focus="showProviders"
                @keydown.down.prevent="goToFirstResult"
                @keydown.esc.prevent="hideProviders"
            />
            <div v-if="listShown" ref="providers" class="providers-list-container">
                <div class="providers-list">
                    <div
                        v-for="(provider, key) in filteredList"
                        :key="provider"
                        :tabindex="key"
                        class="providers-list-item"
                        @keydown.up.prevent="() => goToPrevious(key)"
                        @keydown.down.prevent="() => goToNext(key)"
                        @keydown.home.prevent="goToFirst"
                        @keydown.end.prevent="goToLast"
                    >
                        <span
                            v-html="provider.toShow"
                            @click="() => onChooseProvider(provider.value)"
                        ></span>
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
                class="btn btn-outline-secondary connect-btn"
                :disabled="isConnectDisabled"
                @click="onConnect"
            >
                {{ buttonText }}
            </button>
        </div>
    </div>
</template>
<script>
import externalLayerProviders from '@/external-layer-providers.json'
import { isValidUrl, transformUrl } from '@/utils/url'
import { mapState } from 'vuex'

const BTN_RESET_TIMEOUT = 3000

export default {
    data() {
        return {
            importValue: '',
            listShown: false,
            // 'default | 'loading | 'failed' | 'succeeded'
            uploadBtnStatus: 'default',
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
        async handleFileUrl() {
            const url = await transformUrl(this.importValue, this.lang)
            try {
                const response = await fetch(url)
                console.log(await response.text())
                this.uploadBtnStatus = 'succeeded'
                setTimeout(() => (this.uploadBtnStatus = 'default'), BTN_RESET_TIMEOUT)
            } catch (e) {
                console.error(e)
                this.uploadBtnStatus = 'failed'
                setTimeout(() => (this.uploadBtnStatus = 'default'), BTN_RESET_TIMEOUT)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.import-overlay-content {
    height: 250px;
}
.connect-btn {
    width: 100%;
    margin-top: 5px;
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
            margin: 5px 10px;
            cursor: pointer;
            :deep(strong) {
                background-color: rgba(255, 128, 0, 0.3);
            }
        }
        .providers-list-item:focus,
        .providers-list-item:hover {
            background-color: #f0f0f0;
        }
    }
}
</style>
