<template>
    <MenuSection
        :title="$t('share')"
        :show-content="isSectionShown"
        data-cy="menu-share-section"
        secondary
        @click:header="toggleShareMenu"
        @open-menu-section="(id) => $emit('openMenuSection', id)"
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
    emits: ['openMenuSection'],
    expose: ['close'],
    computed: {
        ...mapState({
            shortLink: (state) => state.share.shortLink,
            isSectionShown: (state) => state.share.isMenuSectionShown,
        }),
    },
    methods: {
        ...mapActions([
            'generateShortLink',
            'clearShortLink',
            'toggleShareMenuSection',
            'closeShareMenuAndRemoveShortlink',
        ]),
        toggleShareMenu() {
            this.toggleShareMenuSection()
            if (!this.shortLink) {
                this.generateShortLink()
            } else {
                this.clearShortLink()
            }
        },
        close() {
            this.closeShareMenuAndRemoveShortlink()
        },
    },
}
</script>
