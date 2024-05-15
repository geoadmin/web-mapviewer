<script setup>
import { ref, toRefs } from 'vue'

import { languages as availableLanguages } from '../index'
import LangButton from './LangButton.vue'

const props = defineProps({
    showAsLinks: {
        type: Boolean,
        default: false,
    },
})
const { showAsLinks } = toRefs(props)

const languages = ref(Object.keys(availableLanguages))
</script>

<template>
    <div
        :class="{
            'lang-switch-menu p-1': !showAsLinks,
            'lang-switch-header me-2': showAsLinks,
        }"
    >
        <LangButton
            v-for="lang in languages"
            :key="lang"
            :lang="lang"
            :show-as-links="showAsLinks"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.lang-switch-menu {
    transition: max-height 0.3s linear;
}
</style>
