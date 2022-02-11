<template>
    <div v-if="showAppVersion" class="app-version">v{{ appVersion }}</div>
</template>

<script>
import { APP_VERSION, DEBUG } from '@/config'

export default {
    data() {
        return {
            appVersion: APP_VERSION,
        }
    },
    computed: {
        showAppVersion() {
            return DEBUG
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.app-version {
    color: $gray-500;
}
</style>
