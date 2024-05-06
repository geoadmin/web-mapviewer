<script setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import MediaTypes from '@/modules/infobox/DrawingStyleMediaTypes.enum.js'
import TextInput from '@/utils/components/TextInput.vue'
import { isValidUrl } from '@/utils/utils'

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

const i18n = useI18n()
const generatedMediaLink = ref(null)
const linkDescription = ref(null)
const isFormValid = ref(false)
const activateValidation = ref(false)

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
    if (linkDescription.value) {
        return `<a target="_blank" href="${generatedMediaLink.value}">${linkDescription.value}</a>`
    } else {
        return `<a target="_blank" href="${generatedMediaLink.value}">${generatedMediaLink.value}</a>`
    }
}

function addLink(generatedMediaLink) {
    if (!validateForm()) {
        return
    }
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
    clearInput()
}

function clearInput() {
    generatedMediaLink.value = null
    linkDescription.value = null
    isFormValid.value = false
    activateValidation.value = false
}

function validateUrl(url) {
    if (!url) {
        return { valid: false, invalidMessage: 'no_url' }
    } else if (!isValidUrl(url)) {
        return { valid: false, invalidMessage: 'invalid_url' }
    }
    return { valid: true, invalidMessage: '' }
}

function validateForm() {
    activateValidation.value = true
    return isFormValid.value
}

function onUrlValidate(valid) {
    isFormValid.value = valid
}
</script>

<template>
    <div class="px-3 pb-2">
        <div v-if="descriptionLabel" class="pb-2">
            <div class="input-group d-flex needs-validation">
                <TextInput
                    v-model="linkDescription"
                    :label="descriptionLabel"
                    :activate-validation="activateValidation"
                    class="feature-url-description mb-2"
                    placeholder="link_description"
                    data-cy="drawing-style-media-description"
                />
            </div>
        </div>
        <div class="d-flex align-items-start">
            <TextInput
                v-model="generatedMediaLink"
                :label="urlLabel"
                :activate-validation="activateValidation"
                required
                class="feature-url-description mb-2"
                placeholder="paste_url"
                :validate="validateUrl"
                data-cy="drawing-style-media-url"
                @keydown.enter="addLink(generatedMediaLink)"
                @validate="onUrlValidate"
            >
                <button
                    class="btn btn-default btn-outline-group rounded-0 rounded-end"
                    type="button"
                    data-cy="drawing-style-media-generate-button"
                    @click="addLink(generatedMediaLink)"
                >
                    {{ i18n.t('add') }}
                </button>
            </TextInput>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
</style>
