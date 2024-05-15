<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'LangButton.vue' }

const store = useStore()

const props = defineProps({
    lang: {
        type: String,
        required: true,
    },
    showAsLinks: {
        type: Boolean,
        default: false,
    },
})
const { lang, showAsLinks } = toRefs(props)

const currentLang = computed(() => store.state.i18n.lang)

function changeLang() {
    log.debug('switching locale', lang.value)
    store.dispatch('setLang', { lang: lang.value, ...dispatcher })
}
</script>

<template>
    <HeaderLink v-if="showAsLinks" :primary="currentLang === lang" @click="changeLang">
        {{ lang.toUpperCase() }}
    </HeaderLink>
    <button
        v-else
        class="btn mx-1"
        :class="{
            'btn-light': currentLang !== lang,
            'btn-primary': currentLang === lang,
        }"
        :title="lang.toUpperCase()"
        :data-cy="`menu-lang-${lang}`"
        @click="changeLang"
    >
        {{ lang.toUpperCase() }}
    </button>
</template>
