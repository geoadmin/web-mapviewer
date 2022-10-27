<template>
    <div id="menu-settings" class="pb-1 text-center" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
        <div id="ui-mode-selector" class="ui-mode-switch-toolbar p-1">
            <button
                v-for="mode in UIModes"
                :key="mode"
                class="btn"
                :class="{
                    'btn-light': currentUiMode !== mode,
                    'btn-primary': currentUiMode === mode,
                    'btn-sm': !isDesktopMode,
                }"
                :title="$t(getI18nKeyForUiMode(mode))"
                @click="setUiMode(mode)"
            >
                {{ $t(getI18nKeyForUiMode(mode)) }}
            </button>
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import { UIModes } from '@/store/modules/ui.store'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    components: {
        LangSwitchToolbar,
    },
    data() {
        return {
            UIModes,
        }
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
        ...mapState({
            currentUiMode: (state) => state.ui.mode,
        }),
    },
    methods: {
        ...mapActions(['setUiMode']),
        getI18nKeyForUiMode(mode) {
            switch (mode) {
                case UIModes.DESKTOP:
                    return 'desktop_redirect'
                case UIModes.PHONE:
                    return 'mobile_redirect'
            }
            return null
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.ui-mode-switch-toolbar {
    transition: max-height 0.3s linear;
    button {
        margin-right: 3px;
        margin-left: 3px;
    }
}
</style>
