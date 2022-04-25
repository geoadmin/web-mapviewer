<template>
    <MenuSection
        :title="$t('share')"
        data-cy="menu-share-section"
        secondary
        @click.once="generateShortLinkIfMNeeded"
    >
        <FontAwesomeIcon v-if="!shortLink" icon="spinner" spin size="2x" class="p-2" />
        <div v-if="shortLink" class="p-2">
            <MenuShareSocialNetworks :short-link="shortLink" class="pt-1" />
            <MenuShareShortLinkInput :short-link="shortLink" class="px-2 py-3" />
            <MenuShareEmbed :short-link="shortLink" class="pb-1" />
        </div>
    </MenuSection>
</template>

<script>
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuShareEmbed from '@/modules/menu/components/share/MenuShareEmbed.vue'
import MenuShareShortLinkInput from '@/modules/menu/components/share/MenuShareShortLinkInput.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'
import { mapActions, mapState } from 'vuex'

export default {
    components: {
        MenuShareEmbed,
        MenuShareShortLinkInput,
        MenuShareSocialNetworks,
        MenuSection,
    },
    data() {
        return {
            showEmbedSharing: false,
        }
    },
    computed: {
        ...mapState({
            shortLink: (state) => state.position.shortLink,
        }),
        iFrameLink() {
            return `<iframe src="${this.shortLink}" width="400" height="300" style="border:0" allow="geolocation"></iframe>`
        },
    },
    methods: {
        ...mapActions(['generateShortLink']),
        generateShortLinkIfMNeeded() {
            if (!this.shortLink) {
                this.generateShortLink()
            }
        },
        toggleEmbedSharing() {
            this.showEmbedSharing = !this.showEmbedSharing
        },
    },
}
</script>

<style lang="scss" scoped>
.embedded-button {
    font-size: 0.8rem;
}
</style>
