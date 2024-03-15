<script setup>
import { defineEmits, ref, toRefs } from 'vue'

const descriptionMediaLink = ref('')
const linkDescription = ref('')
const props = defineProps({
    mediaType: {
        type: String,
        required: true,
    },
    descriptionTitle: {
        type: String,
        required: true,
    },
    extraDescriptionTitle: {
        type: String,
        default: null,
    },
})

const { mediaType, descriptionTitle, extraDescriptionTitle } = toRefs(props)
const emit = defineEmits(['descriptionMediaLink'])

function createVideo() {
    return `<iframe src="${descriptionMediaLink.value}" height="200" width="auto"></iframe>`
}
function createImage() {
    return `<image src="${descriptionMediaLink.value}" style="max-height:200px;"/>`
}
function createLink() {
    return `<a target="_blank" href="${descriptionMediaLink.value}">${linkDescription.value}</a>`
}

function addLink(descriptionMediaLink) {
    switch (mediaType.value) {
        case 'link':
            emit('descriptionMediaLink', createLink(descriptionMediaLink))
            break
        case 'image':
            emit('descriptionMediaLink', createImage(descriptionMediaLink))
            break
        case 'video':
            emit('descriptionMediaLink', createVideo(descriptionMediaLink))
            break
    }
}
</script>

<template>
    <div v-if="extraDescriptionTitle" class="pb-2">
        <label class="form-label" for="drawing-style-feature-descriptionTitle">
            {{ extraDescriptionTitle }}
        </label>
        <div class="input-group d-flex needs-validation">
            <input
                id="drawing-style-feature-descriptionTitle"
                ref="inputElement"
                v-model="linkDescription"
                type="text"
                placeholder="More info ..."
                data-cy="drawing-style-media-descriptionTitle"
                class="feature-descriptionTitle form-control"
            />
        </div>
    </div>
    <label class="form-label" for="drawing-style-feature-descriptionTitle">
        {{ descriptionTitle }}
    </label>
    <div class="input-group d-flex needs-validation">
        <input
            id="drawing-style-feature-descriptionTitle"
            ref="inputElement"
            v-model="descriptionMediaLink"
            type="text"
            placeholder="Paste URL"
            data-cy="drawing-style-media-descriptionTitle"
            class="feature-descriptionTitle form-control"
        />
        <button
            v-if="descriptionTitle?.length > 0"
            class="btn btn-outline-secondary rounded-end"
            type="button"
            data-cy="text-input-clear"
            @click="addLink(descriptionMediaLink)"
        >
            Add
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
