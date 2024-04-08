<script setup>
import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import LinksToolbar from '@/modules/menu/components/settings/LinksToolbar.vue'
</script>

<template>
    <div id="menu-settings" class="pb-1 text-center" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
        <div id="menu-links">
            <LinksToolbar />
        </div>
    </div>
</template>
