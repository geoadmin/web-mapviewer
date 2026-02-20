<script setup lang="js">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { APP_VERSION } from '@/config/staging.config'
import { GITHUB_REPOSITORY } from '@/config/staging.config'

const cleanAppVersionRegex = /v\d+\.\d+\.\d+$/
const store = useStore()
const appVersion = ref(APP_VERSION)

const isProd = computed(() => store.getters.isProductionSite)

function openGithubReleaseLink() {
    const isAppVersionClean = appVersion.value.match(cleanAppVersionRegex)
    if (!isAppVersionClean) {
        openGithubRepoLink()
    } else {
        window.open(GITHUB_REPOSITORY + `/releases/tag/` + APP_VERSION, '_blank')
    }
}
function openGithubRepoLink() {
    window.open(GITHUB_REPOSITORY, '_blank')
}
</script>

<template>
    <div
        class="app-version"
        :class="{ 'app-version-prod': isProd }"
        data-cy="app-version"
    >
        <span
            class="githubIcon"
            @click="openGithubRepoLink"
        >
            <font-awesome-icon :icon="['fab', 'github']" />
        </span>
        <span
            class="app-version-link"
            @click="openGithubReleaseLink"
        >
            {{ appVersion }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.app-version {
    color: $gray-800;
    cursor: pointer;
}

.app-version-link {
    margin-left: 3px;
}

.githubIcon {
    margin-right: 3px;
}

.app-version-prod {
    color: $gray-500;
    cursor: pointer;
}
</style>
