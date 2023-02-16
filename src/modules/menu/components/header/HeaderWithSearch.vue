<template>
    <div class="header d-flex">
        <LoadingBar v-if="showLoadingBar" />
        <div class="header-content w-100 p-1 d-flex justify-content-start">
            <div class="justify-content-start p-1 d-flex flex-shrink-0 flex-grow-0">
                <div class="p-1 cursor-pointer text-center" data-cy="menu-swiss-flag" @click="resetApp">
                    <SwissFlag />
                </div>
                <HeaderSwissConfederationText
                    :current-lang="currentLang"
                    class="mx-2 cursor-pointer search-header-swiss-confederation-text"
                    data-cy="menu-swiss-confederation-text"
                    @click="resetApp"
                />
            </div>
            <div
                class="search-bar-section mx-2 d-flex-column flex-grow-1"
                :class="{ 'align-self-center': !hasDevSiteWarning }"
            >
                <span class="float-start search-title">{{ $t('search_title') }}</span>
                <SearchBar />
                <!-- eslint-disable vue/no-v-html-->
                <div
                    v-if="hasDevSiteWarning"
                    class="header-warning-dev bg-danger rounded text-white text-center text-wrap text-truncate fw-bold overflow-hidden p-1"
                    v-html="$t('test_host_warning')"
                />
                <!-- eslint-enable vue/no-v-html-->
            </div>
            <div
                class="header-settings-section d-flex flex-shrink-0 flex-grow-0 ms-auto"
                data-cy="header-settings-section"
            >
                <FeedbackToolbar id="menu-feedback" :show-as-links="true" />
                <LangSwitchToolbar id="menu-lang-selector" />
            </div>
            <HeaderMenuButton v-if="isPhoneMode" />
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import HeaderMenuButton from '@/modules/menu/components/header/HeaderMenuButton.vue'
import HeaderSwissConfederationText from '@/modules/menu/components/header/HeaderSwissConfederationText.vue'
import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import FeedbackToolbar from '@/modules/menu/components/menu/feedback/FeedbackToolbar.vue'
import SearchBar from '@/modules/menu/components/search/SearchBar.vue'

import LoadingBar from '@/utils/LoadingBar.vue'
import { mapGetters, mapState } from 'vuex'

export default {
    components: {
        SearchBar,
        HeaderMenuButton,
        HeaderSwissConfederationText,
        SwissFlag,
        LoadingBar,
        LangSwitchToolbar,
        FeedbackToolbar,
    },
    computed: {
        ...mapState({
            showLoadingBar: (state) => state.ui.showLoadingBar,
            currentLang: (state) => state.i18n.lang,
        }),
        ...mapGetters(['currentTopicId', 'isPhoneMode', 'hasDevSiteWarning']),
    },
    methods: {
        resetApp() {
            // an app reset means we keep the lang and the current topic but everything else is thrown away
            window.location = `${window.location.origin}?lang=${this.currentLang}&topic=${this.currentTopicId}`
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

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
    &-warning-dev {
        height: 1.5em;
        line-height: 1.2;
        &:hover {
            height: auto;
        }
    }
}

.search-bar-section {
    // On desktop we limit hte maximum size of the search bar just
    // to have a better look and feel.
    max-width: 800px;
}

.search-header-swiss-confederation-text,
.search-title {
    display: none;
}

@include respond-below(lg) {
    .header-settings-section {
        // See MenuTray.vue where the settings section is enable above lg
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
    .search-header-swiss-confederation-text,
    .search-title {
        display: block;
    }
}
</style>
