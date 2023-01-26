<template>
    <button
        class="link-btn btn"
        :class="{
            // Desktop mode classes
            'm-0 px-1 btn-xs btn-link custom-text-decoration': isDesktopMode,
            'text-black': isDesktopMode,
            // Mobile/tablet mode classes
            'mobile-view btn-sm mx-1': !isDesktopMode,
            'btn-light': !isDesktopMode,
        }"
        :title="$t('cms_link_button_title')"
        @click="openCmsLink"
    >
    {{ $t('cms_link_button_title') }}
    </button>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
    computed: {
        ...mapGetters(['isDesktopMode']),
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
        cmsUrl() {
            return `https://www.geo.admin.ch/${this.currentLang}' +
              '/map-viewer/map-viewer.html`
        }
    },
    methods: {
        openCmsLink() {
            window.open(this.cmsUrl, '_blank', 'noreferrer');
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.mobile-view {
    width: 70px;
}

.custom-text-decoration {
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
</style>
