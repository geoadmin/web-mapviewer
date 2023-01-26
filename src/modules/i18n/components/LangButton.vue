<template>
    <HeaderLink v-if="isDesktopMode" :selected="currentLang === lang" @click="changeLang">
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

<script>
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import log from '@/utils/logging'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    components: { HeaderLink },
    props: {
        lang: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
    },
    methods: {
        ...mapActions(['setLang']),
        changeLang() {
            log.debug('switching locale', this.lang)
            this.setLang(this.lang)
        },
    },
}
</script>
