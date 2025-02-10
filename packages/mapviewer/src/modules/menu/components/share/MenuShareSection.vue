<script setup>
/** Section of the main menu dedicated to sharing the state of the map/app via a short link */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuShareEmbed from '@/modules/menu/components/share/MenuShareEmbed.vue'
import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'

const { compact } = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits(['openMenuSection'])

const dispatcher = { dispatcher: 'MenuShareSection.vue' }

const store = useStore()
const { t } = useI18n()

const sectionId = 'shareSection'

const shortLink = computed(() => store.state.share.shortLink)
const isSectionShown = computed(() => store.state.share.isMenuSectionShown)
const isTrackingGeolocation = computed(
    () => store.state.geolocation.active && store.state.geolocation.tracking
)
const hasAnyLocalFile = computed(() => store.getters.hasAnyLocalFile)

function toggleShareMenu() {
    store.dispatch('toggleShareMenuSection', dispatcher)
    if (!shortLink.value) {
        store.dispatch('generateShortLinks', {
            withCrosshair: isTrackingGeolocation.value,
            ...dispatcher,
        })
    } else {
        store.dispatch('clearShortLinks', dispatcher)
    }
}

function close() {
    store.dispatch('closeShareMenuAndRemoveShortLinks', dispatcher)
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
                :input-text="shortLink"
                :label-text="'share_link'"
                :copy-text="'copy_url'"
                :copied-text="'copy_success'"
                class="p-2"
                :small="compact"
                :has-warning="hasAnyLocalFile()"
            />
        </div>
        <MenuShareEmbed class="menu-share-embed border-top" />
    </MenuSection>
</template>
