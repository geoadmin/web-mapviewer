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
            <div class="mx-2 flex-grow-1">
                <span class="float-start d-none d-lg-block">{{ $t('search_title') }}</span>
                <SearchBar class="search-bar" />
                <SearchResultList />
            </div>
            <HeaderMenuButton v-if="showMenuButton" />
        </div>
    </div>
</template>
<script>
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
    methods: {
        resetApp: function () {
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
