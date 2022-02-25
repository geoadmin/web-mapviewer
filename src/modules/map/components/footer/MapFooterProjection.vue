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
import { CoordinateSystems } from '@/utils/coordinateUtils'

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
            availableProjections: CoordinateSystems,
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
@include respond-above(md) {
    .map-projection {
        display: block;
    }
}
</style>
