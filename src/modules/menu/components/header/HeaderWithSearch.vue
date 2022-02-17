<template>
    <div class="header">
        <HeaderLoadingBar v-if="showLoadingBar" />
        <div class="header-content align-items-center p-1 d-flex justify-content-between">
            <div class="justify-content-start d-flex">
                <SwissFlag
                    class="swiss-flag ms-1 me-2 cursor-pointer"
                    data-cy="menu-swiss-flag"
                    @click="resetApp"
                />
                <HeaderSwissConfederationText
                    :current-lang="currentLang"
                    class="me-2 cursor-pointer d-none d-lg-block"
                    data-cy="menu-swiss-confederation-text"
                    @click="resetApp"
                />
            </div>
            <div class="mx-2 flex-grow-1 position-relative">
                <span class="float-start d-none d-lg-block">{{ $t('search_title') }}</span>
                <SearchBar class="search-bar" />
                <!-- eslint-disable vue/no-v-html-->
                <div
                    v-if="devSiteWarning"
                    class="header-warning-dev"
                    v-html="$t('test_host_warning')"
                ></div>
                <!-- eslint-enable vue/no-v-html-->
                <SearchResultList />
            </div>
            <HeaderMenuButton v-if="showMenuButton" />
        </div>
    </div>
</template>

<script>
import { ENVIRONMENT } from '@/config'
import HeaderLoadingBar from '@/modules/menu/components/header/HeaderLoadingBar.vue'
import HeaderMenuButton from '@/modules/menu/components/header/HeaderMenuButton.vue'
import HeaderSwissConfederationText from '@/modules/menu/components/header/HeaderSwissConfederationText.vue'
import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import SearchBar from '@/modules/menu/components/search/SearchBar.vue'
import SearchResultList from '@/modules/menu/components/search/SearchResultList.vue'

export default {
    components: {
        SearchBar,
        SearchResultList,
        HeaderMenuButton,
        HeaderSwissConfederationText,
        SwissFlag,
        HeaderLoadingBar,
    },
    props: {
        showLoadingBar: {
            type: Boolean,
            default: false,
        },
        showMenuButton: {
            type: Boolean,
            default: false,
        },
        currentLang: {
            type: String,
            required: true,
        },
        currentTopicId: {
            type: String,
            default: 'ech',
        },
    },
    data() {
        return {
            devSiteWarning: ENVIRONMENT !== 'production',
        }
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
.header {
    height: $header-height;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    position: relative;
    z-index: $zindex-menu;
    .header-content {
        height: $header-height;
    }
    &-warning-dev {
        border-radius: 0.25rem;
        background-color: $danger;
        color: $white;
        text-align: center;
        font-weight: bold;
        // Position element below its parent.
        position: absolute;
        top: 100%;
        left: 0;
        // Set width and cut off overflowing text with ellipsis.
        width: 40em;
        max-width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        // (line-)height and padding work together to cut off the second line.
        padding: 0.2em 0.5em;
        height: 1.5em;
        line-height: 1.2;
        &:hover {
            height: auto;
            white-space: normal;
        }
    }
}
@include respond-above(lg) {
    .header {
        height: 2 * $header-height;
        .header-content {
            height: 2 * $header-height;
            .swiss-flag {
                margin-top: 0.4rem;
                align-self: flex-start;
            }
            .menu-tray {
                top: 2 * $header-height;
            }
        }
    }
}
</style>
