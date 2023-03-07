<template>
    <div class="menu">
        <!-- In order to place the drawing toolbox correctly (so that zoom/geolocation button are under, etc...)
             we place here an empty div that will then receive the HTML from the drawing toolbox. -->
        <div class="drawing-toolbox-in-menu"></div>
        <transition name="fade-in-out">
            <BlackBackdrop v-if="isPhoneMode && isMenuShown" @click="toggleMenu" />
        </transition>
        <HeaderWithSearch v-if="isHeaderShown" class="header" />
        <div
            class="toolbox-right"
            :class="{
                'dev-disclaimer-present': hasDevSiteWarning,
            }"
        >
            <GeolocButton
                v-if="!isFullscreenMode && !isEmbedded"
                :is-active="isGeolocationActive"
                :is-denied="isGeolocationDenied"
                @click="toggleGeolocation"
            />
            <ZoomButtons
                v-if="!isFullscreenMode"
                @zoom-in="increaseZoom"
                @zoom-out="decreaseZoom"
            />
            <CompassButton />
        </div>
        <div
            class="menu-tray-container"
            :class="{
                'desktop-mode': isDesktopMode,
                'dev-disclaimer-present': hasDevSiteWarning,
            }"
        >
            <transition name="slide-up">
                <div
                    v-show="isMenuTrayShown"
                    class="menu-tray"
                    :class="{
                        'desktop-mode': isDesktopMode,
                        'desktop-menu-closed': isDesktopMode && !isMenuShown,
                    }"
                    data-cy="menu-tray"
                >
                    <MenuTray
                        class="menu-tray-content"
                        :class="{ 'shadow-lg': isDesktopMode, 'rounded-bottom': isDesktopMode }"
                        :compact="isDesktopMode"
                    />
                    <button
                        v-if="isDesktopMode"
                        class="button-open-close-desktop-menu btn btn-dark m-auto ps-4 pe-4 shadow-lg"
                        data-cy="menu-button"
                        @click="toggleMenu"
                    >
                        <FontAwesomeIcon :icon="showMenu ? 'caret-up' : 'caret-down'" />
                        <span class="ms-1">{{ $t(showMenu ? 'close_menu' : 'open_menu') }}</span>
                    </button>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import BlackBackdrop from '@/modules/menu/components/BlackBackdrop.vue'
import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import MenuTray from '@/modules/menu/components/menu/MenuTray.vue'
import CompassButton from '@/modules/menu/components/toolboxRight/CompassButton.vue'
import GeolocButton from '@/modules/menu/components/toolboxRight/GeolocButton.vue'
import ZoomButtons from '@/modules/menu/components/toolboxRight/ZoomButtons.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    components: {
        FontAwesomeIcon,
        HeaderWithSearch,
        BlackBackdrop,
        CompassButton,
        ZoomButtons,
        GeolocButton,
        MenuTray,
    },
    computed: {
        ...mapState({
            isGeolocationActive: (state) => state.geolocation.active,
            isGeolocationDenied: (state) => state.geolocation.denied,
            showMenu: (state) => state.ui.showMenu,
            isFullscreenMode: (state) => state.ui.fullscreenMode,
            isEmbedded: (state) => state.ui.embeddedMode,
        }),
        ...mapGetters([
            'isHeaderShown',
            'isPhoneMode',
            'isDesktopMode',
            'isMenuShown',
            'isMenuTrayShown',
            'hasDevSiteWarning',
        ]),
    },
    methods: {
        ...mapActions(['toggleGeolocation', 'increaseZoom', 'decreaseZoom', 'toggleMenu']),
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
        position: relative;
    }
    .toolbox-right {
        float: right;
        position: relative;
        margin: $screen-padding-for-ui-elements;
        &.dev-disclaimer-present {
            margin-top: $screen-padding-for-ui-elements + $dev-disclaimer-height;
        }
    }
    .menu-tray-container {
        pointer-events: none;
        position: absolute;
        top: $header-height;
        bottom: 0;
        left: 0;
        width: 100%;
        &.dev-disclaimer-present {
            top: $header-height + $dev-disclaimer-height;
        }
        &.desktop-mode {
            bottom: 70px;
        }
    }
    .menu-tray {
        /* Don't activate pointer events right here, as this box is still a bit larger than the
        actual menu in desktop mode (includes right and left of close button) */
        position: absolute;
        display: grid;
        // The menu takes the whole available width, the open close button only as much as needed
        grid-template-rows: 1fr auto;
        z-index: $zindex-menu-tray;
        top: 0;
        left: 0;
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        transition: $animation-time;

        .menu-tray-content {
            pointer-events: all;
        }
        &.desktop-mode {
            .menu-tray-content {
                transition: opacity $animation-time;
            }
            max-width: $menu-tray-width;
        }
        $openCloseButtonHeight: 2.5rem;
        &.desktop-menu-closed {
            .menu-tray-content {
                opacity: 0;
            }
            transform: translate(0px, calc(-100% + #{$openCloseButtonHeight}));
        }
        .button-open-close-desktop-menu {
            pointer-events: all;
            height: $openCloseButtonHeight;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }
    }
}
@include respond-above(lg) {
    .menu {
        .menu-tray-container {
            top: 2 * $header-height;
            &.dev-disclaimer-present {
                top: 2 * $header-height + $dev-disclaimer-height;
            }
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
