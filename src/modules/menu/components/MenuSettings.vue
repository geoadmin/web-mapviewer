<template>
    <div id="menu-settings" class="pb-1" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
        <div id="ui-mode-selector">
            <button
                v-for="mode in UIModes"
                :key="mode"
                class="btn"
                :class="{
                    'btn-danger': currentUiMode === mode,
                    'btn-default': currentUiMode !== mode,
                }"
                @click="changeUiMode(mode)"
            >
                {{ $t(getI18nKeyForUiMode(mode)) }}
            </button>
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import { UIModes } from '@/modules/store/modules/ui.store'

export default {
    components: {
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
                case UIModes.DESKTOP:
                    return 'desktop_redirect'
                case UIModes.TOUCH:
                    return 'mobile_redirect'
            }
            return null
        },
    },
}
</script>
