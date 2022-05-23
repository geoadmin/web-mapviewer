<template>
    <MenuSection
        :title="$t('share')"
        data-cy="menu-share-section"
        secondary
        @click="toggleShortLinkUpdate"
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

/** Section of the main menu dedicated to sharing the state of the map/app via a short link */
export default {
    components: {
        MenuShareEmbed,
        MenuShareShortLinkInput,
        MenuShareSocialNetworks,
        MenuSection,
    },
    data() {
        return {
            /** Keeping track of the visibility of the share section */
            isSectionShown: false,
        }
    },
    computed: {
        ...mapState({
            shortLink: (state) => state.share.shortLink,
        }),
    },
    methods: {
        ...mapActions(['generateShortLink', 'setKeepUpdatingShortLink']),
        generateShortLinkIfMNeeded() {
            if (!this.shortLink) {
                this.generateShortLink()
            }
        },
        toggleShortLinkUpdate() {
            this.isSectionShown = !this.isSectionShown
            // first time here, shortLink is not yet defined
            if (this.isSectionShown && !this.shortLink) {
                this.generateShortLink()
            }
            this.setKeepUpdatingShortLink(this.isSectionShown)
        },
    },
}
</script>
