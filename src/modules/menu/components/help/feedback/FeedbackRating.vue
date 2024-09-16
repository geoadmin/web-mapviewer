<script setup>
import { ref, toRefs, watch } from 'vue'

const props = defineProps({
    maxRating: {
        type: Number,
        default: 5,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})
const { maxRating, disabled } = toRefs(props)

const emit = defineEmits(['ratingChange'])

const rating = ref(0)
const previewRating = ref(0)
const pristine = ref(true)

watch(disabled, (isNowDisabled) => {
    if (isNowDisabled) {
        // removing any previewed rating if the rating switches to its disabled mode
        previewRating.value = 0
    }
})

function setPreviewRating(newRating) {
    if (!disabled.value) {
        previewRating.value = newRating
    }
}
function setRating(newRating) {
    if (!disabled.value) {
        pristine.value = false
        rating.value = newRating
        emit('ratingChange', rating.value)
    }
}
function shouldStarBeChecked(starRating) {
    if (previewRating.value > 0) {
        return previewRating.value >= starRating
    }
    return rating.value >= starRating
}
</script>

<template>
    <div
        class="container-fluid ratings rounded p-1"
        :class="{ disabled }"
        @mouseleave="setPreviewRating(0)"
    >
        <FontAwesomeIcon
            v-for="note in maxRating"
            :key="note"
            size="2x"
            icon="star"
            class="star"
            :data-cy="`rate-feedback-${note}`"
            :class="{
                checked: shouldStarBeChecked(note),
            }"
            @mouseenter="setPreviewRating(note)"
            @click="setRating(note)"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.ratings {
    color: $gray-500;
    border: 1px solid white;
    .star.checked {
        color: $orange;
    }
    &.disabled {
        .star.checked {
            color: $gray-600;
        }
    }
    &.is-invalid {
        border: 1px solid $danger;
    }
}
</style>
