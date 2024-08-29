<template>
    <a
        v-for="(link, index) in links"
        :key="index"
        :href="link.url"
        target="_blank"
        :data-cy="`app-copyright-${index}`"
    >
        {{ $t(link.label) }}
    </a>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
        /**
         * The language used for the geo.admin.ch link. Since there is no RM version of the page, we
         * fall back to DE here
         */
        linkLang() {
            const lang = this.currentLang
            if (lang.toLowerCase() == 'rm') {
                return 'de'
            }
            return lang
        },
        links() {
            return [
                {
                    label: 'ech_service_link_label',
                    url: `https://www.geo.admin.ch/${this.linkLang}/home.html`,
                },
                {
                    label: 'copyright_label',
                    url: this.$t('copyright_url'),
                },
                {
                    label: 'legal_notice',
                    url: this.$t('legal_notice_url'),
                },
            ]
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/scss/variables-admin.module';
a {
    color: $black;
    text-decoration: initial;
}
a:hover,
a:focus {
    text-decoration: underline;
}
</style>
