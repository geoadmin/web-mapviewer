<template>
    <div id="menu-settings" class="pb-1 text-center" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
        <div id="menu-feedback">
             <FeedbackToolbar />
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import FeedbackToolbar from '@/modules/menu/components/menu/FeedbackToolbar.vue'

export default {
    components: {
        LangSwitchToolbar,
        FeedbackToolbar,
    },
    data() {
        return {}
    },
    computed: {},
}
</script>
