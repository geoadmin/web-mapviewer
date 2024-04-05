<template>
    <div class="container-fluid ratings" :class="{ disabled }" @mouseleave="setPreviewRating(0)">
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

<script>
export default {
    props: {
        maxRating: {
            type: Number,
            default: 5,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['ratingChange'],
    data() {
        return {
            rating: 0,
            previewRating: 0,
            pristine: true,
        }
    },
    watch: {
        disabled(isNowDisabled) {
            if (isNowDisabled) {
                // removing any previewed rating if the rating switches to its disabled mode
                this.previewRating = 0
            }
        },
    },
    methods: {
        setPreviewRating(rating) {
            if (!this.disabled) {
                this.previewRating = rating
            }
        },
        setRating(rating) {
            if (!this.disabled) {
                this.pristine = false
                this.rating = rating
                this.$emit('ratingChange', this.rating)
            }
        },
        shouldStarBeChecked(starRating) {
            if (this.previewRating > 0) {
                return this.previewRating >= starRating
            }
            return this.rating >= starRating
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.ratings {
    color: $gray-500;
    .star.checked {
        color: $orange;
    }
    &.disabled {
        .star.checked {
            color: $gray-600;
        }
    }
}
</style>
