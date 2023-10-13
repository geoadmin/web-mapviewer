<template>
    <MenuSection
        id="shareSection"
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
            <MenuShareInputCopyButton
                :input-text="shortLink"
                :label-text="'share_link'"
                :copy-text="'copy_url'"
                :copied-text="'copy_success'"
                class="px-2 py-3"
            />
            <MenuShareEmbed :short-link="embeddedShortLink" class="pb-1" />
        </div>
    </MenuSection>
</template>

<script>
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuShareEmbed from '@/modules/menu/components/share/MenuShareEmbed.vue'
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'
import { mapActions, mapState } from 'vuex'

/** Section of the main menu dedicated to sharing the state of the map/app via a short link */
export default {
    components: {
        MenuShareEmbed,
        MenuShareInputCopyButton,
        MenuShareSocialNetworks,
        MenuSection,
    },
    emits: ['openMenuSection'],
    expose: ['close'],
    computed: {
        ...mapState({
            shortLink: (state) => state.share.shortLink,
            embeddedShortLink: (state) => state.share.embeddedShortLink,
            isSectionShown: (state) => state.share.isMenuSectionShown,
            isTrackingGeolocation: (state) =>
                state.geolocation.active && state.geolocation.tracking,
        }),
    },
    methods: {
        ...mapActions([
            'generateShortLinks',
            'clearShortLinks',
            'toggleShareMenuSection',
            'closeShareMenuAndRemoveShortLinks',
        ]),
        toggleShareMenu() {
            this.toggleShareMenuSection()
            if (!this.shortLink) {
                this.generateShortLinks(this.isTrackingGeolocation)
            } else {
                this.clearShortLinks()
            }
        },
        close() {
            this.closeShareMenuAndRemoveShortLinks()
        },
    },
}
</script>
