<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { APP_VERSION } from '@/config'

const store = useStore()
const appVersion = ref(APP_VERSION)

const isProd = computed(() => store.getters.isProductionSite)
</script>

<template>
    <div class="app-version" :class="{ 'app-version-prod': isProd }" data-cy="app-version">
        {{ appVersion }}
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.app-version {
    color: $gray-800;
}

.app-version-prod {
    visibility: hidden;
}
</style>
