<script setup>
import { defineEmits, ref, toRefs } from 'vue'

const descriptionMediaLink = ref('')

const props = defineProps({
    descriptionTitle: {
        type: String,
        required: true,
    },
    extraDescriptionTitle: {
        type: String,
        default: null,
    },
})

const { descriptionTitle, extraDescriptionTitle } = toRefs(props)
const emit = defineEmits(['descriptionMediaLink'])

function addLink(descriptionMediaLink) {
    emit('descriptionMediaLink', descriptionMediaLink)
}
</script>

<template>
    <label class="form-label" for="drawing-style-feature-descriptionTitle">
        {{ descriptionTitle }}
    </label>
    <div class="input-group d-flex needs-validation">
        <input
            id="drawing-style-feature-descriptionTitle"
            ref="inputElement"
            v-model="descriptionMediaLink"
            type="text"
            data-cy="drawing-style-media-descriptionTitle"
            class="feature-descriptionTitle form-control"
        />
        <button
            v-if="descriptionTitle?.length > 0"
            class="btn btn-outline-group rounded-end"
            type="button"
            data-cy="text-input-clear"
            @click="addLink(descriptionMediaLink)"
        >
            <FontAwesomeIcon :icon="['fas', 'times-circle']" />
        </button>
    </div>

    <div v-if="extraDescriptionTitle" class="pt-2">
        <label class="form-label" for="drawing-style-feature-descriptionTitle">
            {{ extraDescriptionTitle }}
        </label>
        <div class="input-group d-flex needs-validation">
            <input
                id="drawing-style-feature-descriptionTitle"
                ref="inputElement"
                type="text"
                data-cy="drawing-style-media-descriptionTitle"
                class="feature-descriptionTitle form-control"
            />
            <button
                v-if="descriptionTitle?.length > 0"
                class="btn btn-outline-group rounded-end"
                type="button"
                data-cy="text-input-clear"
                @click="addLink(descriptionMediaLink)"
            >
                <FontAwesomeIcon :icon="['fas', 'times-circle']" />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
