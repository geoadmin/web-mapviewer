<template>
    <select
        class="form-control-xs"
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
