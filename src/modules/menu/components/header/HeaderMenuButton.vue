<template>
    <button type="button" data-cy="menu-button" class="btn btn-default" @click="toggleMenuTray">
        <strong>{{ $t(menuButtonText) }}</strong>
    </button>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            menuButtonText: (state) => (state.ui.showMenuTray ? 'close' : 'menu'),
        }),
    },
    methods: {
        ...mapActions(['toggleMenuTray']),
    },
}
</script>
