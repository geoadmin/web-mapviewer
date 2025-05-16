<script setup>
/**
 * Component building iFrame code so that the user can share/incorporate a specific map to his/her
 * website.
 *
 * This iFrame generator comes with a modal that helps the user select the size he prefers.
 */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import log from '@geoadmin/log'
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { IFRAME_EVENTS } from '@/api/iframePostMessageEvent.api'
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import {
    insertParameterIntoUrl,
    removeParamaterFromUrl,
    transformUrlMapToEmbed,
} from '@/utils/utils'

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

const embedInput = useTemplateRef('embedInput')
const showEmbedSharing = ref(false)
const showPreviewModal = ref(false)
const currentPreviewSize = ref(EmbedSizes.SMALL)
const zoomModeLabel = ref(null)
const labelWidth = ref(0)
const customSize = ref({
    width: EmbedSizes.SMALL.width,
    height: EmbedSizes.SMALL.height,
    fullWidth: false,
})
const copied = ref(false)

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const embedSource = ref(transformUrlMapToEmbed(window.location.href))
const noSimpleZoom = ref(false)
const embedPreviewModalWidth = computed(() => {
    // Uses the width of the zoomModeLabel to set the width of the modal
    // to avoid line breaks
    const style = {
        'max-width': `${Math.max(labelWidth.value, iFrameWidth.value)}px`,
        'min-width': `${Math.max(300, labelWidth.value)}px`,
    }
    if (isPreviewSizeCustom.value) {
        style['min-width'] = '630px'
    }
    return style
})
const isPreviewSizeCustom = computed(
    () => currentPreviewSize.value.i18nKey === EmbedSizes.CUSTOM.i18nKey
)
const iFrameWidth = computed(() => {
    if (isPreviewSizeCustom.value) {
        if (customSize.value.fullWidth) {
            return '100%'
        }
        return `${customSize.value.width}px`
    }
    return `${currentPreviewSize.value.width}px`
})
const iFrameHeight = computed(() => {
    if (isPreviewSizeCustom.value) {
        return `${customSize.value.height}px`
    }
    return `${currentPreviewSize.value.height}px`
})
const iFrameStyle = computed(
    () =>
        `border: 0;width: ${iFrameWidth.value};height: ${iFrameHeight.value};max-width: 100%;max-height: 100%;`
)
const iFrameLink = computed(
    () =>
        `<iframe src="${embedSource.value}" style="${iFrameStyle.value}" allow="geolocation"></iframe>`
)
const buttonIcon = computed(() => {
    if (copied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})

const hasAnyLocalFile = computed(() => store.getters.hasAnyLocalFile())

function toggleEmbedSharing() {
    showEmbedSharing.value = !showEmbedSharing.value
    // because of the dropdown animation, we have to wait for the next render
    // to select the embed HTML code
    nextTick(() => {
        if (showEmbedSharing.value) {
            embedInput.value.focus()
            embedInput.value.select()
        }
    })
}

function togglePreviewModal() {
    showPreviewModal.value = !showPreviewModal.value
    if (showPreviewModal.value) {
        if (zoomModeLabel.value) {
            //margin to display zooming mode label correctly
            labelWidth.value = zoomModeLabel.value.offsetWidth
        }
        window.addEventListener('message', onPreviewChange)
    } else {
        window.removeEventListener('message', onPreviewChange)
    }
}

function onPreviewChange(e) {
    if (e?.data?.type === IFRAME_EVENTS.CHANGE) {
        // see iframePostMessageEvent.api.js -> sendChangeEventToParent
        embedSource.value = e.data.payload.newUrl
    }
}

async function copyValue() {
    try {
        await navigator.clipboard.writeText(iFrameLink.value)
        copied.value = true
        // leaving the "Copied" text for the wanted delay, and then reverting to "Copy"
        setTimeout(() => {
            copied.value = false
        }, 3000)
    } catch (error) {
        log.error(`Failed to copy to clipboard:`, error)
    }
}

watch(
    () => route.query,
    () => {
        embedSource.value = transformUrlMapToEmbed(window.location.href)
    }
)

watch(noSimpleZoom, (value) => {
    const currentUrl = embedSource.value
    embedSource.value = value
        ? insertParameterIntoUrl(currentUrl, 'noSimpleZoom', true)
        : removeParamaterFromUrl(currentUrl, 'noSimpleZoom')
})
</script>

<template>
    <div class="menu-share-embed">
        <a
            class="d-flex align-items-center embed-btn text-decoration-none ps-2"
            :class="{ 'text-primary': showEmbedSharing, 'text-black': !showEmbedSharing }"
            data-cy="menu-share-embed-button"
            @click="toggleEmbedSharing"
        >
            <FontAwesomeIcon
                class="btn border-0 px-2"
                :class="{ 'text-primary': showEmbedSharing }"
                :icon="`caret-${showEmbedSharing ? 'down' : 'right'}`"
            />
            <span class="px-1">{{ t('share_more') }}</span>
        </a>
        <div
            v-show="showEmbedSharing"
            class="card border-light p-2 ps-4"
        >
            <div class="input-group input-group-sm">
                <input
                    ref="embedInput"
                    type="text"
                    class="form-control"
                    :value="iFrameLink"
                    data-cy="menu-share-embed-simple-iframe-snippet"
                    readonly="readonly"
                    @focus="$event.target.select()"
                    @click="$event.target.select()"
                />
                <GeoadminTooltip :tooltip-content="t('copy_cta')">
                    <button
                        data-cy="menu-share-embed-copy-button"
                        class="btn btn-outline-group rounded-0"
                        type="button"
                        @click="copyValue"
                    >
                        <FontAwesomeIcon
                            class="icon"
                            :icon="buttonIcon"
                            data-cy="menu-share-embed-copy-button-icon"
                        />
                    </button>
                </GeoadminTooltip>
                <button
                    class="btn btn-outline-group"
                    data-cy="menu-share-embed-preview-button"
                    @click="togglePreviewModal"
                >
                    {{ t('show_more_options') }}
                </button>
            </div>
            <!-- eslint-disable vue/no-v-html-->
            <div
                class="py-2"
                v-html="t('share_disclaimer')"
            />
            <!-- eslint-enable vue/no-v-html-->
        </div>
        <ModalWithBackdrop
            v-if="showPreviewModal"
            :title="t('embed_map')"
            fluid
            @close="togglePreviewModal"
        >
            <div
                class="embed-preview-modal"
                :style="embedPreviewModalWidth"
                data-cy="embed-preview-modal"
            >
                <div class="d-flex mb-2 flex-row">
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
                            {{ t(size.i18nKey) }}
                        </option>
                    </select>
                    <div
                        v-if="isPreviewSizeCustom"
                        class="d-flex ms-2 flex-row"
                    >
                        <input
                            v-if="!customSize.fullWidth"
                            v-model="customSize.width"
                            type="number"
                            class="form-control custom-preview-input text-center"
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
                                <label
                                    class="form-check-label"
                                    for="fullWidthCheckbox"
                                >
                                    {{ t('full_width') }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-check ms-2">
                    <input
                        id="toggleZoomModeCheckbox"
                        v-model="noSimpleZoom"
                        class="form-check-input"
                        type="checkbox"
                        data-cy="menu-share-embed-zoom-toggle"
                    />
                    <GeoadminTooltip :tooltip-content="t('toggle_zooming_mode_tooltip')">
                        <label
                            ref="zoomModeLabel"
                            class="form-check-label"
                            for="toggleZoomModeCheckbox"
                        >
                            {{ t('toggle_zooming_mode') }}
                        </label>
                    </GeoadminTooltip>
                </div>
                <div class="d-flex mb-2 flex-row">
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
                        :title="t('embed_map')"
                        :src="embedSource"
                        :style="iFrameStyle"
                        allow="geolocation"
                        data-cy="menu-share-embed-iframe-preview"
                    />
                </div>
                <!-- eslint-disable vue/no-v-html-->
                <div
                    class="small text-wrap text-center"
                    v-html="t('share_disclaimer')"
                />
                <div
                    v-if="hasAnyLocalFile"
                    class="d-flex justify-content-center mt-2 flex-row gap-2"
                    data-cy="warn-share-local-file-container"
                >
                    <FontAwesomeIcon
                        class="data-disclaimer-tooltip text-warning align-self-center"
                        icon="circle-exclamation"
                        data-cy="menu-external-disclaimer-icon-cloud"
                    />
                    <div
                        class="small text-wrap text-center"
                        data-cy="warn-share-local-file"
                        v-html="t('warn_share_local_file')"
                    />
                </div>
                <!-- eslint-enable vue/no-v-html -->
            </div>
        </ModalWithBackdrop>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/modules/menu/scss/menu-items';

.embed-btn {
    // Here we add the menu-item styling to the title only to avoid hover
    // on the content once the item has been opened
    @extend %menu-item;

    cursor: pointer;
    height: 2.75em;
    line-height: 2.75em;
}

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
