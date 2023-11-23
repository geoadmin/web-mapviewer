<template>
    <div class="open-full-app-link m-2 px-2 bg-light border-1 rounded d-flex align-items-center">
        <SwissFlag :sm="true" class="my-1" />
        <a class="ms-1 fw-bold text-black" target="_blank" :href="urlWithoutEmbed">
            {{ linkMessage }}
        </a>
    </div>
</template>
<script>
import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import { useI18n } from 'vue-i18n'

export default {
    components: { SwissFlag },
    data() {
        return {
            currentHost: window.location.host,
        }
    },
    computed: {
        linkMessage() {
            return useI18n().t('view_on_mapgeoadminch_webmapviewer', { url: this.currentHost })
        },
        urlWithoutEmbed() {
            return window.location.href.replace('&embed=true', '').replace('?embed=true&', '?')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';
.open-full-app-link {
    position: absolute;
    z-index: $zindex-map + 1;
    a {
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
        cursor: pointer;
    }
}
</style>
