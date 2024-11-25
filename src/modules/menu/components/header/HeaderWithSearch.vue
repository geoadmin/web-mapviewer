<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import HeaderLangSelector from '@/modules/menu/components/header/HeaderLangSelector.vue'
import HeaderMenuButton from '@/modules/menu/components/header/HeaderMenuButton.vue'
import HeaderSwissConfederationText from '@/modules/menu/components/header/HeaderSwissConfederationText.vue'
import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import FeedbackButton from '@/modules/menu/components/help/feedback/FeedbackButton.vue'
import HelpLink from '@/modules/menu/components/help/HelpLink.vue'
import MoreInfo from '@/modules/menu/components/help/MoreInfo.vue'
import ReportProblemButton from '@/modules/menu/components/help/ReportProblemButton.vue'
import SearchBar from '@/modules/menu/components/search/SearchBar.vue'

const dispatcher = { dispatcher: 'HeaderWithSearch.vue' }

const header = ref(null)

const store = useStore()
const { t } = useI18n()

const currentLang = computed(() => store.state.i18n.lang)
const currentTopicId = computed(() => store.state.topics.current)
const currentTopic = computed(() => store.getters.currentTopic)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const hasGiveFeedbackButton = computed(() => store.getters.hasGiveFeedbackButton)
const hasReportProblemButton = computed(() => store.getters.hasReportProblemButton)

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
    // an app reset means we keep the lang, the current topic, and its default background layer but everything else is thrown away
    // We keep the default background layer of the current topic because the app always set to `ech` topic and its default background layer before we can even get the topic from the URL
    const defaultBackgroundLayerId = currentTopic.value?.defaultBackgroundLayer?.id
    window.location = `${window.location.origin}?lang=${currentLang.value}&topic=${currentTopicId.value}&bgLayer=${defaultBackgroundLayerId}`
}
</script>

<template>
    <div ref="header" class="header" data-cy="app-header">
        <div class="header-content w-100 p-sm-0 p-md-1 d-flex align-items-center">
            <div class="logo-section justify-content-start p-1 d-flex flex-shrink-0 flex-grow-0">
                <div
                    class="p-1 cursor-pointer text-center"
                    data-cy="menu-swiss-flag"
                    @click="resetApp"
                >
                    <SwissFlag />
                </div>
                <HeaderSwissConfederationText
                    :current-lang="currentLang"
                    class="mx-2 cursor-pointer d-none d-lg-block search-header-swiss-confederation-text"
                    data-cy="menu-swiss-confederation-text"
                    @click="resetApp"
                />
            </div>
            <div
                class="search-bar-section d-flex-column flex-grow-1 me-2"
                :class="{ 'align-self-center': !hasDevSiteWarning }"
            >
                <SearchBar />
            </div>
            <HeaderMenuButton v-if="isPhoneMode" class="mx-1" />
        </div>
        <div class="header-settings-section" data-cy="header-settings-section">
            <FeedbackButton v-if="hasGiveFeedbackButton" show-as-link />
            <ReportProblemButton v-if="hasReportProblemButton" show-as-link />
            <MoreInfo small />
            <HelpLink small />
            <HeaderLangSelector id="menu-lang-selector" />
        </div>
        <!-- eslint-disable vue/no-v-html-->
        <div
            v-if="hasDevSiteWarning"
            class="header-warning-dev bg-danger text-white text-center text-wrap text-truncate overflow-hidden fw-bold p-1"
            v-html="t('test_host_warning')"
        />
        <!-- eslint-enable vue/no-v-html-->
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';

$animation-time: 0.5s;

.header {
    background: rgba($white, 0.9);
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    height: $header-height;
    transition: height $animation-time;
    z-index: $zindex-menu-header;
    .header-content {
        height: $header-height;
        transition: height $animation-time;
    }
}
.header-warning-dev {
    height: $dev-disclaimer-height;
    line-height: 1.1;
    &:hover {
        height: auto;
    }
}

.search-bar-section {
    // On desktop we limit hte maximum size of the search bar just
    // to have a better look and feel.
    max-width: 800px;
}

.header-settings-section {
    position: absolute;
    top: 0;
    right: 0;
    width: auto;
    display: flex;
}

.logo-section {
    min-width: $menu-tray-width;
}

.search-header-swiss-confederation-text,
.search-title {
    font-size: 0.825rem;
}

@include respond-below(lg) {
    .header-settings-section {
        // See MenuTray.vue where the help section is enable above lg
        display: none !important;
    }

    .logo-section {
        min-width: auto;
    }
}

@include respond-above(lg) {
    .header {
        height: 2 * $header-height;
        .header-content {
            height: 2 * $header-height;
            .menu-tray {
                top: 2 * $header-height;
            }
        }
    }
    .search-title {
        display: block;
    }
}
</style>
