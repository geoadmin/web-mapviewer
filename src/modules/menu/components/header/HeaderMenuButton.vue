<template>
    <button
        type="button"
        data-cy="menu-button"
        class="btn menu-button"
        :class="{ 'menu-button-active': isOpen }"
        @click="toggleMenuTray"
    >
        {{ $t(menuButtonText) }}
    </button>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            menuButtonText: (state) => (state.ui.showMenuTray ? 'close' : 'menu'),
            isOpen: (state) => state.ui.showMenuTray,
        }),
    },
    methods: {
        ...mapActions(['toggleMenuTray']),
    },
}
</script>

<style lang="scss" scoped>
.menu-button {
    font-weight: bold;

    &-active {
        background-color: #474949;
        color: #fff;
    }
}
</style>
