<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import MenuTray from '@/modules/menu/components/menu/MenuTray.vue'
import useUIStore from '@/store/modules/ui'
import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'

const dispatcher: ActionDispatcher = { name: 'MenuModule.vue' }

const { t } = useI18n()
const uiStore = useUIStore()

function toggleMenu() {
    uiStore.toggleMenu(dispatcher)
}
</script>

<template>
    <div class="menu position-absolute pe-none start-0 top-0 h-100 w-100">
        <!-- In order to place the drawing toolbox correctly (so that zoom/geolocation button are under, etc...)
             we place here an empty div that will then receive the HTML from the drawing toolbox. -->
        <div class="drawing-toolbox-in-menu position-absolute w-100" />
        <transition name="fade-in-out">
            <BlackBackdrop
                v-if="uiStore.isPhoneMode && uiStore.isMenuShown"
                @click="toggleMenu"
            />
        </transition>
        <!-- NOTE: Below we need to use v-show and not v-if otherwise when the user toggle the full-screen while
         editing a Report a problem window he will loose his content -->
        <HeaderWithSearch
            v-show="uiStore.isHeaderShown"
            class="header"
        />
        <div
            class="menu-tray-container position-absolute h-100 w-100"
            :class="{
                'desktop-mode': uiStore.isDesktopMode,
                'dev-disclaimer-present': uiStore.hasDevSiteWarning,
            }"
        >
            <transition name="slide-up">
                <div
                    v-show="uiStore.isMenuTrayShown"
                    class="menu-tray"
                    :class="{
                        'desktop-mode': uiStore.isDesktopMode,
                        'desktop-menu-closed': uiStore.isDesktopMode && !uiStore.isMenuShown,
                    }"
                    data-cy="menu-tray"
                >
                    <MenuTray
                        class="menu-tray-content"
                        :class="{
                            'shadow-lg': uiStore.isDesktopMode,
                            'rounded-bottom': uiStore.isDesktopMode,
                            'rounded-start-0': uiStore.isDesktopMode,
                        }"
                        :compact="uiStore.isDesktopMode"
                    />
                    <button
                        v-if="uiStore.isDesktopMode"
                        class="button-open-close-desktop-menu btn btn-dark m-auto ps-4 pe-4 shadow-lg"
                        data-cy="menu-button"
                        @click="toggleMenu"
                    >
                        <FontAwesomeIcon :icon="uiStore.showMenu ? 'caret-up' : 'caret-down'" />
                        <span class="ms-2">{{
                            t(uiStore.showMenu ? 'close_menu' : 'open_menu')
                        }}</span>
                    </button>
                </div>
            </transition>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';
@import '@/scss/vue-transitions.mixin';

$animation-time: 0.5s;
$openCloseButtonHeight: 2.5rem;

.menu {
    z-index: $zindex-menu;
    // so that the user can click through this element (and we don't block interaction with the map)
    pointer-events: none;
    & > * {
        // re-activate interaction with all children of the menu
        pointer-events: all;
    }
    .dev-disclaimer-present {
        top: $dev-disclaimer-height;
    }
    .drawing-toolbox-in-menu {
        z-index: $zindex-drawing-toolbox;
    }
    .header {
        position: relative;
    }
    .debug-toolbar {
        top: 66%;
    }
    .menu-tray-container {
        pointer-events: none;
        max-height: calc(100% - $header-height);
        top: $header-height;
        z-index: $zindex-menu;
        &.dev-disclaimer-present {
            $menu-tray-offset: calc($header-height + $dev-disclaimer-height);
            top: $menu-tray-offset;
            max-height: calc(100% - $menu-tray-offset);
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
            max-width: $menu-tray-width;
            .menu-tray-content {
                transition: opacity $animation-time;
            }
        }
        &.desktop-menu-closed {
            transform: translate(0px, calc(-100% + #{$openCloseButtonHeight}));
            .menu-tray-content {
                opacity: 0;
            }
        }
        .button-open-close-desktop-menu {
            pointer-events: all;
            height: $openCloseButtonHeight;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }
    }
}

// transition definitions
@include fade-in-out($animation-time);
@include slide-up($animation-time);

@include respond-above(lg) {
    .menu {
        .menu-tray-container {
            top: 2 * $header-height;
            max-height: calc(100% - 2 * $header-height - $openCloseButtonHeight);
            &.dev-disclaimer-present {
                max-height: calc(
                    100vh - 2 * $header-height - $dev-disclaimer-height - $openCloseButtonHeight
                );
                top: calc(2 * $header-height + $dev-disclaimer-height);
            }
        }
    }
}

@include respond-below(phone) {
    .menu {
        .menu-tray {
            overflow: auto;
        }
    }
}
</style>
