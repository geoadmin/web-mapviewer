<script setup lang="ts">
import log from '@swissgeo/log'
import { computed, ref } from 'vue'

import { languages as availableLanguages, type SupportedLang } from '@/modules/i18n'
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import useI18nStore from '@/store/modules/i18n.store'

const dispatcher = { name: 'HeaderLangSelector.vue' }

const i18nStore = useI18nStore()

const languages = ref<SupportedLang[]>(Object.keys(availableLanguages) as SupportedLang[])
const currentLang = computed(() => i18nStore.lang)

function changeLang(lang: SupportedLang) {
    log.debug('switching locale', lang)
    i18nStore.setLang(lang, dispatcher)
}
</script>

<template>
    <div class="lang-switch-header me-2">
        <HeaderLink
            v-for="lang in languages"
            :key="lang"
            :primary="currentLang === lang"
            :data-cy="`menu-lang-${lang}`"
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
