<template>
    <div class="app-version">{{ appVersion }}</div>
</template>

<script>
import { APP_VERSION } from '@/config'

export default {
    data() {
        return {
            appVersion: APP_VERSION,
        }
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.app-version {
    color: $gray-400;
}
</style>
