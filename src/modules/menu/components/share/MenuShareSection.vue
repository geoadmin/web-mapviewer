<template>
    <MenuSection
        :section-id="sectionId"
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
        <MenuShareEmbed class="menu-share-embed border-top" />
    </MenuSection>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuShareEmbed from '@/modules/menu/components/share/MenuShareEmbed.vue'
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'
import WarningMessage from '@/utils/WarningMessage.class'

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
    expose: ['close', 'sectionId'],
    data() {
        return { sectionId: 'shareSection' }
    },
    computed: {
        ...mapState({
            shortLink: (state) => state.share.shortLink,
            isSectionShown: (state) => state.share.isMenuSectionShown,
            isTrackingGeolocation: (state) =>
                state.geolocation.active && state.geolocation.tracking,
        }),
        ...mapGetters(['hasAnyLocalFile']),
    },
    methods: {
        ...mapActions([
            'generateShortLinks',
            'clearShortLinks',
            'toggleShareMenuSection',
            'closeShareMenuAndRemoveShortLinks',
            'addWarnings',
        ]),
        toggleShareMenu() {
            this.toggleShareMenuSection(dispatcher)
            if (!this.shortLink) {
                if (this.hasAnyLocalFile()) {
                    const warnings = [new WarningMessage('warn_share_local_file')]
                    this.addWarnings({ warnings, ...dispatcher })
                }
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
