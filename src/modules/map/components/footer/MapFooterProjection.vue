<template>
    <select
        class="form-control-xs"
        :value="currentProjectionId"
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
import { mapState } from 'vuex'
import { CoordinateSystems } from '@/utils/coordinateUtils'

export default {
    data() {
        return {
            availableProjections: CoordinateSystems,
        }
    },
    computed: {
        ...mapState({
            currentProjectionId: (state) => state.map.projectionId,
        }),
    },
    methods: {
        onProjectionChange(event) {
            this.$store.commit('setMapProjection', event.target.value)
        },
    },
}
</script>
