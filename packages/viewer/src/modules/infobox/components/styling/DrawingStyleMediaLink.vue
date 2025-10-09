<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { MediaType } from '@/modules/infobox/DrawingStyleMediaTypes.enum'
import TextInput, { type TextInputValidateResult } from '@/utils/components/TextInput.vue'
import { isValidUrl } from '@/utils/utils'

const { mediaType, urlLabel, descriptionLabel } = defineProps<{
    mediaType: MediaType
    urlLabel: string
    descriptionLabel?: string
}>()

const emit = defineEmits<{
    generatedMediaLink: [mediaLink: string]
}>()

const { t } = useI18n()
const generatedMediaLink = ref<string | undefined>(undefined)
const linkDescription = ref<string | undefined>(undefined)
const isFormValid = ref<boolean>(false)
const activateValidation = ref<boolean>(false)

function createVideo(): string {
    const url = generatedMediaLink.value as string
    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
        // taken from https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url/71010058#71010058
        const youtubeRegExp = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/
        const match = youtubeRegExp.exec(url)
        const videoId = match?.[3] ?? ''
        return `<iframe src="${'https://www.youtube.com/embed/' + videoId}" height="200" width="auto"></iframe>`
    } else {
        return `<iframe src="${url}" height="200" width="auto"></iframe>`
    }
}

function createImage(): string {
    return `<image src="${generatedMediaLink.value}" style="max-height:200px;"/>`
}

function createLink(): string {
    const url = generatedMediaLink.value
    if (linkDescription.value) {
        return `<a target="_blank" href="${url}">${linkDescription.value}</a>`
    } else {
        return `<a target="_blank" href="${url}">${url}</a>`
    }
}

function addLink(): void {
    if (!validateForm()) {
        return
    }
    switch (mediaType) {
        case MediaType.LINK:
            emit('generatedMediaLink', createLink())
            break
        case MediaType.IMAGE:
            emit('generatedMediaLink', createImage())
            break
        case MediaType.VIDEO:
            emit('generatedMediaLink', createVideo())
            break
    }
    clearInput()
}

function clearInput(): void {
    generatedMediaLink.value = undefined
    linkDescription.value = undefined
    isFormValid.value = false
    activateValidation.value = false
}

function validateUrl(url: string | undefined): { valid: boolean; invalidMessage: string } {
    if (!url) {
        return { valid: false, invalidMessage: 'no_url' }
    } else if (!isValidUrl(url)) {
        return { valid: false, invalidMessage: 'invalid_url' }
    }
    return { valid: true, invalidMessage: '' }
}

function validateForm(): boolean {
    activateValidation.value = true
    return isFormValid.value
}

function onUrlValidate(result: TextInputValidateResult): void {
    isFormValid.value = result.valid
}
</script>

<template>
    <div class="px-3 pb-2">
        <div
            v-if="descriptionLabel"
            class="d-flex pb-2"
        >
            <TextInput
                v-model="linkDescription"
                :label="descriptionLabel"
                :activate-validation="activateValidation"
                class="feature-url-description mb-2"
                placeholder="link_description"
                data-cy="drawing-style-media-description"
            />
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
                @keydown.enter="addLink()"
                @validate="onUrlValidate"
            >
                <button
                    class="btn btn-default btn-outline-group rounded-0 rounded-end"
                    type="button"
                    data-cy="drawing-style-media-generate-button"
                    @click="addLink()"
                >
                    {{ t('add') }}
                </button>
            </TextInput>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
</style>
