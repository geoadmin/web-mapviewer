<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import SwissFlag from '@/modules/menu/components/header/SwissFlag.vue'
import { transformUrlEmbedToMap } from '@/utils/utils'

const i18n = useI18n()

const currentHost = ref(window.location.host)

const linkMessage = computed(() =>
    i18n.t('view_on_mapgeoadminch_webmapviewer', { url: currentHost.value })
)
const urlWithoutEmbed = computed(() => {
    return transformUrlEmbedToMap(window.location.href)
})
</script>

<template>
    <div
        class="open-full-app-link m-2 px-2 bg-light border-1 rounded d-flex align-items-center"
        data-cy="open-full-app-link"
    >
        <SwissFlag :sm="true" class="my-1" />
        <a
            class="ms-1 fw-bold text-black"
            data-cy="open-full-app-link-anchor"
            target="_blank"
            :href="urlWithoutEmbed"
        >
            {{ linkMessage }}
        </a>
    </div>
</template>

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
