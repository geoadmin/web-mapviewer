<script setup>
import { defineEmits, ref, toRefs } from 'vue'

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

const { mediaType, urlDescription, extraUrlDescription } = toRefs(props)
const emit = defineEmits(['generatedMediaLink'])

function createVideo() {
    return `<iframe src="${generatedMediaLink.value}" height="200" width="auto"></iframe>`
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
                class="feature-urlDescription form-control"
            />
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
            class="feature-urlDescription form-control"
        />
        <button
            v-if="urlDescription?.length > 0"
            class="btn btn-outline-secondary rounded-end"
            type="button"
            data-cy="text-input-clear"
            @click="addLink(generatedMediaLink)"
        >
            Add
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
