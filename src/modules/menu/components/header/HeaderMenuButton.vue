<template>
    <button type="button" data-cy="menu-button" class="btn btn-default" @click="toggleMenuTray">
        <strong>{{ $t('menu') }}</strong>
    </button>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    methods: {
        ...mapActions(['toggleMenuTray']),
    },
}
</script>
