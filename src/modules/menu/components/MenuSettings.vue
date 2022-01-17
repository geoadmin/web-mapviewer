<template>
    <div id="menu-settings" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
    </div>
</template>

<script>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'

export default {
    components: {
        LangSwitchToolbar,
    },
}
</script>
