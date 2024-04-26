<template>
    <div class="d-flex align-items-center-center gap-1 p-1 text-nowrap">
        <a
            v-for="(link, index) in links"
            :key="index"
            :href="link.url"
            target="_blank"
            :data-cy="`app-copyright-${index}`"
        >
            {{ $t(link.label) }}
        </a>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
        links() {
            return [
                {
                    label: 'ech_service_link_label',
                    url: `https://www.geo.admin.ch/${this.currentLang}/home.html`,
                },
                {
                    label: 'copyright_label',
                    url: this.$t('copyright_url'),
                },
            ]
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables-admin.module';
a {
    color: $black;
    text-decoration: initial;
    font-size: 0.6rem;
}
a:hover,
a:focus {
    text-decoration: underline;
}
</style>
