<template>
    <div class="container-fluid ratings" @mouseleave="previewRating = 0">
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
            @mouseenter="previewRating = note"
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
    },
    emits: ['ratingChange'],
    data() {
        return {
            rating: 0,
            previewRating: 0,
            pristine: true,
        }
    },
    methods: {
        setRating(rating) {
            this.pristine = false
            if (this.rating === rating) {
                this.rating = 0
            } else {
                this.rating = rating
            }
            this.$emit('ratingChange', this.rating)
        },
        shouldStarBeChecked(starRating) {
            return (
                (this.previewRating > 0 && this.previewRating >= starRating) ||
                (this.previewRating === 0 && this.rating >= starRating)
            )
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
}
</style>
