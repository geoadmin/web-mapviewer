<template>
    <div class="menu">
        <!-- In order to place the drawing toolbox correctly (so that zoom/geolocation button are under, etc...)
             we place here an empty div that will then receive the HTML from the drawing toolbox. -->
        <div class="drawing-toolbox-in-menu"></div>
        <transition name="fade-in-out">
            <BlackBackdrop
                v-if="!shouldMenuTrayAlwaysBeVisible && showMenu"
                @click="toggleMenuTray"
            />
        </transition>
        <HeaderWithSearch v-show="showHeader" class="header" />
        <div class="toolbox-right">
            <GeolocButton
                class="mb-1"
                :is-active="isGeolocationActive"
                :is-denied="isGeolocationDenied"
                @click="toggleGeolocation"
            />
            <ZoomButtons @zoom-in="increaseZoom" @zoom-out="decreaseZoom" />
            <CompassButton />
        </div>
        <transition name="slide-up">
            <div
                v-show="showMenu"
                class="menu-tray"
                :class="{
                    'desktop-mode': shouldMenuTrayAlwaysBeVisible,
                    'desktop-menu-closed': shouldMenuTrayAlwaysBeVisible && !menuDesktopOpen,
                }"
                data-cy="menu-tray"
            >
                <MenuTray class="menu-tray-content" :compact="shouldMenuTrayAlwaysBeVisible" />
                <ButtonWithIcon
                    v-if="shouldMenuTrayAlwaysBeVisible"
                    class="button-open-close-desktop-menu m-auto"
                    data-cy="menu-button"
                    :button-font-awesome-icon="['fas', menuDesktopOpen ? 'caret-up' : 'caret-down']"
                    :button-title="$t(menuDesktopOpen ? 'close_menu' : 'open_menu')"
                    icons-before-text
                    dark
                    @click="toggleMenuDesktopOpen"
                >
                </ButtonWithIcon>
            </div>
        </transition>
    </div>
</template>

<script>
import BlackBackdrop from '@/modules/menu/components/BlackBackdrop.vue'
import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import MenuTray from '@/modules/menu/components/menu/MenuTray.vue'
import GeolocButton from '@/modules/menu/components/toolboxRight/GeolocButton.vue'
import ZoomButtons from '@/modules/menu/components/toolboxRight/ZoomButtons.vue'
import CompassButton from '@/modules/menu/components/toolboxRight/CompassButton.vue'
import { UIModes } from '@/store/modules/ui.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    components: {
        HeaderWithSearch,
        BlackBackdrop,
        CompassButton,
        ZoomButtons,
        GeolocButton,
        ButtonWithIcon,
        MenuTray,
    },
    computed: {
        ...mapState({
            showLoadingBar: (state) => state.ui.showLoadingBar,
            isFullscreenMode: (state) => state.ui.fullscreenMode,
            currentLang: (state) => state.i18n.lang,
            currentTopic: (state) => state.topics.current,
            currentUiMode: (state) => state.ui.mode,
            isCurrentlyDrawing: (state) => state.ui.showDrawingOverlay,
            isGeolocationActive: (state) => state.geolocation.active,
            isGeolocationDenied: (state) => state.geolocation.denied,
            menuDesktopOpen: (state) => state.ui.menuDesktopOpen,
        }),
        ...mapGetters(['showMenu', 'showHeader']),
        shouldMenuTrayAlwaysBeVisible() {
            return this.currentUiMode === UIModes.MENU_ALWAYS_OPEN
        },
    },
    methods: {
        ...mapActions([
            'toggleGeolocation',
            'increaseZoom',
            'decreaseZoom',
            'toggleMenuTray',
            'toggleMenuDesktopOpen',
        ]),
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
        $openCloseButtonHeight: 38px;
        .button-open-close-desktop-menu {
            height: $openCloseButtonHeight;
        }
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
            transform: translate(0px, calc(-100% + #{$openCloseButtonHeight}));
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
