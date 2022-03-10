<template>
    <button
        type="button"
        data-cy="menu-button"
        class="btn"
        :class="{ 'btn-dark': isOpen }"
        @click="toggleMenuTray"
    >
        <strong>{{ $t(menuButtonText) }}</strong>
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
