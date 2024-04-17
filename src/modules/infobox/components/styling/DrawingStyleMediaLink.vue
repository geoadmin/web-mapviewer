<script setup>
import { computed, defineEmits, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import MediaTypes from '@/modules/infobox/DrawingStyleMediaTypes.enum.js'
import { isValidUrl } from '@/utils/utils'

const i18n = useI18n()
const generatedMediaLink = ref(null)
const linkDescription = ref(null)
const props = defineProps({
    mediaType: {
        type: String,
        required: true,
    },
    urlLabel: {
        type: String,
        required: true,
    },
    descriptionLabel: {
        type: String,
        default: null,
    },
})

const { mediaType, urlLabel, descriptionLabel } = toRefs(props)
const emit = defineEmits(['generatedMediaLink'])

const urlValid = computed(() => {
    return isValidUrl(generatedMediaLink.value)
})

const urlLabelValid = computed(() => {
    return !descriptionLabel.value || linkDescription.value
})

function createVideo() {
    if (
        generatedMediaLink.value.includes('youtube.com/') ||
        generatedMediaLink.value.includes('youtu.be/')
    ) {
        //taken from https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url/71010058#71010058
        let youtubeRegExp = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/
        let videoId = youtubeRegExp.exec(generatedMediaLink.value)[3]
        return `<iframe src="${'https://www.youtube.com/embed/' + videoId}" height="200" width="auto"></iframe>`
    } else {
        return `<iframe src="${generatedMediaLink.value}" height="200" width="auto"></iframe>`
    }
}
function createImage() {
    return `<image src="${generatedMediaLink.value}" style="max-height:200px;"/>`
}
function createLink() {
    return `<a target="_blank" href="${generatedMediaLink.value}">${linkDescription.value}</a>`
}

function addLink(generatedMediaLink) {
    switch (mediaType.value) {
        case MediaTypes.link:
            emit('generatedMediaLink', createLink(generatedMediaLink))
            break
        case MediaTypes.image:
            emit('generatedMediaLink', createImage(generatedMediaLink))
            break
        case MediaTypes.video:
            emit('generatedMediaLink', createVideo(generatedMediaLink))
            break
    }
}
</script>

<template>
    <div class="px-3 pb-2">
        <div v-if="descriptionLabel" class="pb-2">
            <label class="form-label" for="drawing-style-media-link-description">
                {{ descriptionLabel }}
            </label>
            <div class="input-group d-flex needs-validation">
                <input
                    id="drawing-style-media-link-description"
                    v-model="linkDescription"
                    type="text"
                    :placeholder="i18n.t('link_description')"
                    data-cy="drawing-style-media-description-input"
                    class="feature-url-description form-control"
                    :class="{
                        'is-invalid': urlValid && !urlLabelValid,
                    }"
                />
                <div
                    v-if="!urlLabelValid && urlValid"
                    class="invalid-feedback-description invalid-feedback"
                    data-cy="drawing-style-media-empty-description-error"
                >
                    {{ i18n.t('empty_description') }}
                </div>
            </div>
        </div>
        <label class="form-label" for="drawing-style-media-url-description">
            {{ urlLabel }}
        </label>
        <div class="input-group d-flex needs-validation">
            <input
                id="drawing-style-media-url-description"
                v-model="generatedMediaLink"
                type="text"
                :placeholder="i18n.t('paste_url')"
                data-cy="drawing-style-media-url-input"
                class="feature-url-description form-control text-truncate"
                :class="{
                    'is-invalid': !urlValid && generatedMediaLink,
                }"
                @keydown.enter="addLink(generatedMediaLink)"
            />
            <button
                :disabled="!urlValid || !urlLabelValid"
                class="btn btn-outline-secondary rounded-end"
                type="button"
                data-cy="drawing-style-media-generate-button"
                @click="addLink(generatedMediaLink)"
            >
                {{ i18n.t('add') }}
            </button>
            <div
                v-if="generatedMediaLink && !urlValid"
                class="invalid-feedback-url invalid-feedback"
                data-cy="drawing-style-media-invalid-url-error"
            >
                {{ i18n.t('invalid_url') }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
