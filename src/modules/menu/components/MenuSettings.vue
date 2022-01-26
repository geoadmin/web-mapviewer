<template>
    <div id="menu-settings" class="pb-1" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
        <div id="ui-mode-selector" class="btn-group">
            <ButtonWithIcon
                v-for="mode in UIModes"
                :key="mode"
                :danger="currentUiMode === mode"
                :button-title="$t(getI18nKeyForUiMode(mode))"
                :small="currentUiMode === UIModes.MENU_ALWAYS_OPEN"
                @click="changeUiMode(mode)"
            />
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import { UIModes } from '@/modules/store/modules/ui.store'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

export default {
    components: {
        ButtonWithIcon,
        LangSwitchToolbar,
    },
    props: {
        currentUiMode: {
            type: String,
            required: true,
        },
    },
    data: function () {
        return {
            UIModes,
        }
    },
    methods: {
        changeUiMode: function (mode) {
            this.$emit('changeUiMode', mode)
        },
        getI18nKeyForUiMode: function (mode) {
            switch (mode) {
                case UIModes.MENU_ALWAYS_OPEN:
                    return 'desktop_redirect'
                case UIModes.MENU_OPENED_THROUGH_BUTTON:
                    return 'mobile_redirect'
            }
            return null
        },
    },
}
</script>
