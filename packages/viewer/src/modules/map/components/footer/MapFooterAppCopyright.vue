<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const links = computed(() => {
    return [
        {
            label: 'ech_service_link_label',
            url: t('ech_service_link_href'),
        },
        {
            label: 'copyright_label',
            url: t('copyright_url'),
        },
        {
            label: 'legal_notice',
            url: t('legal_notice_url'),
        },
    ]
})
</script>

<template>
    <a
        v-for="(link, index) in links"
        :key="index"
        :href="link.url"
        target="_blank"
        :data-cy="`app-copyright-${index}`"
    >
        {{ t(link.label) }}
    </a>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/colors';
a {
    color: $black;
    text-decoration: initial;
}
a:hover,
a:focus {
    text-decoration: underline;
}
</style>
