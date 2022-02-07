<template>
    <div id="footer" class="align-items-center">
        <div id="footer-target-scale"></div>
        <div id="footer-target-mouse" class="flex-grow-1"></div>
        <div v-if="showAppVersion" class="mx-3 app-version small">v{{ appVersion }}</div>
        <a
            :href="`https://www.geo.admin.ch/${$i18n.locale}/about-swiss-geoportal/impressum.html#copyright`"
            target="_blank"
        >
            {{ $t('copyright_label') }}
        </a>
    </div>
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
        showAppVersion: function () {
            return DEBUG
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

#footer {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: $zindex-footer;
    width: 100%;
    height: $footer-height;
    font-size: 0.6rem;
    padding: 0 0.2rem;
    background: $white;
    display: flex;
    .app-version {
        color: $gray-400;
    }
}
</style>
