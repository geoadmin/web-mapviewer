<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { onMounted } from 'vue'
import { onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import DebugToolbar from '@/modules/menu/components/debug/DebugToolbar.vue'
import MenuTray from '@/modules/menu/components/menu/MenuTray.vue'
import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'

const dispatcher = { dispatcher: 'MenuModule.vue' }

const i18n = useI18n()
const store = useStore()

const showMenu = computed(() => store.state.ui.showMenu)

const isPhoneMode = computed(() => store.getters.isPhoneMode)
const isDesktopMode = computed(() => store.getters.isDesktopMode)
const isMenuShown = computed(() => store.getters.isMenuShown)
const isMenuTrayShown = computed(() => store.getters.isMenuTrayShown)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)

const menuTray = ref(null)

// Watch for changes on component mount
onMounted(() => {
    updateMenuTrayWidth()
    window.addEventListener('resize', updateMenuTrayWidth)
})

// Cleanup on component unmount
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateMenuTrayWidth)
})

const updateMenuTrayWidth = () => {
    if (menuTray.value) {
        store.dispatch('setMenuTrayWidth', {
            width: menuTray.value.offsetWidth,
            ...dispatcher,
        })
    }
}

function toggleMenu() {
    store.dispatch('toggleMenu', dispatcher)
}
</script>

<template>
    <div class="menu position-absolute w-100 h-100 start-0 top-0 pe-none">
        <!-- In order to place the drawing toolbox correctly (so that zoom/geolocation button are under, etc...)
             we place here an empty div that will then receive the HTML from the drawing toolbox. -->
        <div class="drawing-toolbox-in-menu position-absolute w-100"></div>
        <transition name="fade-in-out">
            <BlackBackdrop v-if="isPhoneMode && isMenuShown" @click="toggleMenu" />
        </transition>
        <div class="menu-tray-container position-absolute w-100 h-100">
        <DebugToolbar v-if="hasDevSiteWarning" class="position-absolute end-0 debug-toolbar" />
        <div
            class="menu-tray-container position-absolute w-100 h-100"
            :class="{
                'desktop-mode': isDesktopMode,
                'dev-disclaimer-present': hasDevSiteWarning,
            }"
        >
            <transition name="slide-up">
                <div
                    v-show="isMenuTrayShown"
                    ref="menuTray"
                    class="menu-tray"
                    :class="{
                        'desktop-mode': isDesktopMode,
                        'desktop-menu-closed': isDesktopMode && !isMenuShown,
                    }"
                    data-cy="menu-tray"
                >
                    <MenuTray
                        class="menu-tray-content"
                        :class="{
                            'shadow-lg': isDesktopMode,
                            'rounded-bottom': isDesktopMode,
                            'rounded-start-0': isDesktopMode,
                        }"
                        :compact="isDesktopMode"
                    />
                    <button
                        v-if="isDesktopMode"
                        class="button-open-close-desktop-menu btn btn-dark m-auto ps-4 pe-4 shadow-lg"
                        data-cy="menu-button"
                        @click="toggleMenu"
                    >
                        <FontAwesomeIcon :icon="showMenu ? 'caret-up' : 'caret-down'" />
                        <span class="ms-2">{{
                            i18n.t(showMenu ? 'close_menu' : 'open_menu')
                        }}</span>
                    </button>
                </div>
            </transition>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

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
    .debug-toolbar {
        top: 66%;
    }
    .menu-tray-container {
        pointer-events: none;
        max-height: calc(100% - $header-height);
        top: $header-height;
        z-index: $zindex-menu;
        &.dev-disclaimer-present {
            $menu-tray-offset: $header-height + $dev-disclaimer-height;
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
            .menu-tray-content {
                transition: opacity $animation-time;
            }
            max-width: $menu-tray-width;
        }
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
            max-height: calc(100% - 2 * $header-height - $openCloseButtonHeight);
            &.dev-disclaimer-present {
                max-height: calc(
                    100vh - 2 * $header-height - $dev-disclaimer-height - $openCloseButtonHeight
                );
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
