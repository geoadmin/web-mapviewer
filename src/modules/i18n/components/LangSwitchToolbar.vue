<template>
    <div
        :class="{
            'lang-switch-menu p-1': !isDesktopMode,
            'lang-switch-header me-2': isDesktopMode,
        }"
    >
        <LangButton v-for="lang in languages" :key="lang" :lang="lang" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { languages } from '../index'
import LangButton from './LangButton.vue'

export default {
    components: {
        LangButton,
    },
    data() {
        return {
            languages: Object.keys(languages),
        }
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.lang-switch-menu {
    transition: max-height 0.3s linear;
}
</style>
