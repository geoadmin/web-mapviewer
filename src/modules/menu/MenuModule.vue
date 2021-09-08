<template>
    <transition name="slide-up">
        <div v-show="showHeader" class="header">
            <HeaderLoadingBar v-if="showLoadingBar" />
            <div class="header-content align-items-center p-1 flex-fill">
                <SwissFlag class="swiss-flag ml-1 mr-2" />
                <HeaderSwissConfederationText class="d-none d-sm-block" />
                <!-- we then let whatever was given in the slot be rendered here, that's where we expect to receive the search module from MapView.vue -->
                <slot />
                <HeaderMenuButton />
                <MenuTray class="menu-tray" />
                <div v-if="showAppVersion" class="app-version small">v{{ appVersion }}</div>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapState } from 'vuex'

import SwissFlag from './components/header/SwissFlag'
import HeaderMenuButton from './components/header/HeaderMenuButton'
import HeaderSwissConfederationText from './components/header/HeaderSwissConfederationText'

import MenuTray from './components/MenuTray'
import HeaderLoadingBar from '@/modules/menu/components/header/HeaderLoadingBar'
import { APP_VERSION, DEBUG } from '@/config'

export default {
    components: {
        HeaderLoadingBar,
        HeaderSwissConfederationText,
        HeaderMenuButton,
        SwissFlag,
        MenuTray,
    },
    data() {
        return {
            appVersion: APP_VERSION,
        }
    },
    computed: {
        ...mapState({
            showHeader: (state) => state.ui.showHeader,
            showLoadingBar: (state) => state.ui.showLoadingBar,
        }),
        showAppVersion: function () {
            return DEBUG
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/media-query.mixin';

.header {
    position: fixed;
    top: 0;
    left: 0;
    height: $header-height;
    width: 100%;
    background: $white;
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    // so that the menu is above the map overlay
    z-index: $zindex-overlay-default + 1;
    .header-content {
        display: flex;
        height: $header-height;
        .swiss-flag {
            height: 2rem;
            width: 2rem;
            min-height: 2rem;
            min-width: 2rem;
        }
        .menu-tray {
            position: fixed;
            top: $header-height;
            right: 0;
            background: $white;
            width: 95%;
            max-width: 40rem;
        }
    }
    .app-version {
        position: fixed;
        bottom: 0.1rem;
        left: 50%;
        transform: translate(-50%, 0);
        color: $gray-400;
    }
}
.slide-up-leave-active,
.slide-up-enter-active {
    transition: 0.2s;
}
.slide-up-enter {
    transform: translate(0, -100%);
}
.slide-up-leave-to {
    transform: translate(0, -100%);
}
@include respond-above(sm) {
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
