<template>
    <div
        class="container-fluid text-secondary"
        :class="{ pristine: pristine }"
        @mouseleave="setPreviewRating(0)"
    >
        <FontAwesomeIcon
            v-for="note in maxRating"
            :key="note"
            size="xl"
            icon="star"
            :class="{
                checked: shouldStarBeChecked(note),
            }"
            @mouseenter="setPreviewRating(note)"
            @click="setRating(note)"
        />
        <span v-show="!pristine" class="ms-2">
            <strong>{{ rating }} / {{ maxRating }}</strong>
        </span>
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
            previewedRating: 0,
            pristine: true,
        }
    },
    methods: {
        setRating(rating) {
            this.rating = rating
            this.pristine = false
            this.$emit('ratingChange', this.rating)
        },
        setPreviewRating(rating) {
            this.previewedRating = rating
        },
        shouldStarBeChecked(ratingForStar) {
            if (this.previewedRating === 0) {
                return this.rating >= ratingForStar
            }
            return this.previewedRating >= ratingForStar
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.checked {
    color: $orange;
}
</style>
