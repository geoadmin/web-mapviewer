<template>
    <div id="menu-settings" class="pb-1 text-center" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
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
    data() {},
    computed: {},
}
</script>
