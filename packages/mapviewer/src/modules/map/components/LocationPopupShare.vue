<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import MenuShareInputCopyButton from '@/modules/menu/components/share/MenuShareInputCopyButton.vue'
import MenuShareSocialNetworks from '@/modules/menu/components/share/MenuShareSocialNetworks.vue'

const { shareLinkUrlShorten } = defineProps({
    shareLinkUrlShorten: {
        type: String,
        default: null,
    },
})

const store = useStore()

const isDesktopMode = computed(() => store.getters.isDesktopMode)
</script>

<template>
    <!-- Online Tab -->
    <div
        id="nav-online"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-online-tab"
        data-cy="import-file-online-content"
    >
        <MenuShareSocialNetworks
            :short-link="shareLinkUrlShorten"
            class="pt-1"
        />
        <MenuShareInputCopyButton
            :input-text="shareLinkUrlShorten"
            :label-text="'share_link'"
            :copy-text="'copy_url'"
            :copied-text="'copy_success'"
            class="px-0 py-2"
            data-cy="location-popup-link-bowl-crosshair"
            :small="isDesktopMode"
        />
    </div>
</template>
