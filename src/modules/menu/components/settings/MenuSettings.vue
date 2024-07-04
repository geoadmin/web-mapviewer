<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import MapFooterAppVersion from '@/modules/map/components/footer/MapFooterAppVersion.vue'
import LinksToolbar from '@/modules/menu/components/settings/LinksToolbar.vue'

const store = useStore()
const isPhoneMode = computed(() => store.getters.isPhoneMode)
</script>

<template>
    <div id="menu-settings" class="pb-1 text-center" data-cy="menu-settings-content">
        <div id="menu-lang-selector">
            <LangSwitchToolbar />
        </div>
        <div id="menu-links">
            <LinksToolbar />
        </div>
        <MapFooterAppVersion v-if="isPhoneMode" />
    </div>
</template>
