<template>
    <div class="menu-share-embed">
        <button
            class="btn btn-light btn-sm embedded-button"
            data-cy="menu-share-embed-button"
            @click="toggleEmbedSharing"
        >
            <FontAwesomeIcon :icon="`caret-${showEmbedSharing ? 'down' : 'right'}`" />
            <span class="ms-2">{{ $t('share_more') }}</span>
        </button>
        <CollapseTransition :duration="200">
            <div v-show="showEmbedSharing" class="p-2 card border-light bg-light">
                <div class="input-group input-group-sm">
                    <input
                        ref="embedInput"
                        type="text"
                        class="form-control"
                        :value="iFrameLink"
                        data-cy="menu-share-embed-simple-iframe-snippet"
                        readonly="readonly"
                        @focus="$event.target.select()"
                    />
                    <button
                        class="btn btn-outline-secondary"
                        data-cy="menu-share-embed-preview-button"
                        @click="togglePreviewModal"
                    >
                        {{ $t('show_more_options') }}
                    </button>
                </div>
                <!-- eslint-disable vue/no-v-html-->
                <div v-html="$t('share_disclaimer')"></div>
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
                    class="d-flex embed-preview-modal-tools mb-1"
                    :class="{ 'custom-size': isPreviewSizeCustom }"
                >
                    <select
                        v-model="currentPreviewSize"
                        class="embed-preview-modal-size-selector form-select w-auto"
                        data-cy="menu-share-embed-iframe-size-selector"
                    >
                        <option
                            v-for="size in EmbedSizes"
                            :key="size.i18nKey"
                            :value="size"
                            class="embed-preview-modal-size-selector-option"
                            :data-cy="`menu-share-embed-iframe-size-${size.i18nKey.toLowerCase()}`"
                        >
                            {{ $t(size.i18nKey) }}
                        </option>
                    </select>
                    <MenuShareShortLinkInput
                        class="flex-grow-1 ms-1"
                        :with-text="false"
                        :small="false"
                        :short-link="iFrameLink"
                        :copy-text="'copy_cta'"
                        :copied-text="'copy_done'"
                        data-cy="menu-share-embed-iframe-snippet"
                    />
                </div>
                <div v-if="isPreviewSizeCustom" class="input-group mb-1">
                    <input
                        v-model="customWidth"
                        type="number"
                        class="form-control"
                        data-cy="menu-share-embed-iframe-custom-width"
                    />
                    <span class="input-group-text">x</span>
                    <input
                        v-model="customHeight"
                        type="number"
                        class="form-control"
                        data-cy="menu-share-embed-iframe-custom-height"
                    />
                </div>
                <iframe
                    :title="$t('embed_map')"
                    :src="shortLink"
                    :style="`border: 0;width: ${iFrameWidth}px;height: ${iFrameHeight}px;max-width: 100%;max-height: 100%;`"
                    allow="geolocation"
                ></iframe>
                <!-- eslint-disable vue/no-v-html-->
                <div class="small" v-html="$t('share_disclaimer')"></div>
                <!-- eslint-enable vue/no-v-html-->
            </div>
        </ModalWithBackdrop>
    </div>
</template>

<script>
import MenuShareShortLinkInput from '@/modules/menu/components/share/MenuShareShortLinkInput.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'

/**
 * Different pre-defined sizes that an iFrame can take
 *
 * @enum
 */
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
        // no width height here, as it will be user specified
    },
}

/**
 * Component building iFrame code so that the user can share/incorporate a specific map to his/her
 * website.
 *
 * This iFrame generator comes with a modal that helps the user select the size he prefers.
 */
export default {
    components: {
        FontAwesomeIcon,
        MenuShareShortLinkInput,
        ModalWithBackdrop,
        CollapseTransition,
    },
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
        iFrameWidth() {
            return this.isPreviewSizeCustom ? this.customWidth : this.currentPreviewSize.width
        },
        iFrameHeight() {
            return this.isPreviewSizeCustom ? this.customHeight : this.currentPreviewSize.height
        },
        /**
         * Iframe HTML code snippet pointing to the short link
         *
         * @returns {String} HTML iframe code snippet
         */
        iFrameLink() {
            return `<iframe src="${this.shortLink}" width="${this.iFrameWidth}" height="${this.iFrameHeight}" style="border:0" allow="geolocation"></iframe>`
        },
    },
    methods: {
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
@import 'src/scss/media-query.mixin';

.menu-share-embed {
    display: none;
    @include respond-above(phone) {
        display: block;
    }
}
.embed-preview-modal-size-selector {
    cursor: pointer;
}
</style>
