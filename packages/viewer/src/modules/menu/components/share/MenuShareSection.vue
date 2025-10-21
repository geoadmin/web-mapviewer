<script setup lang="ts">
/** Section of the main menu dedicated to sharing the state of the map/app via a short link */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuShareEmbed from '@/modules/menu/components/share/MenuShareEmbed.vue'
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'
import useLayersStore from '@/store/modules/layers.store'
import useShareStore from '@/store/modules/share'
import useGeolocationStore from '@/store/modules/geolocation'

const { compact } = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits(['openMenuSection'])

const dispatcher = { name: 'MenuShareSection.vue' }

const { t } = useI18n()
const shareStore = useShareStore()
const layersStore = useLayersStore()
const geolocationStore = useGeolocationStore()

const sectionId = 'shareSection'

const shortLink = computed(() => shareStore.shortLink)
const isSectionShown = computed(() => shareStore.isMenuSectionShown)
const isTrackingGeolocation = computed(() => geolocationStore.active && geolocationStore.tracking)
const hasAnyLocalFile = computed(() => layersStore.hasAnyLocalFile)

function toggleShareMenu() {
    shareStore.toggleShareMenuSection(dispatcher)

    if (!shortLink.value) {
        shareStore.generateShortLinks(isTrackingGeolocation.value, dispatcher)
    } else {
        shareStore.clearShortLinks(dispatcher)
    }
}

function close() {
    shareStore.closeShareMenuAndRemoveShortLinks(dispatcher)
}

defineExpose({
    close,
    sectionId,
})
</script>

<template>
    <MenuSection
        :section-id="sectionId"
        :title="t('share')"
        :show-content="isSectionShown"
        data-cy="menu-share-section"
        secondary
        @click:header="toggleShareMenu"
        @open-menu-section="(id) => emits('openMenuSection', id)"
    >
        <div class="p-2">
            <MenuShareSocialNetworks
                v-if="shortLink"
                :short-link="shortLink"
            />
            <MenuShareInputCopyButton
                :input-text="shortLink ?? undefined"
                :label-text="'share_link'"
                :copy-text="'copy_url'"
                :copied-text="'copy_success'"
                class="p-2"
                :small="compact"
                :has-warning="hasAnyLocalFile"
            />
        </div>
        <MenuShareEmbed class="menu-share-embed border-top" />
    </MenuSection>
</template>
