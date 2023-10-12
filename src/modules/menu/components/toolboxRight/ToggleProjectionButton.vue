<template>
    <button
        class="toolbox-button"
        type="button"
        :class="{ active: isMercatorTheCurrentProjection }"
        @click="toggleProjection"
    >
        <FontAwesomeIcon :icon="['fas', 'earth-europe']" />
    </button>
</template>
<script>
import { LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions, mapState } from 'vuex'

export default {
    components: { FontAwesomeIcon },
    computed: {
        ...mapState({
            currentProjection: (state) => state.position.projection,
        }),
        isMercatorTheCurrentProjection() {
            return this.currentProjection.epsg === WEBMERCATOR.epsg
        },
    },
    methods: {
        ...mapActions(['setProjection']),
        toggleProjection() {
            if (this.isMercatorTheCurrentProjection) {
                this.setProjection(LV95)
            } else {
                this.setProjection(WEBMERCATOR)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
