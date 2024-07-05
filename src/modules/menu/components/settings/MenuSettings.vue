<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import LangSwitchToolbar from '@/modules/i18n/components/LangSwitchToolbar.vue'
import LinksToolbar from '@/modules/menu/components/settings/LinksToolbar.vue'
import AppVersion from '@/utils/components/AppVersion.vue'

const store = useStore()
const isPhoneMode = computed(() => store.getters.isPhoneMode)
</script>

<template>
    <div class="pb-1 text-center position-relative" data-cy="menu-settings-content">
        <div class="position-relative z-1">
            <LangSwitchToolbar />
        </div>
        <div class="position-relative z-1" :class="{ 'mb-3': isPhoneMode }">
            <LinksToolbar />
        </div>
        <AppVersion
            v-if="isPhoneMode"
            class="position-absolute bottom-0 left-0 z-0 ms-1 mobile-app-version"
        />
    </div>
</template>

<style lang="scss" scoped>
.mobile-app-version {
    font-size: 0.75rem;
}
</style>