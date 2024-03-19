<script setup>
import { computed, defineEmits, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { isValidUrl } from '@/utils/utils'

const i18n = useI18n()
const generatedMediaLink = ref('')
const linkDescription = ref('')
const props = defineProps({
    mediaType: {
        type: String,
        required: true,
    },
    urlDescription: {
        type: String,
        required: true,
    },
    extraUrlDescription: {
        type: String,
        default: null,
    },
})

const urlValid = computed(() => {
    if (!isValidUrl(generatedMediaLink.value)) {
        return false
    }
    return true
})

const urlDescriptionValid = computed(() => {
    if (!extraUrlDescription.value || linkDescription.value) {
        return true
    }
    return false
})
const { mediaType, urlDescription, extraUrlDescription } = toRefs(props)
const emit = defineEmits(['generatedMediaLink'])

function createVideo() {
    if (
        generatedMediaLink.value.includes('youtube.com/') ||
        generatedMediaLink.value.includes('youtu.be/')
    ) {
        let youtubeRegExp = new RegExp(
            '^.*(?:(?:youtu.be/|v/|vi/|u/w/|embed/|shorts/)|(?:(?:watch)??v(?:i)?=|&v(?:i)?=))([^#&?]*).*'
        )
        let videoId = youtubeRegExp.exec(generatedMediaLink.value)[1]
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
        case 'link':
            emit('generatedMediaLink', createLink(generatedMediaLink))
            break
        case 'image':
            emit('generatedMediaLink', createImage(generatedMediaLink))
            break
        case 'video':
            emit('generatedMediaLink', createVideo(generatedMediaLink))
            break
    }
}
</script>

<template>
    <div v-if="extraUrlDescription" class="pb-2">
        <label class="form-label" for="drawing-style-media-link-description">
            {{ extraUrlDescription }}
        </label>
        <div class="input-group d-flex needs-validation">
            <input
                id="drawing-style-media-link-description"
                ref="inputElement"
                v-model="linkDescription"
                type="text"
                placeholder="More info ..."
                data-cy="drawing-style-media-link-Description"
                class="feature-url-description form-control"
                :class="{
                    'is-invalid': urlValid && !urlDescriptionValid,
                }"
            />
            <div
                v-if="!urlDescriptionValid"
                class="invalid-feedback"
                data-cy="drawing-style-media-empty-description-error"
            >
                {{ i18n.t('empty_description') }}
            </div>
        </div>
    </div>
    <label class="form-label" for="drawing-style-media-url-description">
        {{ urlDescription }}
    </label>
    <div class="input-group d-flex needs-validation">
        <input
            id="drawing-style-media-url-description"
            ref="inputElement"
            v-model="generatedMediaLink"
            type="text"
            placeholder="Paste URL"
            data-cy="drawing-style-media-url-description"
            class="feature-url-description form-control"
            :class="{
                'is-invalid': !urlValid,
            }"
        />
        <button
            :disabled="!urlValid || !urlDescriptionValid"
            class="btn btn-outline-secondary rounded-end"
            type="button"
            data-cy="drawing-style-media-text-input-clear"
            @click="addLink(generatedMediaLink)"
        >
            Add
        </button>
        <div class="invalid-feedback" data-cy="drawing-style-media-invalid-url-error">
            {{ i18n.t('invalid_url') }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
