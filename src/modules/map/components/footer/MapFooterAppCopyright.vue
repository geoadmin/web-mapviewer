<template>
    <div class="app-copyright">
        <a
            v-for="(link, index) in links"
            :key="index"
            :href="link.url"
            target="_blank"
            class="app-copyright-link"
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
@import '@/scss/variables-admin.module';
.app-copyright {
    display: flex;
    gap: 5px;
    &-link {
        color: $black;
        text-decoration: initial;
    }
    &-link:hover,
    &-link:focus {
        text-decoration: underline;
    }
}
</style>
