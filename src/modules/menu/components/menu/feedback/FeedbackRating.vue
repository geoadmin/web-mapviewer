<template>
    <div class="container-fluid ratings">
        <FontAwesomeIcon
            v-for="note in maxRating"
            :key="note"
            size="2x"
            icon="star"
            class="star"
            :class="{
                checked: rating >= note,
            }"
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
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.ratings {
    color: $gray-500;
    .heart.checked {
        color: $danger;
    }
    .star.checked {
        color: $orange;
    }
}
</style>
