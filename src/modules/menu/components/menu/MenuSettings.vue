<template>
    <div id="menu-settings" class="pb-1 text-center" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
        <div id="ui-mode-selector" class="btn-group">
            <ButtonWithIcon
                v-for="mode in UIModes"
                :key="mode"
                :danger="currentUiMode === mode"
                :button-title="$t(getI18nKeyForUiMode(mode))"
                :small="isDesktopMode"
                @click="setUiMode(mode)"
            />
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import { UIModes } from '@/store/modules/ui.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    components: {
        ButtonWithIcon,
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
