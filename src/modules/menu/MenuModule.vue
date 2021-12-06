<template>
    <div>
        <transition name="slide-up">
            <div v-show="showHeader" class="header">
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
                    <!-- we then let whatever was given in the slot be rendered here,
                     that's where we expect to receive the search module from MapView.vue -->
                    <slot />
                    <HeaderMenuButton v-if="isUiInTouchMode" />
                </div>
            </div>
        </transition>
        <transition name="slide-up">
            <div
                v-if="showMenuTray"
                class="menu-tray"
                :class="{
                    'desktop-mode': !isUiInTouchMode,
                    'desktop-menu-closed': !isUiInTouchMode && closeMenuDesktopMode,
                }"
            >
                <MenuTray class="menu-tray-content" :compact="!isUiInTouchMode" />
                <ButtonWithIcon
                    class="d-none d-sm-block m-auto"
                    :button-font-awesome-icon="[
                        'fas',
                        closeMenuDesktopMode ? 'caret-down' : 'caret-up',
                    ]"
                    :button-title="$t(closeMenuDesktopMode ? 'open_menu' : 'close_menu')"
                    icons-before-text
                    dark
                    @click="closeMenuDesktopMode = !closeMenuDesktopMode"
                >
                </ButtonWithIcon>
            </div>
        </transition>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import SwissFlag from './components/header/SwissFlag.vue'
import HeaderMenuButton from './components/header/HeaderMenuButton.vue'
import HeaderSwissConfederationText from './components/header/HeaderSwissConfederationText.vue'

import MenuTray from './components/MenuTray.vue'
import HeaderLoadingBar from '@/modules/menu/components/header/HeaderLoadingBar.vue'
import { UIModes } from '@/modules/store/modules/ui.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon'

export default {
    components: {
        ButtonWithIcon,
        HeaderLoadingBar,
        HeaderSwissConfederationText,
        HeaderMenuButton,
        SwissFlag,
        MenuTray,
    },
    data() {
        return {
            closeMenuDesktopMode: false,
        }
    },
    computed: {
        ...mapState({
            showHeader: (state) => state.ui.showHeader,
            showLoadingBar: (state) => state.ui.showLoadingBar,
            stateShowMenuTray: (state) => state.ui.showMenuTray,
            currentLang: (state) => state.i18n.lang,
            currentTopic: (state) => state.topics.current,
            currentUiMode: (state) => state.ui.mode,
            isCurrentlyDrawing: (state) => state.ui.showDrawingOverlay,
        }),
        isUiInTouchMode: function () {
            return this.currentUiMode === UIModes.TOUCH
        },
        showMenuTray: function () {
            if (this.isUiInTouchMode) {
                return this.stateShowMenuTray && !this.isCurrentlyDrawing
            } else {
                return !this.isCurrentlyDrawing
            }
        },
    },
    methods: {
        resetApp: function () {
            // an app reset means we keep the lang and the current topic but everything else is thrown away
            window.location = `${window.location.origin}?lang=${this.currentLang}&topic=${this.currentTopic.id}`
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

.header {
    position: fixed;
    top: 0;
    left: 0;
    height: $header-height;
    transition: height 0.3s;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    // so that the menu is above the map overlay
    z-index: $zindex-overlay-default + 2;
    .header-content {
        transition: height 0.3s;
        height: $header-height;
    }
}
.menu-tray {
    position: absolute;
    z-index: $zindex-menu;
    top: $header-height;
    left: 0;
    width: 100vh;
    max-width: 100vw;
    max-height: calc(100vh - #{$header-height + $footer-height});
    overflow-y: auto;
    transition: 0.3s;
    &.desktop-mode {
        .menu-tray-content {
            transition: opacity 0.3s;
        }
        max-width: 22rem;
    }
    &.desktop-menu-closed {
        .menu-tray-content {
            opacity: 0;
        }
        transform: translate(0px, calc(-100% + 2.5rem));
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
    .menu-tray {
        top: 2 * $header-height;
    }
}
// transition definitions
.slide-up-leave-active,
.slide-up-enter-active {
    transition: 0.2s;
}
.slide-up-enter,
.slide-up-leave-to {
    transform: translate(0, -100%);
}
</style>
