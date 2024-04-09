<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import HeaderMenuButton from '@/modules/header/components/HeaderMenuButton.vue'
import HeaderSwissConfederationText from '@/modules/header/components/HeaderSwissConfederationText.vue'
import SwissFlag from '@/modules/header/components/SwissFlag.vue'
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import SearchBar from '@/modules/menu/components/search/SearchBar.vue'
import LinksToolbar from '@/modules/menu/components/settings/LinksToolbar.vue'
import { useTippyTooltip } from '@/utils/useTippyTooltip'

const dispatcher = { dispatcher: 'HeaderModule.vue' }

const header = ref(null)

const i18n = useI18n()
const store = useStore()
const currentLang = computed(() => store.state.i18n.lang)
const currentTopicId = computed(() => store.state.topics.current)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)

if (hasDevSiteWarning.value) {
    useTippyTooltip('.header-warning-dev', { theme: 'danger', placement: 'bottom' })
}

onMounted(() => {
    nextTick(() => {
        // Initial height
        updateHeaderHeight()
        // Watch for changes in height
        window.addEventListener('resize', updateHeaderHeight)
    })
})

onBeforeUnmount(() => {
    // Remove the event listener when the component is destroyed
    window.removeEventListener('resize', updateHeaderHeight)
})

function updateHeaderHeight() {
    store.dispatch('setHeaderHeight', {
        height: header.value.clientHeight,
        ...dispatcher,
    })
}

function resetApp() {
    // an app reset means we keep the lang and the current topic but everything else is thrown away
    window.location = `${window.location.origin}?lang=${currentLang.value}&topic=${currentTopicId.value}`
}
</script>

<template>
    <div ref="header" data-cy="app-header">
        <div class="shadow w-100 d-flex align-items-center bg-white p-lg-1">
            <div
                class="logo-section justify-content-start d-flex p-1 cursor-pointer align-self-center"
                @click="resetApp"
            >
                <div class="p-1 pt-lg-2 cursor-pointer text-center" data-cy="menu-swiss-flag">
                    <SwissFlag />
                </div>
                <HeaderSwissConfederationText
                    class="d-none d-lg-block mx-2 p-1 cursor-pointer search-header-swiss-confederation-text"
                    data-cy="menu-swiss-confederation-text"
                />
            </div>
            <div
                class="d-flex flex-grow-1 align-self-stretch flex-column justify-content-center position-relative"
            >
                <div
                    class="d-none d-lg-flex position-absolute end-0 top-0"
                    data-cy="header-settings-section"
                >
                    <LinksToolbar :show-as-links="true" />
                    <LangSwitchToolbar />
                </div>
                <SearchBar class="search-bar m-0 p-1 px-lg-5" />
            </div>
            <HeaderMenuButton class="d-sm-none mx-1" />
        </div>
        <div
            v-if="hasDevSiteWarning"
            data-tippy-content="test_host_full_disclaimer"
            class="header-warning-dev bg-danger text-white text-center text-wrap text-truncate overflow-hidden fw-bold p-1"
        >
            {{ i18n.t('test_host_warning') }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

@include respond-above(lg) {
    .search-bar {
        // we make sure the search result won't cover the menu tray by pushing it a bit on the right
        max-width: 66vw;
    }
}
</style>