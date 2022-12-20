<template>
    <div v-if="showAppVersion" class="app-version">{{ appVersion }}</div>
</template>

<script>
import { APP_VERSION } from '@/config'
import { mapGetters } from 'vuex'

export default {
    data() {
        return {
            appVersion: APP_VERSION,
        }
    },
    computed: {
      ...mapGetters({
        showAppVersion: 'hasDevSiteWarning'
      }),
    }
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.app-version {
    color: $gray-500;
}
</style>
