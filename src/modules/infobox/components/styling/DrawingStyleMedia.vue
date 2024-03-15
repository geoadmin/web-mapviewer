<script setup>
import { toRefs } from 'vue'

const props = defineProps({
    value: {
        type: String,
        required: true,
    },
    extraValue: {
        type: String,
        default: null,
    },
})
const { value, extraValue } = toRefs(props)
</script>

<template>
    <div>
        <label class="form-label" for="drawing-style-feature-description"> {{ value }} </label>
        <textarea
            id="drawing-style-feature-description"
            data-cy="drawing-style-media-description"
            class="feature-description form-control"
        ></textarea>
    </div>
    <div v-if="extraValue" class="pt-2">
        <label class="form-label" for="drawing-style-feature-description">
            {{ extraValue }}
        </label>
        <textarea
            id="drawing-style-feature-description"
            data-cy="drawing-style-media-description"
            class="feature-description form-control"
        ></textarea>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
</style>
