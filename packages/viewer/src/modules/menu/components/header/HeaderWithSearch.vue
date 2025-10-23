<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import AdditionalInfoCollapsable from '@/modules/menu/components/header/AdditionalInfoCollapsable.vue'
import ConfederationFullLogo from '@/modules/menu/components/header/ConfederationFullLogo.vue'
import HeaderLangSelector from '@/modules/menu/components/header/HeaderLangSelector.vue'
import HeaderMenuButton from '@/modules/menu/components/header/HeaderMenuButton.vue'
import FeedbackButton from '@/modules/menu/components/help/feedback/FeedbackButton.vue'
import HelpLink from '@/modules/menu/components/help/HelpLink.vue'
import ReportProblemButton from '@/modules/menu/components/help/ReportProblemButton.vue'
import SearchBar from '@/modules/menu/components/search/SearchBar.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import useUIStore from '@/store/modules/ui'
import useLayersStore from '@/store/modules/layers'
import useI18nStore from '@/store/modules/i18n'
import useTopicsStore from '@/store/modules/topics'

const dispatcher = { name: 'HeaderWithSearch.vue' }

const header = useTemplateRef('header')

const { t } = useI18n()
const uiStore = useUIStore()
const layersStore = useLayersStore()
const i18nStore = useI18nStore()
const topicsStore = useTopicsStore()

const currentBackground = computed(() => layersStore.currentBackgroundLayerId)
const currentLang = computed(() => i18nStore.lang)
const currentTopic = computed(() => topicsStore.currentTopic)
const currentTopicId = computed(() => topicsStore.current)
const hasDevSiteWarning = computed(() => uiStore.hasDevSiteWarning)
const hasGiveFeedbackButton = computed(() => uiStore.hasGiveFeedbackButton)
const hasReportProblemButton = computed(() => uiStore.hasReportProblemButton)
const isPhoneMode = computed(() => uiStore.isPhoneMode)

onMounted(() => {
    nextTick(() => {
        // Initial height
        updateHeaderHeight()
        // Watch for changes in height
        window.addEventListener('resize', updateHeaderHeight)
    }).catch((_) => {})
})
onBeforeUnmount(() => {
    // Remove the event listener when the component is destroyed
    window.removeEventListener('resize', updateHeaderHeight)
})

function updateHeaderHeight() {
    if (header.value?.clientHeight) {
        uiStore.setHeaderHeight(header.value.clientHeight, dispatcher)
    }
}

function resetApp() {
    // an app reset means we keep the lang, the current topic, and its default background layer but everything else is thrown away
    // We keep the default background layer of the current topic because the app always set to `ech` topic and its default background layer before we can even get the topic from the URL
    const defaultBackgroundLayerId =
        currentTopic.value?.defaultBackgroundLayer?.id ?? currentBackground.value

    window.location.href = `${window.location.origin}?lang=${currentLang.value}&topic=${currentTopicId.value}&bgLayer=${defaultBackgroundLayerId}`
}
</script>

<template>
    <div
        ref="header"
        class="header"
        data-cy="app-header"
    >
        <div class="header-content p-sm-0 p-md-1 d-flex align-items-center w-100">
            <ConfederationFullLogo
                class="cursor-pointer"
                @click="resetApp"
            />
            <div
                class="search-bar-section d-flex-column me-2 flex-grow-1"
                :class="{ 'align-self-center': !hasDevSiteWarning }"
            >
                <SearchBar />
            </div>
            <HeaderMenuButton
                v-if="isPhoneMode"
                class="mx-1"
            />
        </div>
        <div
            class="header-settings-section"
            data-cy="header-settings-section"
        >
            <FeedbackButton
                v-if="hasGiveFeedbackButton"
                show-as-link
            />
            <ReportProblemButton
                v-if="hasReportProblemButton"
                show-as-link
            />
            <AdditionalInfoCollapsable />
            <HelpLink small />
            <HeaderLangSelector
                id="menu-lang-selector"
                data-cy="menu-lang-selector"
            />
        </div>
        <div
            v-if="hasDevSiteWarning"
            class="header-warning-dev bg-danger fw-bold px-1 text-center text-white"
        >
            <TextTruncate
                text="test_host_warning"
                :max-lines="1"
                class="text-truncate"
            >
                {{ t('test_host_warning') }}
            </TextTruncate>
        </div>
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

.search-header-swiss-confederation-text,
.search-title {
    font-size: 0.825rem;
}

@include respond-below(lg) {
    .header-settings-section {
        // See MenuTray.vue where the help section is enable above lg
        display: none !important;
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
