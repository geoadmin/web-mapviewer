<template>
    <button
        class="toolbox-button"
        type="button"
        :class="{ active: isActive }"
        :title="$t(`tilt3d_${isActive ? 'active' : 'inactive'}`)"
        data-cy="3d-button"
        @click="toggle3d"
    >
        <img class="toolbox-button-icon" src="../../assets/button_3d.png" alt="3D" />
    </button>
</template>
<script>
import { mapActions, mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            isActive: (state) => state.ui.showIn3d,
        }),
    },
    methods: {
        ...mapActions(['setShowIn3d']),
        toggle3d() {
            this.setShowIn3d(!this.isActive)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/toolbox-buttons';
</style>
