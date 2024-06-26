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
                    class="mx-2 cursor-pointer search-header-swiss-confederation-text"
                    data-cy="menu-swiss-confederation-text"
                    @click="resetApp"
                />
            </div>
            <div
                class="search-bar-section d-flex-column flex-grow-1"
                :class="{ 'align-self-center': !hasDevSiteWarning }"
            >
                <SearchBar />
            </div>
            <HeaderMenuButton v-if="isPhoneMode" class="mx-1" />
        </div>
        <div class="header-settings-section" data-cy="header-settings-section">
            <LinksToolbar id="menu-links" :show-as-links="true" />
            <LangSwitchToolbar id="menu-lang-selector" :show-as-links="true" />
        </div>
        <!-- eslint-disable vue/no-v-html-->
        <div
            v-if="hasDevSiteWarning"
            class="header-warning-dev bg-danger text-white text-center text-wrap text-truncate overflow-hidden fw-bold p-1"
            v-html="$t('test_host_warning')"
        />
        <!-- eslint-enable vue/no-v-html-->
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import HeaderMenuButton from '@/modules/menu/components/header/HeaderMenuButton.vue'
import HeaderSwissConfederationText from '@/modules/menu/components/header/HeaderSwissConfederationText.vue'
import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import SearchBar from '@/modules/menu/components/search/SearchBar.vue'
import LinksToolbar from '@/modules/menu/components/settings/LinksToolbar.vue'

const dispatcher = { dispatcher: 'HeaderWithSearch.vue' }

export default {
    components: {
        SearchBar,
        HeaderMenuButton,
        HeaderSwissConfederationText,
        SwissFlag,
        LangSwitchToolbar,
        LinksToolbar,
    },
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
            currentTopicId: (state) => state.topics.current,
        }),
        ...mapGetters(['isPhoneMode', 'hasDevSiteWarning']),
    },
    mounted() {
        this.$nextTick(() => {
            // Initial height
            this.updateHeaderHeight()
            // Watch for changes in height
            window.addEventListener('resize', this.updateHeaderHeight)
        })
    },
    beforeUnmount() {
        // Remove the event listener when the component is destroyed
        window.removeEventListener('resize', this.updateHeaderHeight)
    },
    methods: {
        resetApp() {
            // an app reset means we keep the lang and the current topic but everything else is thrown away
            window.location = `${window.location.origin}?lang=${this.currentLang}&topic=${this.currentTopicId}`
        },

        updateHeaderHeight() {
            this.$store.dispatch('setHeaderHeight', {
                height: this.$refs.header.clientHeight,
                ...dispatcher,
            })
        },
    },
}
</script>

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
    display: none;
    font-size: 0.825rem;
}

@include respond-below(lg) {
    .header-settings-section {
        // See MenuTray.vue where the settings section is enable above lg
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
    .search-header-swiss-confederation-text,
    .search-title {
        display: block;
    }
}
</style>
