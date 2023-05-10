<template>
    <select
        class="map-projection form-control-xs"
        :value="displayedProjectionId"
        data-cy="mouse-position-select"
        @change="onProjectionChange"
    >
        <option
            v-for="projection in availableProjections"
            :key="projection.id"
            :value="projection.id"
        >
            {{ projection.label }}
        </option>
    </select>
</template>

<script>
import allCoordinateSystems from '@/utils/coordinateSystems'

export default {
    inject: ['getMap'],
    props: {
        displayedProjectionId: {
            type: String,
            required: true,
        },
    },
    emits: ['projectionChange'],
    data() {
        return {
            availableProjections: allCoordinateSystems,
        }
    },
    methods: {
        onProjectionChange(event) {
            this.$emit('projectionChange', event.target.value)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

.map-projection {
    display: none;
}
@media (any-hover: hover) {
    .map-projection {
        display: block;
    }
}
</style>
