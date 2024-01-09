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
            <div class="embed-preview-modal" :style="embedPreviewModalWidth">
                <div class="d-flex flex-row mb-2">
                    <select
                        v-model="currentPreviewSize"
                        class="embed-preview-modal-size-selector form-select"
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
                    <div v-if="isPreviewSizeCustom" class="d-flex flex-row ms-2">
                        <input
                            v-if="!customSize.fullWidth"
                            v-model="customSize.width"
                            type="number"
                            class="form-control text-center custom-preview-input"
                            data-cy="menu-share-embed-iframe-custom-width"
                        />
                        <input
                            v-else
                            class="form-control form-control-plaintext custom-preview-input text-center"
                            type="text"
                            value="100 %"
                            readonly
                            data-cy="menu-share-embed-iframe-custom-width"
                        />
                        <span class="p-2">
                            <font-awesome-icon :icon="['fas', 'xmark']" />
                        </span>
                        <input
                            v-model="customSize.height"
                            type="number"
                            class="form-control custom-preview-input text-center"
                            data-cy="menu-share-embed-iframe-custom-height"
                        />
                        <div class="align-self-center ps-2">
                            <div class="form-check">
                                <input
                                    id="fullWidthCheckbox"
                                    v-model="customSize.fullWidth"
                                    class="form-check-input"
                                    type="checkbox"
                                    value=""
                                    data-cy="menu-share-embed-iframe-full-width"
                                />
                                <label class="form-check-label" for="fullWidthCheckbox">
                                    {{ $t('full_width') }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-row mb-2">
                    <MenuShareInputCopyButton
                        class="flex-grow-1"
                        :small="false"
                        :input-text="iFrameLink"
                        data-cy="menu-share-embed-iframe-snippet"
                    />
                </div>
                <!-- we could use a v-html here to have the exact same code as iFrameLink(), but then each time -->
                <!-- we switch sizes the iframe is regenerated from scratch, making it reload the shortLink -->
                <!-- so I've opted to keep this piece of code for a better user experience -->
                <div class="d-flex justify-content-center mb-2">
                    <iframe
                        ref="iFramePreview"
                        :title="$t('embed_map')"
                        :src="shortLink"
                        :style="iFrameStyle"
                        allow="geolocation"
                    ></iframe>
                </div>
                <!-- eslint-disable vue/no-v-html-->
                <div class="small text-wrap text-center" v-html="$t('share_disclaimer')"></div>
                <!-- eslint-enable vue/no-v-html-->
            </div>
        </ModalWithBackdrop>
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'

import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

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
        MenuShareInputCopyButton,
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
            customSize: {
                width: EmbedSizes.SMALL.width,
                height: EmbedSizes.SMALL.height,
                fullWidth: false,
            },
        }
    },
    computed: {
        embedPreviewModalWidth() {
            // Uses the iframe's width as maximal width for the entire modal window
            let style = { 'max-width': this.iFrameWidth }
            if (this.isPreviewSizeCustom) {
                style['min-width'] = '630px'
            }
            return style
        },
        isPreviewSizeCustom() {
            return this.currentPreviewSize.i18nKey === EmbedSizes.CUSTOM.i18nKey
        },
        iFrameWidth() {
            if (this.isPreviewSizeCustom) {
                if (this.customSize.fullWidth) {
                    return '100%'
                }
                return `${this.customSize.width}px`
            }
            return `${this.currentPreviewSize.width}px`
        },
        iFrameHeight() {
            if (this.isPreviewSizeCustom) {
                return `${this.customSize.height}px`
            }
            return `${this.currentPreviewSize.height}px`
        },
        iFrameStyle() {
            return `border: 0;width: ${this.iFrameWidth};height: ${this.iFrameHeight};max-width: 100%;max-height: 100%;`
        },
        /**
         * Iframe HTML code snippet pointing to the short link
         *
         * @returns {String} HTML iframe code snippet
         */
        iFrameLink() {
            return `<iframe src="${this.shortLink}" style="${this.iFrameStyle}" allow="geolocation"></iframe>`
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
    max-width: 15rem;
}

.custom-preview-input {
    max-width: 6rem;
}
</style>
