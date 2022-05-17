<template>
    <a v-for="(link, index) in links" :key="index" :href="link.url" target="_blank">
        {{ $t(link.label) }}
    </a>
</template>

<script>
export default {
    computed: {
        links() {
            return [
                {
                    label: 'ech_service_link_label',
                    url: `https://www.geo.admin.ch/${this.$i18n.locale}/home.html`,
                },
                {
                    label: 'copyright_label',
                    url: `https://www.geo.admin.ch/${this.$i18n.locale}/about-swiss-geoportal/impressum.html#copyright`,
                },
            ]
        },
    },
}
</script>
