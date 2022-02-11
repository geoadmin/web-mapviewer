<template>
    <a :href="link" target="_blank">
        {{ $t('copyright_label') }}
    </a>
</template>

<script>
export default {
    computed: {
        link() {
            return `https://www.geo.admin.ch/${this.$i18n.locale}/about-swiss-geoportal/impressum.html#copyright`
        },
    },
}
</script>
