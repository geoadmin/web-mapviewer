<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { languages as availableLanguages } from '@/modules/i18n'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'HeaderLangSelector.vue' }

const store = useStore()

const languages = ref(Object.keys(availableLanguages))
const currentLang = computed(() => store.state.i18n.lang)

function changeLang(lang) {
    log.debug('switching locale', lang)
    store.dispatch('setLang', { lang, ...dispatcher })
}
</script>

<template>
    <div class="lang-switch-header me-2">
        <HeaderLink
            v-for="lang in languages"
            :key="lang"
            :primary="currentLang === lang"
            @click="changeLang(lang)"
        >
            {{ lang.toUpperCase() }}
        </HeaderLink>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.lang-switch-menu {
    transition: max-height 0.3s linear;
}
.lang-switch-header {
    display: flex;
}
</style>
