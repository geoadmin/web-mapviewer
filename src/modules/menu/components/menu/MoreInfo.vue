<template>
    <HeaderLink v-if="isDesktopMode" @click="openCmsLink">
        {{ $t('cms_link_button_title') }}
    </HeaderLink>
    <button
        v-else
        class="btn btn-sm btn-light mx-1"
        :title="$t('cms_link_button_title')"
        @click="openCmsLink"
    >
        {{ $t('cms_link_button_title') }}
    </button>
</template>

<script>
import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import { mapGetters } from 'vuex'

export default {
    components: { HeaderLink },
    computed: {
        ...mapGetters(['isDesktopMode']),
        cmsUrl() {
            return this.$t('cms_link_button_url')
        },
    },
    methods: {
        openCmsLink() {
            window.open(this.cmsUrl, '_blank', 'noreferrer')
        },
    },
}
</script>
