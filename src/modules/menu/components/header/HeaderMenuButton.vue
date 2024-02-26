<template>
    <button
        type="button"
        data-cy="menu-button"
        class="btn menu-button"
        :class="{ 'menu-button-active': isOpen }"
        @click="toggleMenu({ dispatcher: 'HeaderMenuButton.vue' })"
    >
        {{ $t(menuButtonText) }}
    </button>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            menuButtonText: (state) => (state.ui.showMenu ? 'close' : 'menu'),
            isOpen: (state) => state.ui.showMenu,
        }),
    },
    methods: {
        ...mapActions(['toggleMenu']),
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
