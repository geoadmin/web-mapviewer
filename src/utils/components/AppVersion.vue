<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { APP_VERSION } from '@/config/staging.config'
import { GITHUB_REPOSITORY } from '@/config/staging.config'

const store = useStore()
const appVersion = ref(APP_VERSION)

const isProd = computed(() => store.getters.isProductionSite)

function openGithubLink() {
    window.open(GITHUB_REPOSITORY + APP_VERSION, '_blank')
}
</script>

<template>
    <div
        class="app-version"
        :class="{ 'app-version-prod': isProd }"
        data-cy="app-version"
        @click="openGithubLink"
    >
        <font-awesome-icon :icon="['fab', 'github']" />
        {{ appVersion }}
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.app-version {
    color: $gray-800;
    word-spacing: 3px;
    cursor: pointer;
}

.app-version-prod {
    color: $gray-500;
}
</style>
