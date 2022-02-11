<template>
    <div class="menu">
        <!-- In order to place the drawing toolbox correctly (so that zoom/geolocation button are under, etc...)
             we place here an empty div that will then receive the HTML from the drawing toolbox. -->
        <div class="drawing-toolbox-in-menu"></div>
        <transition name="fade-in-out">
            <BlackBackdrop
                v-if="!shouldMenuTrayAlwaysBeVisible && showMenuTray"
                @click="toggleMenuTray"
            />
        </transition>
        <HeaderWithSearch
            v-show="showHeader"
            class="header"
            :show-loading-bar="showLoadingBar"
            :show-menu-button="!shouldMenuTrayAlwaysBeVisible"
            :current-lang="currentLang"
            :current-topic-id="currentTopic && currentTopic.id"
        />
        <div class="toolbox-right">
            <GeolocButton
                class="mb-1"
                :is-active="isGeolocationActive"
                :is-denied="isGeolocationDenied"
                @click="toggleGeolocation"
            />
            <ZoomButtons @zoom-in="increaseZoom" @zoom-out="decreaseZoom" />
        </div>
        <transition name="slide-up">
            <div
                v-show="showMenuTray"
                class="menu-tray"
                :class="{
                    'desktop-mode': shouldMenuTrayAlwaysBeVisible,
                    'desktop-menu-closed': shouldMenuTrayAlwaysBeVisible && closeMenuDesktopMode,
                }"
            >
                <MenuTray class="menu-tray-content" :compact="shouldMenuTrayAlwaysBeVisible" />
                <ButtonWithIcon
                    v-if="shouldMenuTrayAlwaysBeVisible"
                    class="m-auto"
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
import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import { mapActions, mapState } from 'vuex'

import MenuTray from './components/menu/MenuTray.vue'
import { UIModes } from '@/modules/store/modules/ui.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import GeolocButton from '@/modules/menu/components/toolboxRight/GeolocButton.vue'
import ZoomButtons from '@/modules/menu/components/toolboxRight/ZoomButtons.vue'
import BlackBackdrop from '@/modules/menu/components/BlackBackdrop.vue'

export default {
    components: {
        HeaderWithSearch,
        BlackBackdrop,
        ZoomButtons,
        GeolocButton,
        ButtonWithIcon,
        MenuTray,
    },
    data() {
        return {
            closeMenuDesktopMode: false,
        }
    },
    computed: {
        ...mapState({
            showLoadingBar: (state) => state.ui.showLoadingBar,
            stateShowMenuTray: (state) => state.ui.showMenuTray,
            isFullscreenMode: (state) => state.ui.fullscreenMode,
            currentLang: (state) => state.i18n.lang,
            currentTopic: (state) => state.topics.current,
            currentUiMode: (state) => state.ui.mode,
            isCurrentlyDrawing: (state) => state.ui.showDrawingOverlay,
            isGeolocationActive: (state) => state.geolocation.active,
            isGeolocationDenied: (state) => state.geolocation.denied,
        }),
        shouldMenuTrayAlwaysBeVisible: function () {
            return this.currentUiMode === UIModes.MENU_ALWAYS_OPEN
        },
        showHeader: function () {
            return !this.isFullscreenMode && !this.isCurrentlyDrawing
        },
        showMenuTray: function () {
            if (this.isFullscreenMode) {
                return false
            } else {
                if (this.shouldMenuTrayAlwaysBeVisible) {
                    return !this.isCurrentlyDrawing
                } else {
                    return this.stateShowMenuTray && !this.isCurrentlyDrawing
                }
            }
        },
    },
    methods: {
        ...mapActions(['toggleGeolocation', 'increaseZoom', 'decreaseZoom', 'toggleMenuTray']),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

$animation-time: 0.5s;

.menu {
    position: absolute;
    z-index: $zindex-menu;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // so that the user can click through this element (and we don't block interaction with the map)
    pointer-events: none;
    & > * {
        // re-activate interaction with all children of the menu
        pointer-events: all;
    }
    .drawing-toolbox-in-menu {
        position: relative;
        z-index: $zindex-drawing-toolbox;
    }
    .header {
        transition: height $animation-time;
        width: 100%;
        background: rgba($white, 0.9);
        box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
        position: relative;
        z-index: $zindex-menu;
        .header-content {
            transition: height $animation-time;
        }
    }
    .toolbox-right {
        float: right;
        position: relative;
        margin: $screen-padding-for-ui-elements;
    }
    .menu-tray {
        position: absolute;
        z-index: $zindex-menu-tray;
        top: $header-height;
        left: 0;
        width: 100%;
        max-width: 100%;
        max-height: calc(100% - #{$header-height});
        overflow-y: auto;
        transition: $animation-time;
        &.desktop-mode {
            .menu-tray-content {
                transition: opacity $animation-time;
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
}
@include respond-above(lg) {
    .menu {
        .menu-tray {
            top: 2 * $header-height;
        }
    }
}
// transition definitions
.fade-in-out-enter-active,
.fade-in-out-leave-active {
    transition: opacity $animation-time;
}
.fade-in-out-enter-from,
.fade-in-out-leave-to {
    opacity: 0;
}
.slide-up-leave-active,
.slide-up-enter-active {
    transition: $animation-time;
}
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translate(0, -100%);
}
.slide-left-leave-active,
.slide-left-enter-active,
.slide-right-leave-active,
.slide-right-enter-active {
    transition: $animation-time;
}
.slide-left-enter-from {
    transform: translate(-100%, 0);
}
.slide-left-leave-to {
    transform: translate(-100%, 0);
}
.slide-right-enter-from {
    transform: translate(100%, 0);
}
.slide-right-leave-to {
    transform: translate(100%, 0);
}
</style>
