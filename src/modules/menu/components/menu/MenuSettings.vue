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
                :small="currentUiMode === UIModes.DESKTOP"
                @click="changeUiMode(mode)"
            />
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import { UIModes } from '@/store/modules/ui.store'
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
    emits: ['changeUiMode'],
    data() {
        return {
            UIModes,
        }
    },
    methods: {
        changeUiMode(mode) {
            this.$emit('changeUiMode', mode)
        },
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
