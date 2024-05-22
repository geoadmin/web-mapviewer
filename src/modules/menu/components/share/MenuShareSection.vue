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
        <div class="p-2">
            <MenuShareSocialNetworks :short-link="shortLink" />
            <MenuShareInputCopyButton
                :input-text="shortLink"
                :label-text="'share_link'"
                :copy-text="'copy_url'"
                :copied-text="'copy_success'"
                class="p-2"
                :small="compact"
            />
        </div>
        <MenuShareEmbed :short-link="embeddedShortLink" class="menu-share-embed border-top" />
    </MenuSection>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuShareEmbed from '@/modules/menu/components/share/MenuShareEmbed.vue'
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'

const dispatcher = { dispatcher: 'MenuShareSection.vue' }

/** Section of the main menu dedicated to sharing the state of the map/app via a short link */
export default {
    components: {
        MenuShareEmbed,
        MenuShareInputCopyButton,
        MenuShareSocialNetworks,
        MenuSection,
    },
    props: {
        compact: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['openMenuSection'],
    expose: ['close', 'id'],
    data() {
        return { id: 'shareSection' }
    },
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
            this.toggleShareMenuSection(dispatcher)
            if (!this.shortLink) {
                this.generateShortLinks({
                    withCrosshair: this.isTrackingGeolocation,
                    ...dispatcher,
                })
            } else {
                this.clearShortLinks(dispatcher)
            }
        },
        close() {
            this.closeShareMenuAndRemoveShortLinks(dispatcher)
        },
    },
}
</script>
