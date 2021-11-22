<template>
    <div>
        <transition name="slide-up">
            <div v-show="showHeader" class="header" :class="{ desktop: !isUiInTouchMode }">
                <HeaderLoadingBar v-if="showLoadingBar" />
                <div class="header-content align-items-center p-1 flex-fill">
                    <SwissFlag
                        class="swiss-flag ms-1 me-2 cursor-pointer"
                        data-cy="menu-swiss-flag"
                        @click="resetApp"
                    />
                    <HeaderSwissConfederationText
                        v-if="!isUiInTouchMode"
                        :current-lang="currentLang"
                        class="me-2 cursor-pointer"
                        data-cy="menu-swiss-confederation-text"
                        @click="resetApp"
                    />
                    <!-- we then let whatever was given in the slot be rendered here,
                     that's where we expect to receive the search module from MapView.vue -->
                    <slot />
                    <HeaderMenuButton v-if="isUiInTouchMode" />
                </div>
            </div>
        </transition>
        <transition :name="isUiInTouchMode ? 'slide-up' : 'slide-left'">
            <div
                v-if="showMenuTray"
                class="menu-tray"
                :class="{
                    'desktop-mode': !isUiInTouchMode,
                    'desktop-menu-closed': !isUiInTouchMode && closeMenuDesktopMode,
                }"
            >
                <MenuTray :compact="!isUiInTouchMode" />
                <ButtonWithIcon
                    v-if="!isUiInTouchMode"
                    class="menu-tray-desktop-close-button"
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
    width: 100%;
    background: $white;
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    // so that the menu is above the map overlay
    z-index: $zindex-overlay-default + 2;
    .header-content {
        display: flex;
        height: $header-height;
        .swiss-flag {
            height: 2rem;
            width: 2rem;
            min-height: 2rem;
            min-width: 2rem;
        }
    }
    &.desktop {
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
.menu-tray {
    position: absolute;
    z-index: $zindex-menu;
    top: $header-height;
    left: 0;
    width: 100vh;
    max-width: 100vw;
    transition: 0.3s;
    &.desktop-mode {
        top: 2 * $header-height;
        max-width: 22rem;
    }
    &.desktop-menu-closed {
        transform: translate(0px, calc(-100% + 2.5rem));
    }
}
// transition definitions
.slide-left-leave-active,
.slide-left-enter-active,
.slide-up-leave-active,
.slide-up-enter-active {
    transition: 0.2s;
}
.slide-left-enter,
.slide-left-leave-to {
    transform: translate(-100%, 0);
}
.slide-up-enter,
.slide-up-leave-to {
    transform: translate(0, -100%);
}
</style>
