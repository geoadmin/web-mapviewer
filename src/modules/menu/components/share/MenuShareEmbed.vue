<template>
    <div class="d-none d-sm-block">
        <ButtonWithIcon
            class="embedded-button"
            :button-title="$t('share_more')"
            :button-font-awesome-icon="['fas', 'plus']"
            icons-before-text
            round
            transparent
            @click="toggleEmbedSharing"
        />
        <CollapseTransition :duration="200">
            <div v-show="showEmbedSharing" class="p-2">
                <div class="input-group input-group-sm">
                    <input
                        ref="embedInput"
                        type="text"
                        class="form-control"
                        :value="iFrameLink(EmbedSizes.SMALL)"
                        readonly="readonly"
                    />
                    <button class="btn btn-outline-secondary" @click="togglePreviewModal">
                        {{ $t('show_more_options') }}
                    </button>
                </div>
                <!-- eslint-disable vue/no-v-html-->
                <div class="ng-scope" v-html="$t('share_disclaimer')"></div>
                <!-- eslint-enable vue/no-v-html-->
            </div>
        </CollapseTransition>
        <ModalWithBackdrop
            v-if="showPreviewModal"
            :title="$t('embed_map')"
            fluid
            @close="togglePreviewModal"
        >
            <div class="embed-preview-modal">
                <div
                    class="d-grid embed-preview-modal-tools"
                    :class="{ 'custom-size': isPreviewSizeCustom }"
                >
                    <select v-model="currentPreviewSize" class="form-select select-embed-size">
                        <option v-for="size in EmbedSizes" :key="size.i18nKey" :value="size">
                            {{ $t(size.i18nKey) }}
                        </option>
                    </select>
                    <div v-if="isPreviewSizeCustom" class="input-group">
                        <input v-model="customWidth" type="number" class="form-control" />
                        <span class="input-group-text">x</span>
                        <input v-model="customHeight" type="number" class="form-control" />
                    </div>
                    <MenuShareShortLinkInput
                        class="input-embed-code"
                        :with-text="false"
                        :short-link="iFrameLink(currentPreviewSize)"
                    />
                </div>
                <!-- eslint-disable vue/no-v-html-->
                <div v-html="iFrameLink(currentPreviewSize)"></div>
                <!-- eslint-enable vue/no-v-html-->
            </div>
        </ModalWithBackdrop>
    </div>
</template>

<script>
import MenuShareShortLinkInput from '@/modules/menu/components/share/MenuShareShortLinkInput.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'

/** @enum */
const EmbedSizes = {
    SMALL: {
        i18nKey: 'small_size',
        width: 400,
        height: 300,
    },
    MEDIUM: {
        i18nKey: 'medium_size',
        width: 600,
        height: 450,
    },
    LARGE: {
        i18nKey: 'big_size',
        width: 800,
        height: 600,
    },
    CUSTOM: {
        i18nKey: 'custom_size',
    },
}

export default {
    components: { MenuShareShortLinkInput, ModalWithBackdrop, ButtonWithIcon, CollapseTransition },
    props: {
        shortLink: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            showEmbedSharing: false,
            showPreviewModal: false,
            EmbedSizes,
            currentPreviewSize: EmbedSizes.SMALL,
            customWidth: EmbedSizes.SMALL.width,
            customHeight: EmbedSizes.SMALL.height,
        }
    },
    computed: {
        isPreviewSizeCustom() {
            return this.currentPreviewSize.i18nKey === EmbedSizes.CUSTOM.i18nKey
        },
    },
    methods: {
        iFrameLink(size) {
            let width = this.customWidth,
                height = this.customHeight
            if (size && size.width && size.height) {
                width = size.width
                height = size.height
            }
            return `<iframe src="${this.shortLink}" width="${width}" height="${height}" style="border:0" allow="geolocation"></iframe>`
        },
        toggleEmbedSharing() {
            this.showEmbedSharing = !this.showEmbedSharing
            // because of the dropdown animation, we have to wait for the next render
            // to select the embed HTML code
            this.$nextTick(() => {
                if (this.showEmbedSharing) {
                    this.$refs.embedInput.focus()
                    this.$refs.embedInput.select()
                }
            })
        },
        togglePreviewModal() {
            this.showPreviewModal = !this.showPreviewModal
        },
    },
}
</script>

<style lang="scss" scoped>
.select-embed-size {
    // removing the width: 100% coming from .form-control
    // so that the flex-fill from the link input work as expected
    width: auto;
}
.embed-preview-modal-tools {
    grid-template-columns: 1fr 2fr;
    &.custom-size {
        .input-embed-code {
            grid-column: 1 / 3;
        }
    }
}
</style>
